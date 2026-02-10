
import React, { useState } from 'react';
import { Layout, Library, Zap, Brain, Trophy, Menu, X, Plus } from 'lucide-react';
import { View, ReadingSession, ReadingText } from './types';
import Dashboard from './components/Dashboard';
import RSVPReader from './components/RSVPReader';
import RetentionTool from './components/RetentionTool';
import { geminiService } from './services/geminiService';

const INITIAL_SESSIONS: ReadingSession[] = [
  { id: '1', timestamp: Date.now() - 172800000, wpm: 245, comprehensionScore: 80, textTitle: 'The Future of AI', category: 'Science' },
  { id: '2', timestamp: Date.now() - 86400000, wpm: 280, comprehensionScore: 70, textTitle: 'Mindfulness Basics', category: 'Self-help' },
];

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [sessions, setSessions] = useState<ReadingSession[]>(INITIAL_SESSIONS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentText, setCurrentText] = useState<ReadingText | null>(null);
  const [trainingPhase, setTrainingPhase] = useState<'reading' | 'retention' | 'idle'>('idle');
  const [sessionWpm, setSessionWpm] = useState(0);

  const startTraining = (text: ReadingText) => {
    setCurrentText(text);
    setTrainingPhase('reading');
    setView('train');
    setIsSidebarOpen(false);
  };

  const handleReadingComplete = (wpm: number) => {
    setSessionWpm(wpm);
    setTrainingPhase('retention');
  };

  const handleRetentionComplete = (score: number) => {
    if (currentText) {
      const newSession: ReadingSession = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        wpm: sessionWpm,
        comprehensionScore: score,
        textTitle: currentText.title,
        category: currentText.category
      };
      setSessions([...sessions, newSession]);
    }
    setTrainingPhase('idle');
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-6 right-6 z-50 p-3 bg-white border border-slate-200 text-slate-600 rounded-full shadow-lg"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight text-slate-800">Lumina Read</span>
          </div>

          <nav className="flex-1 space-y-2">
            <NavItem 
              active={view === 'dashboard'} 
              icon={<Layout size={20} />} 
              label="Overview" 
              onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              active={view === 'library'} 
              icon={<Library size={20} />} 
              label="Library" 
              onClick={() => { setView('library'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              active={view === 'train' || (view === 'library' && currentText === null)} 
              icon={<Brain size={20} />} 
              label="Training Lab" 
              onClick={() => { 
                if (currentText) setView('train');
                else setView('library');
                setIsSidebarOpen(false); 
              }}
            />
            <NavItem 
              active={view === 'assess'} 
              icon={<Trophy size={20} />} 
              label="Achievements" 
              onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }}
            />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-50">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">Your Progress</p>
              <p className="text-sm font-medium text-slate-600">You're in the top 15% of readers this week!</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 max-w-6xl mx-auto w-full">
        {view === 'dashboard' && (
          <Dashboard 
            sessions={sessions} 
            onStartTraining={startTraining} 
            onNavigateToLibrary={() => setView('library')} 
          />
        )}

        {view === 'library' && (
          <LibraryView onStartTraining={startTraining} />
        )}

        {view === 'train' && currentText && (
          <div className="max-w-4xl mx-auto space-y-10 py-10">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-serif text-slate-900">{currentText.title}</h2>
              <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                <span className="px-3 py-1 bg-slate-100 rounded-full text-slate-500">{currentText.category}</span>
                <span>•</span>
                <span>{currentText.difficulty}</span>
                <span>•</span>
                <span>{currentText.content.split(' ').length} words</span>
              </div>
            </div>

            {trainingPhase === 'reading' && (
              <RSVPReader text={currentText.content} onComplete={handleReadingComplete} />
            )}

            {trainingPhase === 'retention' && (
              <RetentionTool text={currentText.content} onComplete={handleRetentionComplete} />
            )}
          </div>
        )}

        {view === 'train' && !currentText && (
           <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
              <Library className="w-16 h-16 text-slate-200 mb-6" />
              <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">No Training Active</h2>
              <p className="text-slate-500 mb-8 max-w-md">Pick a text from your library to start a training session.</p>
              <button 
                onClick={() => setView('library')}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Go to Library
              </button>
           </div>
        )}
      </main>
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
      ${active ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
    `}
  >
    <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>
      {icon}
    </span>
    <span className="text-sm tracking-wide">{label}</span>
  </button>
);

const LibraryView: React.FC<{ onStartTraining: (text: ReadingText) => void }> = ({ onStartTraining }) => {
  const [texts, setTexts] = useState<ReadingText[]>([
    {
      id: '1',
      title: 'The Stoic Mindset',
      content: 'Stoicism is a school of Hellenistic philosophy founded by Zeno of Citium in Athens in the early 3rd century BC. It is a philosophy of personal ethics informed by its system of logic and its views on the natural world. According to its teachings, as social beings, the path to eudaimonia (happiness, or blessedness) is found in accepting the moment as it presents itself, by not allowing oneself to be controlled by the desire for pleasure or fear of pain, by using one\'s mind to understand the world and to do one\'s part in nature\'s plan, and by working together and treating others fairly and justly.',
      category: 'History',
      difficulty: 'Intermediate'
    },
    {
      id: '2',
      title: 'Neural Plasticity',
      content: 'Neuroplasticity, also known as brain plasticity, is the ability of neural networks in the brain to change through growth and reorganization. These changes range from individual neuron pathways making new connections, to systematic adjustments like cortical remapping. Examples of neuroplasticity include circuit and network changes that result from learning a new ability, environmental influences, practice, and psychological stress.',
      category: 'Science',
      difficulty: 'Advanced'
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const generateAIText = async (topic: string) => {
    setIsGenerating(true);
    try {
      const result = await geminiService.generateTrainingText(topic);
      const newText: ReadingText = {
        id: Date.now().toString(),
        title: result.title,
        content: result.content,
        category: 'Custom',
        difficulty: 'Intermediate'
      };
      setTexts([newText, ...texts]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const addCustomText = () => {
    if (!customText || !customTitle) return;
    const newText: ReadingText = {
      id: Date.now().toString(),
      title: customTitle,
      content: customText,
      category: 'Custom',
      difficulty: 'Intermediate'
    };
    setTexts([newText, ...texts]);
    setCustomText('');
    setCustomTitle('');
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif text-slate-900 mb-2">Training Library</h2>
          <p className="text-slate-500">Pick a text to train your speed and assimilation.</p>
        </div>
        <div className="flex gap-4">
          <button 
            disabled={isGenerating}
            onClick={() => generateAIText('Modern Productivity Systems')}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Plus size={20} />}
            AI Generated Drill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Custom Text Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-dashed border-slate-200 flex flex-col h-full">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Plus size={24} className="text-blue-600" />
              Upload Material
            </h3>
            <p className="text-sm text-slate-400 mt-1">Paste specific text you need to memorize or read quickly.</p>
          </div>
          <input 
            type="text" 
            placeholder="Document Title" 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
          />
          <textarea 
            placeholder="Paste content here..." 
            className="w-full flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none min-h-[160px]"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
          />
          <button 
            onClick={addCustomText}
            className="w-full py-4 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all"
          >
            Add to My Library
          </button>
        </div>

        {/* Text Selection List */}
        <div className="space-y-4">
          {texts.map((text) => (
            <div 
              key={text.id} 
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all group cursor-pointer"
              onClick={() => onStartTraining(text)}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{text.category}</span>
                <span className="text-xs font-bold text-slate-600">{text.difficulty}</span>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{text.title}</h4>
              <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                {text.content}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{text.content.split(' ').length} words</span>
                <span className="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Start Drill <Zap size={14} fill="currentColor" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;

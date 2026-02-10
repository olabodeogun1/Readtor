
import React from 'react';
import { ReadingSession, ReadingText } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Zap, Target, BookOpen, Clock, TrendingUp, Play, ArrowRight } from 'lucide-react';

interface DashboardProps {
  sessions: ReadingSession[];
  onStartTraining: (text: ReadingText) => void;
  onNavigateToLibrary: () => void;
}

const SUGGESTED_TEXTS: ReadingText[] = [
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
];

const Dashboard: React.FC<DashboardProps> = ({ sessions, onStartTraining, onNavigateToLibrary }) => {
  const avgWPM = sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + s.wpm, 0) / sessions.length) : 0;
  const avgComp = sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + s.comprehensionScore, 0) / sessions.length) : 0;

  const chartData = sessions.length > 0 
    ? sessions.map((s, i) => ({ name: `S${i + 1}`, wpm: s.wpm, comprehension: s.comprehensionScore }))
    : [{ name: 'None', wpm: 0, comprehension: 0 }];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500">Master the art of rapid comprehension and long-term memory.</p>
        </div>
        {sessions.length > 0 && (
          <div className="flex gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full items-center">
            <TrendingUp size={14} />
            {sessions.length} sessions logged
          </div>
        )}
      </header>

      {/* Quick Start / CTA Section */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-2xl font-serif font-bold mb-4">Ready for a speed drill?</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Take a 2-minute drill to increase your Words Per Minute (WPM) without sacrificing retention. 
            Choose a starting text below or visit the library.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onStartTraining(SUGGESTED_TEXTS[0])}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <Play size={18} fill="currentColor" />
              Quick Start Drill
            </button>
            <button 
              onClick={onNavigateToLibrary}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              Explore Library
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <Zap className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 pointer-events-none" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Zap className="text-amber-500" />} 
          label="Avg. Speed" 
          value={`${avgWPM} WPM`} 
          color="amber"
        />
        <StatCard 
          icon={<Target className="text-emerald-500" />} 
          label="Retention" 
          value={`${avgComp}%`} 
          color="emerald"
        />
        <StatCard 
          icon={<BookOpen className="text-blue-500" />} 
          label="Words Read" 
          value={`${sessions.length > 0 ? '12.4k' : '0'}`} 
          color="blue"
        />
        <StatCard 
          icon={<Clock className="text-indigo-500" />} 
          label="Focus Time" 
          value={`${sessions.length > 0 ? '45m' : '0m'}`} 
          color="indigo"
        />
      </div>

      {sessions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" />
              Reading Speed Progress
            </h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="wpm" stroke="#f59e0b" fillOpacity={1} fill="url(#colorWpm)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Target size={18} className="text-emerald-500" />
              Comprehension Trends
            </h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="comprehension" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Texts */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BookOpen size={20} className="text-blue-600" />
          Recommended Drills
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SUGGESTED_TEXTS.map(text => (
            <div 
              key={text.id} 
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onStartTraining(text)}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{text.category}</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{text.difficulty}</span>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{text.title}</h4>
              <p className="text-slate-500 text-sm line-clamp-2 mb-6">{text.content}</p>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>{text.content.split(' ').length} words</span>
                <span className="flex items-center gap-1 text-blue-600 group-hover:translate-x-1 transition-transform">
                  Begin Drill <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div className={`p-2.5 rounded-xl bg-${color}-50 w-fit mb-4`}>{icon}</div>
    <div className="text-slate-500 text-sm font-medium mb-1">{label}</div>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
  </div>
);

export default Dashboard;

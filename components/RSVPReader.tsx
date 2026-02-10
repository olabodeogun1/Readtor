
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Rewind, Info } from 'lucide-react';

interface RSVPReaderProps {
  text: string;
  onComplete: (wpm: number) => void;
}

const RSVPReader: React.FC<RSVPReaderProps> = ({ text, onComplete }) => {
  const [wpm, setWpm] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const words = useRef<string[]>(text.split(/\s+/).filter(w => w.length > 0));
  const timerRef = useRef<number | null>(null);

  const getPivotIndex = (word: string) => {
    const length = word.length;
    if (length <= 1) return 0;
    if (length <= 5) return 1;
    if (length <= 9) return 2;
    if (length <= 13) return 3;
    return 4;
  };

  const currentWord = words.current[currentIndex] || "";
  const pivotIndex = getPivotIndex(currentWord);

  const startReading = useCallback(() => {
    if (currentIndex >= words.current.length) {
      setIsPlaying(false);
      onComplete(wpm);
      return;
    }

    const interval = 60000 / wpm;
    timerRef.current = window.setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, interval);
  }, [currentIndex, wpm, onComplete]);

  useEffect(() => {
    if (isPlaying) {
      startReading();
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIndex, startReading]);

  const reset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
      <div className="w-full flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-2xl text-blue-800 text-sm">
        <Info size={18} className="flex-shrink-0" />
        <p>Focus your eyes on the <strong>red letter</strong> in the center. Your brain will process the word without scanning movement.</p>
      </div>

      {/* RSVP Display Area */}
      <div className="h-56 w-full flex items-center justify-center border-y-2 border-slate-100 relative mb-8 bg-slate-50/50 rounded-lg">
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-200/50 -translate-x-1/2 pointer-events-none"></div>
        
        {!isPlaying && currentIndex === 0 ? (
          <div className="flex flex-col items-center animate-pulse">
            <span className="text-slate-300 text-sm uppercase font-bold tracking-widest mb-4">Click Play to Begin</span>
            <div className="text-5xl md:text-7xl font-bold text-slate-200">READY?</div>
          </div>
        ) : (
          <div className="text-5xl md:text-7xl font-medium tracking-tight font-mono">
            <span className="text-slate-400">
              {currentWord.substring(0, pivotIndex)}
            </span>
            <span className="text-red-500 font-bold">
              {currentWord[pivotIndex]}
            </span>
            <span className="text-slate-800">
              {currentWord.substring(pivotIndex + 1)}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${(currentIndex / words.current.length) * 100}%` }}
        ></div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div className="flex flex-col gap-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Current Speed</span>
            <span className="text-blue-600 font-black">{wpm} WPM</span>
          </label>
          <input 
            type="range" 
            min="100" 
            max="1000" 
            step="50"
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase">
            <span>Novice</span>
            <span>Fluent</span>
            <span>Speedster</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 20))}
            className="p-3 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            title="Back 20 words"
          >
            <Rewind size={24} />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95 ${isPlaying ? 'bg-slate-800 hover:bg-slate-900' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>

          <button 
            onClick={reset}
            className="p-3 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            title="Restart"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
        {words.current.length - currentIndex} words remaining
      </div>
    </div>
  );
};

export default RSVPReader;

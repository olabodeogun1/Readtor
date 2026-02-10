
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { Brain, CheckCircle, XCircle, ChevronRight, BookOpen } from 'lucide-react';

interface RetentionToolProps {
  text: string;
  onComplete: (score: number) => void;
}

const RetentionTool: React.FC<RetentionToolProps> = ({ text, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ summary: string, retentionTips: string[] } | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(-1); // -1 means showing summary
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryData, quizData] = await Promise.all([
          geminiService.generateSummaryAndRetentionTips(text),
          geminiService.generateQuiz(text)
        ]);
        setData(summaryData);
        setQuiz(quizData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [text]);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === quiz[currentQuizIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextStep = () => {
    if (currentQuizIndex < quiz.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
      onComplete((score / quiz.length) * 100);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Brain className="w-16 h-16 text-blue-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-medium text-slate-700">Synthesizing Information...</h3>
        <p className="text-slate-400">Building your retention mental model</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-xl mx-auto">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600 w-10 h-10" />
        </div>
        <h2 className="text-3xl font-serif mb-2">Retention Check Complete</h2>
        <p className="text-slate-500 mb-6">Your comprehension score for this session</p>
        <div className="text-6xl font-bold text-blue-600 mb-8">{Math.round((score / quiz.length) * 100)}%</div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (currentQuizIndex === -1 && data) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl mx-auto border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-blue-600" />
          <h2 className="text-2xl font-serif">Executive Summary</h2>
        </div>
        <p className="text-slate-600 leading-relaxed mb-8 text-lg">{data.summary}</p>
        
        <div className="bg-blue-50 p-6 rounded-xl mb-8">
          <h3 className="text-blue-800 font-bold mb-4 uppercase tracking-wider text-xs">Mental Retention Hooks</h3>
          <ul className="space-y-4">
            {data.retentionTips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-slate-700">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <button 
          onClick={() => setCurrentQuizIndex(0)}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group"
        >
          Test My Knowledge
          <ChevronRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  const currentQuestion = quiz[currentQuizIndex];

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl mx-auto border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {currentQuizIndex + 1} of {quiz.length}</span>
        <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${((currentQuizIndex + 1) / quiz.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <h3 className="text-xl font-medium text-slate-800 mb-8 leading-snug">{currentQuestion.question}</h3>

      <div className="space-y-3 mb-10">
        {currentQuestion.options.map((option, i) => (
          <button
            key={i}
            disabled={selectedAnswer !== null}
            onClick={() => handleAnswer(i)}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between group
              ${selectedAnswer === null ? 'border-slate-100 hover:border-blue-200 hover:bg-blue-50' : 
                i === currentQuestion.correctAnswer ? 'border-green-500 bg-green-50' : 
                selectedAnswer === i ? 'border-red-500 bg-red-50' : 'border-slate-100 opacity-50'}
            `}
          >
            <span className="font-medium">{option}</span>
            {selectedAnswer !== null && i === currentQuestion.correctAnswer && <CheckCircle size={20} className="text-green-600" />}
            {selectedAnswer === i && i !== currentQuestion.correctAnswer && <XCircle size={20} className="text-red-600" />}
          </button>
        ))}
      </div>

      {selectedAnswer !== null && (
        <div className="mb-8 animate-fadeIn">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600 italic">
            <strong>Context:</strong> {currentQuestion.explanation}
          </div>
        </div>
      )}

      <button 
        disabled={selectedAnswer === null}
        onClick={nextStep}
        className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
          ${selectedAnswer !== null ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
        `}
      >
        {currentQuizIndex === quiz.length - 1 ? 'Finish Assessment' : 'Next Question'}
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default RetentionTool;

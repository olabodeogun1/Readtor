
export interface ReadingSession {
  id: string;
  timestamp: number;
  wpm: number;
  comprehensionScore: number;
  textTitle: string;
  category: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ReadingText {
  id: string;
  title: string;
  content: string;
  category: 'History' | 'Science' | 'Fiction' | 'Business' | 'Custom';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export type View = 'dashboard' | 'library' | 'train' | 'assess' | 'retention';

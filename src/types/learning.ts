export interface Word {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  partOfSpeech: string;
  examples: string[];
  mastery: number; // 0-100
  lastPracticed?: Date;
  timesCorrect: number;
  timesIncorrect: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  words?: WordInContext[];
  timestamp: Date;
}

export interface WordInContext {
  word: string;
  translation: string;
  pronunciation: string;
  partOfSpeech: string;
  isKnown: boolean;
  isNew: boolean;
}

export interface StoryMode {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  scenario: string;
  objectives: string[];
  vocabularyFocus: string[];
}

export interface UserProgress {
  totalWords: number;
  knownWords: number;
  learningWords: number;
  streak: number;
  messagesUsed: number;
  messagesLimit: number;
  isPremium: boolean;
  currentLevel: number;
  xp: number;
  xpToNextLevel: number;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'words' | 'streak' | 'conversations' | 'xp' | 'level';
  unlockedAt?: Date;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  type: 'words' | 'conversations' | 'practice';
  completed: boolean;
  expiresAt: Date;
}

export type OwlMood = 'neutral' | 'happy' | 'encouraging' | 'thinking' | 'celebrating' | 'curious';

export interface WeeklyStats {
  wordsLearned: number;
  wordsPracticed: number;
  conversationsHad: number;
  minutesPracticed: number;
  streakDays: number;
  xpEarned: number;
  topWords: string[];
  improvement: number; // percentage improvement from last week
}

export interface LearningSession {
  startTime: Date;
  endTime?: Date;
  wordsLearned: number;
  messagesExchanged: number;
  xpEarned: number;
}

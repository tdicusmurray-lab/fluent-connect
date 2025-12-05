import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Word, Message, UserProgress, Language } from '@/types/learning';
import { spanishSampleWords } from '@/data/sampleVocabulary';

interface LearningState {
  // User settings
  targetLanguage: Language | null;
  nativeLanguage: Language;
  
  // Progress
  progress: UserProgress;
  
  // Vocabulary
  vocabulary: Word[];
  
  // Conversation
  messages: Message[];
  currentStoryMode: string | null;
  
  // Actions
  setTargetLanguage: (language: Language) => void;
  addWord: (word: Word) => void;
  updateWordMastery: (wordId: string, correct: boolean) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setStoryMode: (modeId: string | null) => void;
  useMessage: () => boolean;
  upgradeToPremium: () => void;
  addXp: (amount: number) => void;
}

const initialProgress: UserProgress = {
  totalWords: 0,
  knownWords: 0,
  learningWords: 0,
  streak: 1,
  messagesUsed: 0,
  messagesLimit: 150,
  isPremium: false,
  currentLevel: 1,
  xp: 0,
  xpToNextLevel: 100,
};

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      targetLanguage: null,
      nativeLanguage: { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
      progress: initialProgress,
      vocabulary: [],
      messages: [],
      currentStoryMode: null,

      setTargetLanguage: (language) => set((state) => {
        // Add sample vocabulary for Spanish to show the feature
        if (language.code === 'es' && state.vocabulary.length === 0) {
          return {
            targetLanguage: language,
            vocabulary: spanishSampleWords,
            progress: {
              ...state.progress,
              totalWords: spanishSampleWords.length,
              knownWords: spanishSampleWords.filter(w => w.mastery >= 80).length,
              learningWords: spanishSampleWords.filter(w => w.mastery < 80).length,
            }
          };
        }
        return { targetLanguage: language };
      }),

      addWord: (word) => set((state) => {
        const exists = state.vocabulary.find(w => w.id === word.id);
        if (exists) return state;
        
        return {
          vocabulary: [...state.vocabulary, word],
          progress: {
            ...state.progress,
            totalWords: state.progress.totalWords + 1,
            learningWords: state.progress.learningWords + 1,
          }
        };
      }),

      updateWordMastery: (wordId, correct) => set((state) => {
        const updatedVocab = state.vocabulary.map(word => {
          if (word.id !== wordId) return word;
          
          const newMastery = correct 
            ? Math.min(100, word.mastery + 10)
            : Math.max(0, word.mastery - 5);
          
          return {
            ...word,
            mastery: newMastery,
            lastPracticed: new Date(),
            timesCorrect: correct ? word.timesCorrect + 1 : word.timesCorrect,
            timesIncorrect: correct ? word.timesIncorrect : word.timesIncorrect + 1,
          };
        });

        const knownWords = updatedVocab.filter(w => w.mastery >= 80).length;
        const learningWords = updatedVocab.filter(w => w.mastery < 80).length;

        return {
          vocabulary: updatedVocab,
          progress: {
            ...state.progress,
            knownWords,
            learningWords,
          }
        };
      }),

      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),

      clearMessages: () => set({ messages: [] }),

      setStoryMode: (modeId) => set({ currentStoryMode: modeId }),

      useMessage: () => {
        const state = get();
        if (state.progress.isPremium) return true;
        if (state.progress.messagesUsed >= state.progress.messagesLimit) return false;
        
        set((state) => ({
          progress: {
            ...state.progress,
            messagesUsed: state.progress.messagesUsed + 1,
          }
        }));
        return true;
      },

      upgradeToPremium: () => set((state) => ({
        progress: {
          ...state.progress,
          isPremium: true,
        }
      })),

      addXp: (amount) => set((state) => {
        let newXp = state.progress.xp + amount;
        let newLevel = state.progress.currentLevel;
        let xpToNext = state.progress.xpToNextLevel;

        while (newXp >= xpToNext) {
          newXp -= xpToNext;
          newLevel += 1;
          xpToNext = Math.floor(xpToNext * 1.5);
        }

        return {
          progress: {
            ...state.progress,
            xp: newXp,
            currentLevel: newLevel,
            xpToNextLevel: xpToNext,
          }
        };
      }),
    }),
    {
      name: 'lingo-live-storage',
    }
  )
);

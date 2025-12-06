import { Achievement } from '@/types/learning';

export const achievements: Achievement[] = [
  // Word achievements
  {
    id: 'first-words',
    title: 'First Steps',
    description: 'Learn your first 5 words',
    icon: '🌱',
    requirement: 5,
    type: 'words',
  },
  {
    id: 'vocabulary-builder',
    title: 'Vocabulary Builder',
    description: 'Learn 25 words',
    icon: '📚',
    requirement: 25,
    type: 'words',
  },
  {
    id: 'word-collector',
    title: 'Word Collector',
    description: 'Learn 50 words',
    icon: '🎯',
    requirement: 50,
    type: 'words',
  },
  {
    id: 'linguist',
    title: 'Linguist',
    description: 'Learn 100 words',
    icon: '🏆',
    requirement: 100,
    type: 'words',
  },
  {
    id: 'polyglot',
    title: 'Polyglot',
    description: 'Learn 250 words',
    icon: '👑',
    requirement: 250,
    type: 'words',
  },
  
  // Streak achievements
  {
    id: 'consistent-learner',
    title: 'Consistent Learner',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    requirement: 3,
    type: 'streak',
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    requirement: 7,
    type: 'streak',
  },
  {
    id: 'dedicated',
    title: 'Dedicated',
    description: 'Maintain a 14-day streak',
    icon: '💪',
    requirement: 14,
    type: 'streak',
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Maintain a 30-day streak',
    icon: '🚀',
    requirement: 30,
    type: 'streak',
  },
  
  // XP achievements
  {
    id: 'xp-starter',
    title: 'XP Starter',
    description: 'Earn 100 XP',
    icon: '⭐',
    requirement: 100,
    type: 'xp',
  },
  {
    id: 'xp-hunter',
    title: 'XP Hunter',
    description: 'Earn 500 XP',
    icon: '🌟',
    requirement: 500,
    type: 'xp',
  },
  {
    id: 'xp-master',
    title: 'XP Master',
    description: 'Earn 1000 XP',
    icon: '✨',
    requirement: 1000,
    type: 'xp',
  },
  
  // Level achievements
  {
    id: 'level-5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '🌙',
    requirement: 5,
    type: 'level',
  },
  {
    id: 'level-10',
    title: 'Skilled Learner',
    description: 'Reach level 10',
    icon: '🌠',
    requirement: 10,
    type: 'level',
  },
  {
    id: 'level-20',
    title: 'Expert',
    description: 'Reach level 20',
    icon: '🎖️',
    requirement: 20,
    type: 'level',
  },
];

export const generateDailyChallenges = (): { title: string; description: string; target: number; xpReward: number; type: 'words' | 'conversations' | 'practice' }[] => {
  const challenges = [
    { title: 'Word Hunter', description: 'Learn 3 new words today', target: 3, xpReward: 25, type: 'words' as const },
    { title: 'Chatterbox', description: 'Have 2 conversations', target: 2, xpReward: 30, type: 'conversations' as const },
    { title: 'Practice Makes Perfect', description: 'Practice 5 vocabulary words', target: 5, xpReward: 20, type: 'practice' as const },
  ];
  return challenges;
};

import { StoryMode } from "@/types/learning";

export const storyModes: StoryMode[] = [
  {
    id: 'restaurant',
    title: 'Restaurant Order',
    description: 'Learn to order food and drinks at a restaurant',
    difficulty: 'beginner',
    icon: '🍽️',
    scenario: 'You walk into a cozy restaurant and the waiter approaches your table...',
    objectives: [
      'Greet the waiter',
      'Ask for a menu',
      'Order food and drinks',
      'Request the bill'
    ],
    vocabularyFocus: ['food', 'drinks', 'numbers', 'politeness']
  },
  {
    id: 'shopping',
    title: 'Shopping Spree',
    description: 'Navigate a clothing store and make purchases',
    difficulty: 'beginner',
    icon: '🛍️',
    scenario: 'You enter a boutique looking for new clothes...',
    objectives: [
      'Ask for sizes',
      'Inquire about colors',
      'Ask for prices',
      'Complete a purchase'
    ],
    vocabularyFocus: ['clothing', 'colors', 'sizes', 'money']
  },
  {
    id: 'directions',
    title: 'Finding Your Way',
    description: 'Ask for and give directions in a new city',
    difficulty: 'intermediate',
    icon: '🗺️',
    scenario: 'You\'re lost in a beautiful foreign city...',
    objectives: [
      'Ask where something is',
      'Understand directions',
      'Use location vocabulary',
      'Thank for help'
    ],
    vocabularyFocus: ['directions', 'places', 'transportation', 'questions']
  },
  {
    id: 'hotel',
    title: 'Hotel Check-in',
    description: 'Book a room and handle hotel interactions',
    difficulty: 'intermediate',
    icon: '🏨',
    scenario: 'You arrive at your hotel after a long journey...',
    objectives: [
      'Check in to your room',
      'Ask about amenities',
      'Report a problem',
      'Request services'
    ],
    vocabularyFocus: ['accommodation', 'amenities', 'problems', 'requests']
  },
  {
    id: 'doctor',
    title: 'Doctor Visit',
    description: 'Describe symptoms and understand medical advice',
    difficulty: 'advanced',
    icon: '🏥',
    scenario: 'You\'re not feeling well and visit a local clinic...',
    objectives: [
      'Describe symptoms',
      'Understand diagnosis',
      'Get prescription info',
      'Schedule follow-up'
    ],
    vocabularyFocus: ['body parts', 'symptoms', 'medicine', 'health']
  },
  {
    id: 'job-interview',
    title: 'Job Interview',
    description: 'Practice professional language for interviews',
    difficulty: 'advanced',
    icon: '💼',
    scenario: 'You have an interview at your dream company...',
    objectives: [
      'Introduce yourself',
      'Discuss experience',
      'Ask about the role',
      'Negotiate terms'
    ],
    vocabularyFocus: ['professional', 'experience', 'skills', 'business']
  },
  {
    id: 'cafe',
    title: 'Coffee Break',
    description: 'Order coffee and have a casual chat',
    difficulty: 'beginner',
    icon: '☕',
    scenario: 'You step into a charming local café...',
    objectives: [
      'Order a drink',
      'Small talk with barista',
      'Ask for Wi-Fi',
      'Pay and tip'
    ],
    vocabularyFocus: ['beverages', 'casual speech', 'technology', 'payment']
  },
  {
    id: 'party',
    title: 'House Party',
    description: 'Make friends and socialize at a party',
    difficulty: 'intermediate',
    icon: '🎉',
    scenario: 'Your friend invited you to a local party...',
    objectives: [
      'Introduce yourself',
      'Ask about others',
      'Share interests',
      'Make plans'
    ],
    vocabularyFocus: ['introductions', 'hobbies', 'opinions', 'future plans']
  }
];

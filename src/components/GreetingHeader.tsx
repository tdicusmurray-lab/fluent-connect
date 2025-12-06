import { useMemo } from 'react';
import { useLearningStore } from '@/stores/learningStore';
import { Sun, Moon, Sunset, Coffee } from 'lucide-react';

export function GreetingHeader() {
  const { targetLanguage, progress } = useLearningStore();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    
    if (hour < 6) {
      return { text: 'Night owl?', icon: Moon, emoji: '🌙' };
    } else if (hour < 12) {
      return { text: 'Good morning', icon: Coffee, emoji: '☀️' };
    } else if (hour < 17) {
      return { text: 'Good afternoon', icon: Sun, emoji: '🌤️' };
    } else if (hour < 21) {
      return { text: 'Good evening', icon: Sunset, emoji: '🌅' };
    } else {
      return { text: 'Burning the midnight oil?', icon: Moon, emoji: '🌙' };
    }
  }, []);

  const motivation = useMemo(() => {
    const messages = [
      "Let's learn something new today!",
      "Ready to expand your vocabulary?",
      "Every word counts!",
      "Small steps lead to big progress.",
      "You're doing great!",
    ];
    
    // Use streak as seed for consistent daily message
    const index = progress.streak % messages.length;
    return messages[index];
  }, [progress.streak]);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{greeting.emoji}</span>
        <h1 className="font-display text-2xl font-bold">{greeting.text}</h1>
      </div>
      <p className="text-muted-foreground">{motivation}</p>
      
      {progress.streak > 0 && (
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/20 rounded-full">
          <span className="text-lg">🔥</span>
          <span className="font-semibold text-sm">
            {progress.streak} day streak
          </span>
        </div>
      )}
    </div>
  );
}

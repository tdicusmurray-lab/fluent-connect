import { useEffect, useState } from 'react';
import { useLearningStore } from '@/stores/learningStore';
import { cn } from '@/lib/utils';

export function StreakCelebration() {
  const { progress } = useLearningStore();
  const [show, setShow] = useState(false);
  const [milestone, setMilestone] = useState<number | null>(null);

  useEffect(() => {
    const lastCelebrated = localStorage.getItem('last-streak-celebration');
    const milestones = [3, 7, 14, 30, 50, 100];
    
    for (const m of milestones) {
      if (progress.streak >= m && lastCelebrated !== `${m}`) {
        setMilestone(m);
        setShow(true);
        localStorage.setItem('last-streak-celebration', `${m}`);
        
        setTimeout(() => setShow(false), 4000);
        break;
      }
    }
  }, [progress.streak]);

  if (!show || !milestone) return null;

  const messages: Record<number, { emoji: string; title: string; subtitle: string }> = {
    3: { emoji: '🔥', title: '3 Day Streak!', subtitle: 'You\'re on fire!' },
    7: { emoji: '⚡', title: '1 Week Streak!', subtitle: 'A whole week of learning!' },
    14: { emoji: '🌟', title: '2 Week Streak!', subtitle: 'Incredible dedication!' },
    30: { emoji: '👑', title: '30 Day Streak!', subtitle: 'You\'re a language champion!' },
    50: { emoji: '🏆', title: '50 Day Streak!', subtitle: 'Legendary status!' },
    100: { emoji: '💎', title: '100 Day Streak!', subtitle: 'You\'re unstoppable!' },
  };

  const { emoji, title, subtitle } = messages[milestone];

  return (
    <div 
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center pointer-events-none',
        'animate-in fade-in duration-500'
      )}
    >
      {/* Confetti background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-20px',
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <div 
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)],
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Celebration card */}
      <div 
        className={cn(
          'bg-card rounded-3xl p-8 shadow-2xl text-center',
          'animate-in zoom-in-50 duration-500'
        )}
      >
        <div className="text-7xl mb-4 animate-bounce">{emoji}</div>
        <h2 className="font-display text-3xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="font-display text-4xl font-bold text-secondary">
            {progress.streak}
          </span>
          <span className="text-muted-foreground">days</span>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLearningStore } from '@/stores/learningStore';
import { generateDailyChallenges } from '@/data/achievements';
import { DailyChallenge } from '@/types/learning';
import { Target, MessageCircle, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DailyChallenges() {
  const { progress, vocabulary } = useLearningStore();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);

  useEffect(() => {
    // Generate or restore daily challenges
    const storedChallenges = localStorage.getItem('daily-challenges');
    const storedDate = localStorage.getItem('daily-challenges-date');
    const today = new Date().toDateString();

    if (storedChallenges && storedDate === today) {
      setChallenges(JSON.parse(storedChallenges));
    } else {
      const newChallenges = generateDailyChallenges().map((c, i) => ({
        ...c,
        id: `challenge-${i}`,
        current: 0,
        completed: false,
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)),
      }));
      setChallenges(newChallenges);
      localStorage.setItem('daily-challenges', JSON.stringify(newChallenges));
      localStorage.setItem('daily-challenges-date', today);
    }
  }, []);

  // Update challenge progress based on current state
  useEffect(() => {
    if (challenges.length === 0) return;

    const updatedChallenges = challenges.map(challenge => {
      let current = challenge.current;
      
      if (challenge.type === 'words') {
        current = vocabulary.filter(w => {
          const lastPracticed = w.lastPracticed ? new Date(w.lastPracticed) : null;
          return lastPracticed && lastPracticed.toDateString() === new Date().toDateString();
        }).length;
      }
      
      return {
        ...challenge,
        current: Math.max(challenge.current, current),
        completed: current >= challenge.target,
      };
    });

    if (JSON.stringify(updatedChallenges) !== JSON.stringify(challenges)) {
      setChallenges(updatedChallenges);
      localStorage.setItem('daily-challenges', JSON.stringify(updatedChallenges));
    }
  }, [vocabulary, progress]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'words': return Target;
      case 'conversations': return MessageCircle;
      case 'practice': return BookOpen;
      default: return Target;
    }
  };

  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-secondary" />
          <h3 className="font-display font-bold">Daily Challenges</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {completedCount}/{challenges.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {challenges.map(challenge => {
          const Icon = getIcon(challenge.type);
          const progressPercent = Math.min((challenge.current / challenge.target) * 100, 100);

          return (
            <div 
              key={challenge.id}
              className={cn(
                'p-3 rounded-xl transition-all',
                challenge.completed 
                  ? 'bg-success-light border-2 border-success' 
                  : 'bg-muted/50'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  challenge.completed ? 'gradient-primary' : 'bg-muted'
                )}>
                  {challenge.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      'font-semibold text-sm',
                      challenge.completed && 'line-through text-muted-foreground'
                    )}>
                      {challenge.title}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      +{challenge.xpReward} XP
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {challenge.description}
                  </p>
                  
                  {!challenge.completed && (
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={progressPercent} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {challenge.current}/{challenge.target}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

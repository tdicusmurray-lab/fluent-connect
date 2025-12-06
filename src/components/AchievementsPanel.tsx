import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AchievementBadge } from '@/components/AchievementBadge';
import { achievements } from '@/data/achievements';
import { useLearningStore } from '@/stores/learningStore';
import { Trophy } from 'lucide-react';

export function AchievementsPanel() {
  const { progress, vocabulary } = useLearningStore();

  const achievementStatus = useMemo(() => {
    return achievements.map(achievement => {
      let currentProgress = 0;
      let unlocked = false;

      switch (achievement.type) {
        case 'words':
          currentProgress = vocabulary.length;
          unlocked = vocabulary.length >= achievement.requirement;
          break;
        case 'streak':
          currentProgress = progress.streak;
          unlocked = progress.streak >= achievement.requirement;
          break;
        case 'xp':
          currentProgress = progress.xp + (progress.currentLevel - 1) * 100; // Approximate total XP
          unlocked = currentProgress >= achievement.requirement;
          break;
        case 'level':
          currentProgress = progress.currentLevel;
          unlocked = progress.currentLevel >= achievement.requirement;
          break;
      }

      return {
        achievement,
        currentProgress,
        unlocked,
      };
    });
  }, [progress, vocabulary]);

  const unlockedCount = achievementStatus.filter(a => a.unlocked).length;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-secondary" />
          <h3 className="font-display font-bold">Achievements</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {unlockedCount}/{achievements.length}
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {achievementStatus.slice(0, 8).map(({ achievement, currentProgress, unlocked }) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            unlocked={unlocked}
            progress={currentProgress}
            size="sm"
          />
        ))}
      </div>

      {unlockedCount < achievements.length && (
        <p className="text-xs text-muted-foreground text-center">
          Keep learning to unlock more achievements!
        </p>
      )}
    </Card>
  );
}

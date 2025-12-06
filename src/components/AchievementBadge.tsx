import { Achievement } from '@/types/learning';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export function AchievementBadge({ 
  achievement, 
  unlocked, 
  progress = 0, 
  size = 'md',
  showProgress = true 
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const progressPercent = Math.min((progress / achievement.requirement) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div 
          className={cn(
            'rounded-full flex items-center justify-center transition-all duration-300',
            sizeClasses[size],
            unlocked 
              ? 'bg-gradient-to-br from-secondary to-warning shadow-lg animate-pulse-glow' 
              : 'bg-muted'
          )}
        >
          {unlocked ? (
            <span className="drop-shadow-md">{achievement.icon}</span>
          ) : (
            <Lock className="w-1/2 h-1/2 text-muted-foreground" />
          )}
        </div>
        
        {/* Progress ring for locked achievements */}
        {!unlocked && showProgress && progressPercent > 0 && (
          <svg 
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-primary/30"
              strokeWidth="2"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-primary"
              strokeWidth="2"
              strokeDasharray={`${progressPercent} 100`}
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      
      <div className="text-center">
        <p className={cn(
          'font-semibold text-sm',
          unlocked ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {achievement.title}
        </p>
        {showProgress && !unlocked && (
          <p className="text-xs text-muted-foreground">
            {progress}/{achievement.requirement}
          </p>
        )}
      </div>
    </div>
  );
}

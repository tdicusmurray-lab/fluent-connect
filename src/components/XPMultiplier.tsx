import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPMultiplierProps {
  baseMultiplier?: number;
  streakDays?: number;
}

export function XPMultiplier({ baseMultiplier = 1, streakDays = 0 }: XPMultiplierProps) {
  const [timeBonus, setTimeBonus] = useState(false);
  const [happyHour, setHappyHour] = useState(false);

  useEffect(() => {
    // Check for happy hour (certain hours of the day)
    const checkHappyHour = () => {
      const hour = new Date().getHours();
      // Happy hour: 6-8 AM and 6-8 PM local time
      setHappyHour((hour >= 6 && hour < 8) || (hour >= 18 && hour < 20));
    };

    checkHappyHour();
    const interval = setInterval(checkHappyHour, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate streak bonus
  const streakBonus = Math.min(streakDays * 0.1, 1.0); // Max 100% from streak
  const happyHourBonus = happyHour ? 0.5 : 0;
  const totalMultiplier = baseMultiplier + streakBonus + happyHourBonus;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-secondary" />
          <h3 className="font-display font-bold text-sm">XP Multiplier</h3>
        </div>
        <Badge 
          className={cn(
            'text-sm font-bold',
            totalMultiplier >= 2 && 'gradient-primary border-0 text-primary-foreground'
          )}
        >
          {totalMultiplier.toFixed(1)}x
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Base</span>
          <span className="font-medium">1.0x</span>
        </div>

        {streakBonus > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-orange-500" />
              <span className="text-muted-foreground">Streak ({streakDays} days)</span>
            </div>
            <span className="font-medium text-orange-500">+{(streakBonus * 100).toFixed(0)}%</span>
          </div>
        )}

        {happyHour && (
          <div className="flex items-center justify-between text-sm animate-pulse">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-accent" />
              <span className="text-muted-foreground">Happy Hour!</span>
            </div>
            <span className="font-medium text-accent">+50%</span>
          </div>
        )}
      </div>

      <Progress 
        value={Math.min((totalMultiplier / 3) * 100, 100)} 
        className="h-2"
      />

      <p className="text-xs text-muted-foreground text-center">
        {totalMultiplier >= 2 
          ? '🔥 Amazing XP boost active!' 
          : 'Keep your streak to boost XP!'}
      </p>
    </Card>
  );
}

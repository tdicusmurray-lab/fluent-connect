import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLearningStore } from '@/stores/learningStore';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  MessageCircle, 
  Flame,
  Star,
  Trophy,
  Calendar,
  ChevronRight
} from 'lucide-react';

interface WeeklyProgressReportProps {
  trigger?: React.ReactNode;
}

export function WeeklyProgressReport({ trigger }: WeeklyProgressReportProps) {
  const [open, setOpen] = useState(false);
  const { progress, vocabulary } = useLearningStore();

  // Calculate weekly stats (in production, this would come from database)
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filter words learned this week
    const wordsThisWeek = vocabulary.filter(w => {
      const practiced = w.lastPracticed ? new Date(w.lastPracticed) : null;
      return practiced && practiced >= weekAgo;
    });

    // Estimate minutes practiced (based on messages and streak)
    const estimatedMinutes = Math.round(progress.messagesUsed * 1.5 + progress.streak * 5);

    // Get top mastered words
    const topWords = [...vocabulary]
      .sort((a, b) => b.mastery - a.mastery)
      .slice(0, 5)
      .map(w => w.word);

    // Calculate improvement (mock - would be calculated from historical data)
    const improvement = Math.min(100, Math.round(progress.streak * 3 + wordsThisWeek.length * 2));

    return {
      wordsLearned: wordsThisWeek.length,
      wordsPracticed: vocabulary.filter(w => w.timesCorrect > 0).length,
      conversationsHad: Math.floor(progress.messagesUsed / 5), // Estimate
      minutesPracticed: estimatedMinutes,
      streakDays: progress.streak,
      xpEarned: progress.xp + (progress.currentLevel - 1) * 100,
      topWords,
      improvement,
    };
  }, [progress, vocabulary]);

  const stats = [
    { 
      icon: BookOpen, 
      label: 'Words Learned', 
      value: weeklyStats.wordsLearned, 
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      icon: MessageCircle, 
      label: 'Conversations', 
      value: weeklyStats.conversationsHad, 
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
    { 
      icon: Clock, 
      label: 'Minutes', 
      value: weeklyStats.minutesPracticed, 
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    { 
      icon: Star, 
      label: 'XP Earned', 
      value: weeklyStats.xpEarned, 
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1; // Convert to Mon=0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Weekly Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Weekly Progress Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Improvement Banner */}
          <Card className="p-4 gradient-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">This week's improvement</p>
                <p className="text-3xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  +{weeklyStats.improvement}%
                </p>
              </div>
              <Trophy className="w-12 h-12 opacity-50" />
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Streak Calendar */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 text-secondary" />
                {weeklyStats.streakDays} Day Streak
              </h3>
            </div>
            <div className="flex justify-between">
              {days.map((day, i) => {
                const isActive = i <= adjustedToday && weeklyStats.streakDays > adjustedToday - i;
                const isToday = i === adjustedToday;
                
                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                        isActive 
                          ? 'gradient-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      } ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      {isActive ? '🔥' : day[0]}
                    </div>
                    <span className="text-xs text-muted-foreground">{day}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Top Words */}
          {weeklyStats.topWords.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Top Words This Week</h3>
              <div className="flex flex-wrap gap-2">
                {weeklyStats.topWords.map((word, i) => (
                  <Badge key={i} variant="secondary" className="text-sm">
                    {word}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Level Progress */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Level {progress.currentLevel}</h3>
              <span className="text-sm text-muted-foreground">
                {progress.xp}/{progress.xpToNextLevel} XP
              </span>
            </div>
            <Progress value={(progress.xp / progress.xpToNextLevel) * 100} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {progress.xpToNextLevel - progress.xp} XP until next level
            </p>
          </Card>

          {/* Motivational Message */}
          <div className="text-center p-4 bg-muted rounded-xl">
            <p className="text-sm text-muted-foreground">
              {weeklyStats.improvement >= 20 
                ? "🎉 Amazing progress this week! Keep it up!" 
                : weeklyStats.streakDays >= 3 
                  ? "💪 Great streak! Consistency is key to fluency." 
                  : "🌱 Every practice session counts. Start building your streak!"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Progress } from "@/components/ui/progress";
import { useLearningStore } from "@/stores/learningStore";
import { Flame, BookOpen, Brain, MessageCircle, Star } from "lucide-react";

export function ProgressCard() {
  const { progress, targetLanguage } = useLearningStore();
  const messagesRemaining = progress.messagesLimit - progress.messagesUsed;
  const xpProgress = (progress.xp / progress.xpToNextLevel) * 100;

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground">Your Progress</h3>
        {targetLanguage && (
          <span className="text-2xl">{targetLanguage.flag}</span>
        )}
      </div>

      {/* Level & XP */}
      <div className="bg-muted rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-secondary" />
            <span className="font-bold">Level {progress.currentLevel}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {progress.xp}/{progress.xpToNextLevel} XP
          </span>
        </div>
        <Progress value={xpProgress} className="h-2" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-success-light rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{progress.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>

        <div className="bg-info-light rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-info" />
          </div>
          <div>
            <p className="text-2xl font-bold text-info">{progress.totalWords}</p>
            <p className="text-xs text-muted-foreground">Words</p>
          </div>
        </div>

        <div className="bg-warning-light rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{progress.knownWords}</p>
            <p className="text-xs text-muted-foreground">Mastered</p>
          </div>
        </div>

        <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">{messagesRemaining}</p>
            <p className="text-xs text-muted-foreground">Messages Left</p>
          </div>
        </div>
      </div>

      {/* Premium badge or upgrade prompt */}
      {progress.isPremium ? (
        <div className="gradient-primary rounded-xl p-3 text-center">
          <span className="text-primary-foreground font-bold">✨ Premium Member</span>
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground">
          {messagesRemaining <= 20 && (
            <p className="text-warning font-medium">Running low on messages!</p>
          )}
        </div>
      )}
    </div>
  );
}

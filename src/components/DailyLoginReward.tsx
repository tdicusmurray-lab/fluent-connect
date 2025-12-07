import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLoginRewards } from '@/hooks/useLoginRewards';
import { Gift, Flame, Check, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DailyLoginReward() {
  const { 
    currentStreak, 
    rewards, 
    canClaim, 
    showRewardModal, 
    setShowRewardModal, 
    claimDailyReward 
  } = useLoginRewards();

  const todayReward = rewards.find(r => r.isToday);

  return (
    <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center text-xl">
            <Gift className="w-6 h-6 text-secondary" />
            Daily Login Reward
          </DialogTitle>
        </DialogHeader>

        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="text-2xl font-bold">{currentStreak} Day Streak!</span>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-6">
            {rewards.map((reward, i) => (
              <div
                key={i}
                className={cn(
                  'relative flex flex-col items-center p-2 rounded-xl border transition-all',
                  reward.isToday && canClaim && 'ring-2 ring-primary ring-offset-2 animate-pulse-glow',
                  reward.claimed && 'bg-success-light border-success',
                  !reward.claimed && !reward.isToday && 'bg-muted/50 opacity-50'
                )}
              >
                <span className="text-xs font-semibold mb-1">Day {reward.day}</span>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center mb-1',
                  reward.claimed ? 'gradient-primary' : 'bg-muted'
                )}>
                  {reward.claimed ? (
                    <Check className="w-4 h-4 text-primary-foreground" />
                  ) : reward.isToday ? (
                    <Gift className="w-4 h-4 text-secondary" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <span className="text-xs font-bold text-primary">+{reward.xp}</span>
              </div>
            ))}
          </div>

          {canClaim && todayReward && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl p-4">
                <p className="text-lg font-bold mb-1">
                  Today's Reward: +{todayReward.xp} XP
                </p>
                <p className="text-sm text-muted-foreground">{todayReward.bonus}</p>
              </div>

              <Button 
                onClick={claimDailyReward} 
                size="lg" 
                className="w-full gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Claim Reward!
              </Button>
            </div>
          )}

          {!canClaim && (
            <div className="bg-muted rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                Come back tomorrow for your next reward!
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DailyLoginButton() {
  const { currentStreak, canClaim, setShowRewardModal } = useLoginRewards();

  return (
    <button
      onClick={() => setShowRewardModal(true)}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl transition-all',
        canClaim 
          ? 'bg-secondary/20 hover:bg-secondary/30 animate-pulse' 
          : 'bg-muted hover:bg-muted/80'
      )}
    >
      <Flame className="w-4 h-4 text-orange-500" />
      <span className="text-sm font-semibold">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</span>
      {canClaim && <Gift className="w-4 h-4 text-secondary" />}
    </button>
  );
}

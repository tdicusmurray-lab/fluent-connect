import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLearningStore } from '@/stores/learningStore';
import { toast } from 'sonner';

export interface LoginReward {
  day: number;
  xp: number;
  bonus: string;
  claimed: boolean;
  isToday: boolean;
}

const DAILY_REWARDS = [
  { day: 1, xp: 10, bonus: 'Welcome!' },
  { day: 2, xp: 15, bonus: '+50% XP' },
  { day: 3, xp: 20, bonus: 'Streak Boost' },
  { day: 4, xp: 25, bonus: '+75% XP' },
  { day: 5, xp: 35, bonus: 'Super Streak' },
  { day: 6, xp: 45, bonus: '+100% XP' },
  { day: 7, xp: 100, bonus: '🎉 MEGA BONUS!' },
];

export function useLoginRewards() {
  const { user } = useAuth();
  const { addXp } = useLearningStore();
  const [currentStreak, setCurrentStreak] = useState(1);
  const [rewards, setRewards] = useState<LoginReward[]>([]);
  const [canClaim, setCanClaim] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const fetchLoginRewards = useCallback(async () => {
    if (!user?.id) {
      setRewards(DAILY_REWARDS.map((r, i) => ({ 
        ...r, 
        claimed: false, 
        isToday: i === 0 
      })));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Get recent login rewards
      const { data: recentRewards, error } = await supabase
        .from('login_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('login_date', { ascending: false })
        .limit(7);

      if (error) throw error;

      const todayReward = recentRewards?.find(r => r.login_date === today);
      const yesterdayReward = recentRewards?.find(r => r.login_date === yesterday);

      // Calculate streak
      let streak = 1;
      if (yesterdayReward) {
        streak = (yesterdayReward.day_number % 7) + 1;
      } else if (!todayReward) {
        streak = 1; // Streak broken
      } else {
        streak = todayReward.day_number;
      }

      setCurrentStreak(streak);
      setCanClaim(!todayReward || !todayReward.reward_claimed);
      
      // Check if should show modal (new day, not claimed)
      if (!todayReward) {
        setShowRewardModal(true);
      }

      // Map rewards
      const mappedRewards = DAILY_REWARDS.map((r, i) => ({
        ...r,
        claimed: recentRewards?.some(lr => 
          lr.day_number === (i + 1) && lr.reward_claimed
        ) || false,
        isToday: (i + 1) === streak,
      }));

      setRewards(mappedRewards);
    } catch (error) {
      console.error('Error fetching login rewards:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const claimDailyReward = async () => {
    if (!user?.id || !canClaim) return false;

    try {
      const today = new Date().toISOString().split('T')[0];
      const reward = DAILY_REWARDS[(currentStreak - 1) % 7];

      // Upsert today's reward
      const { error } = await supabase
        .from('login_rewards')
        .upsert({
          user_id: user.id,
          login_date: today,
          day_number: currentStreak,
          reward_claimed: true,
          xp_reward: reward.xp,
          bonus_multiplier: currentStreak >= 7 ? 2.0 : 1 + (currentStreak * 0.1),
        }, {
          onConflict: 'user_id,login_date'
        });

      if (error) throw error;

      // Add XP
      addXp(reward.xp);
      
      toast.success(`+${reward.xp} XP claimed! ${reward.bonus}`);
      setCanClaim(false);
      setShowRewardModal(false);
      await fetchLoginRewards();
      return true;
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
      return false;
    }
  };

  useEffect(() => {
    fetchLoginRewards();
  }, [fetchLoginRewards]);

  return {
    currentStreak,
    rewards,
    canClaim,
    isLoading,
    showRewardModal,
    setShowRewardModal,
    claimDailyReward,
    refetch: fetchLoginRewards,
  };
}

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useLearningStore } from '@/stores/learningStore';
import { languages } from '@/data/languages';

export interface Profile {
  id: string;
  target_language: string;
  native_language: string;
  is_premium: boolean;
  messages_remaining: number;
  xp: number;
  streak: number;
  last_practice_date: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const store = useLearningStore();

  // Load profile from database and sync to local store
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      setProfile(data);
      
      // Sync profile data to local store
      if (data.target_language) {
        const lang = languages.find(l => l.name === data.target_language);
        if (lang) store.setTargetLanguage(lang);
      }
      
      // Calculate streak - reset if last practice was more than 1 day ago
      const today = new Date().toISOString().split('T')[0];
      const lastPractice = data.last_practice_date;
      let currentStreak = data.streak;
      
      if (lastPractice) {
        const lastDate = new Date(lastPractice);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
          // Streak broken - reset to 0
          currentStreak = 0;
          await supabase
            .from('profiles')
            .update({ streak: 0 })
            .eq('id', user.id);
        }
      }
      
      // Sync database values to local store
      if (data.is_premium) {
        store.upgradeToPremium();
      }
      
      // Update local progress with database values
      useLearningStore.setState((state) => ({
        progress: {
          ...state.progress,
          xp: data.xp || 0,
          streak: currentStreak,
          messagesUsed: Math.max(0, 150 - (data.messages_remaining || 150)),
          isPremium: data.is_premium,
        }
      }));
      
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<Omit<Profile, 'id'>>) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { error: error.message };
    }

    setProfile(data);
    return { data };
  }, [user]);

  const syncProgressToDatabase = useCallback(async () => {
    if (!user) return { error: 'Not authenticated' };

    const { progress, targetLanguage } = useLearningStore.getState();
    const today = new Date().toISOString().split('T')[0];
    
    // Check if this is a new day to increment streak
    let newStreak = progress.streak;
    if (profile?.last_practice_date !== today) {
      const lastPractice = profile?.last_practice_date;
      if (lastPractice) {
        const lastDate = new Date(lastPractice);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Consecutive day - increment streak
          newStreak = progress.streak + 1;
        } else if (diffDays > 1) {
          // Streak broken - start fresh
          newStreak = 1;
        }
      } else {
        // First practice ever
        newStreak = 1;
      }
      
      // Update local store with new streak
      useLearningStore.setState((state) => ({
        progress: {
          ...state.progress,
          streak: newStreak,
        }
      }));
    }

    const updates = {
      xp: progress.xp,
      streak: newStreak,
      messages_remaining: Math.max(0, progress.messagesLimit - progress.messagesUsed),
      is_premium: progress.isPremium,
      last_practice_date: today,
      target_language: targetLanguage?.name || 'Spanish',
    };

    const result = await updateProfile(updates);
    
    if (!result.error) {
      console.log('[Profile] Progress synced to database:', updates);
    }
    
    return result;
  }, [user, profile, updateProfile]);

  return {
    profile,
    loading,
    updateProfile,
    syncProgressToDatabase,
  };
}

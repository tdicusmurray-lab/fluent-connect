import { useEffect, useState } from 'react';
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
  const { setTargetLanguage, upgradeToPremium, progress } = useLearningStore();

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
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      setProfile(data);
      
      // Sync profile data to local store
      if (data.target_language) {
        const lang = languages.find(l => l.name === data.target_language);
        if (lang) setTargetLanguage(lang);
      }
      if (data.is_premium) {
        upgradeToPremium();
      }
      
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Omit<Profile, 'id'>>) => {
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
  };

  const syncProgressToDatabase = async () => {
    if (!user) return;

    await updateProfile({
      xp: progress.xp,
      streak: progress.streak,
      messages_remaining: progress.messagesLimit - progress.messagesUsed,
      is_premium: progress.isPremium,
    });
  };

  return {
    profile,
    loading,
    updateProfile,
    syncProgressToDatabase,
  };
}

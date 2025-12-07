import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name?: string;
  xp: number;
  streak: number;
  total_words_learned: number;
  rank: number;
  guild_name?: string;
  guild_icon?: string;
}

export interface GuildLeaderboardEntry {
  id: string;
  name: string;
  icon: string;
  total_xp: number;
  member_count: number;
  rank: number;
}

export function useLeaderboard() {
  const { user } = useAuth();
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [guildLeaderboard, setGuildLeaderboard] = useState<GuildLeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGlobalLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch top users by XP
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          xp,
          streak,
          total_words_learned,
          guild_id,
          guilds:guild_id (
            name,
            icon
          )
        `)
        .order('xp', { ascending: false, nullsFirst: false })
        .limit(100);

      if (error) throw error;

      const leaderboard: LeaderboardEntry[] = (profiles || []).map((p: any, index: number) => ({
        user_id: p.id,
        username: p.username || `User${p.id.slice(0, 4)}`,
        display_name: p.display_name,
        xp: p.xp || 0,
        streak: p.streak || 0,
        total_words_learned: p.total_words_learned || 0,
        rank: index + 1,
        guild_name: p.guilds?.name,
        guild_icon: p.guilds?.icon,
      }));

      setGlobalLeaderboard(leaderboard);

      // Find current user's rank
      if (user?.id) {
        const userEntry = leaderboard.find(e => e.user_id === user.id);
        setMyRank(userEntry?.rank || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchGuildLeaderboard = useCallback(async () => {
    try {
      const { data: guilds, error } = await supabase
        .from('guilds')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(50);

      if (error) throw error;

      const leaderboard: GuildLeaderboardEntry[] = (guilds || []).map((g: any, index: number) => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        total_xp: g.total_xp || 0,
        member_count: g.member_count || 0,
        rank: index + 1,
      }));

      setGuildLeaderboard(leaderboard);
    } catch (error) {
      console.error('Error fetching guild leaderboard:', error);
    }
  }, []);

  useEffect(() => {
    fetchGlobalLeaderboard();
    fetchGuildLeaderboard();
  }, [fetchGlobalLeaderboard, fetchGuildLeaderboard]);

  return {
    globalLeaderboard,
    guildLeaderboard,
    myRank,
    isLoading,
    refetch: () => {
      fetchGlobalLeaderboard();
      fetchGuildLeaderboard();
    },
  };
}

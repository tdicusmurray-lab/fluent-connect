import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Guild {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  created_by: string | null;
  total_xp: number;
  member_count: number;
  created_at: string;
}

export interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  role: 'leader' | 'officer' | 'member';
  joined_at: string;
  profiles?: {
    username: string | null;
    display_name: string | null;
    xp: number | null;
    streak: number | null;
  };
}

export function useGuilds() {
  const { user } = useAuth();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGuilds = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('guilds')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setGuilds((data as Guild[]) || []);
    } catch (error) {
      console.error('Error fetching guilds:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyGuild = useCallback(async () => {
    if (!user?.id) {
      setMyGuild(null);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('guild_id')
        .eq('id', user.id)
        .single();

      if (profile?.guild_id) {
        const { data: guild } = await supabase
          .from('guilds')
          .select('*')
          .eq('id', profile.guild_id)
          .single();
        
        setMyGuild(guild as Guild | null);

        // Fetch guild members
        const { data: members } = await supabase
          .from('guild_members')
          .select(`
            *,
            profiles:user_id (
              username,
              display_name,
              xp,
              streak
            )
          `)
          .eq('guild_id', profile.guild_id)
          .order('joined_at', { ascending: true });

        setGuildMembers((members as unknown as GuildMember[]) || []);
      } else {
        setMyGuild(null);
        setGuildMembers([]);
      }
    } catch (error) {
      console.error('Error fetching my guild:', error);
    }
  }, [user?.id]);

  const createGuild = async (name: string, description: string, icon: string) => {
    if (!user?.id) {
      toast.error('Please sign in to create a guild');
      return false;
    }

    try {
      const { data: guild, error: guildError } = await supabase
        .from('guilds')
        .insert({
          name,
          description,
          icon,
          created_by: user.id,
        })
        .select()
        .single();

      if (guildError) throw guildError;

      // Add creator as leader
      const { error: memberError } = await supabase
        .from('guild_members')
        .insert({
          guild_id: guild.id,
          user_id: user.id,
          role: 'leader',
        });

      if (memberError) throw memberError;

      toast.success('Guild created successfully!');
      await fetchMyGuild();
      await fetchGuilds();
      return true;
    } catch (error: any) {
      console.error('Error creating guild:', error);
      toast.error(error.message || 'Failed to create guild');
      return false;
    }
  };

  const joinGuild = async (guildId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to join a guild');
      return false;
    }

    try {
      const { error } = await supabase
        .from('guild_members')
        .insert({
          guild_id: guildId,
          user_id: user.id,
          role: 'member',
        });

      if (error) throw error;

      toast.success('Joined guild successfully!');
      await fetchMyGuild();
      await fetchGuilds();
      return true;
    } catch (error: any) {
      console.error('Error joining guild:', error);
      toast.error(error.message || 'Failed to join guild');
      return false;
    }
  };

  const leaveGuild = async () => {
    if (!user?.id || !myGuild) return false;

    try {
      const { error } = await supabase
        .from('guild_members')
        .delete()
        .eq('guild_id', myGuild.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Left guild successfully');
      setMyGuild(null);
      setGuildMembers([]);
      await fetchGuilds();
      return true;
    } catch (error: any) {
      console.error('Error leaving guild:', error);
      toast.error(error.message || 'Failed to leave guild');
      return false;
    }
  };

  useEffect(() => {
    fetchGuilds();
  }, [fetchGuilds]);

  useEffect(() => {
    fetchMyGuild();
  }, [fetchMyGuild]);

  return {
    guilds,
    myGuild,
    guildMembers,
    isLoading,
    createGuild,
    joinGuild,
    leaveGuild,
    refetch: fetchGuilds,
  };
}

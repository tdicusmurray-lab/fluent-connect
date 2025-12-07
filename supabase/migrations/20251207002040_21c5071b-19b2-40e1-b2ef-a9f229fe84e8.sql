-- Create guilds table
CREATE TABLE public.guilds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT '🏰',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_xp BIGINT DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guild memberships table
CREATE TABLE public.guild_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'officer', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(guild_id, user_id)
);

-- Create weekly leaderboard cache table for performance
CREATE TABLE public.leaderboard_weekly (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  xp_this_week INTEGER DEFAULT 0,
  words_this_week INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  rank INTEGER,
  week_start DATE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Create daily login rewards tracking
CREATE TABLE public.login_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  day_number INTEGER NOT NULL DEFAULT 1,
  reward_claimed BOOLEAN DEFAULT false,
  xp_reward INTEGER DEFAULT 10,
  bonus_multiplier NUMERIC(3,2) DEFAULT 1.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, login_date)
);

-- Add username and display fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS total_words_learned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_conversations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS guild_id UUID REFERENCES public.guilds(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_weekly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_rewards ENABLE ROW LEVEL SECURITY;

-- Guilds policies (public guilds - anyone can view)
CREATE POLICY "Anyone can view guilds" ON public.guilds FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create guilds" ON public.guilds FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Guild leaders can update their guild" ON public.guilds FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.guild_members WHERE guild_id = id AND user_id = auth.uid() AND role = 'leader')
);

-- Guild members policies
CREATE POLICY "Anyone can view guild members" ON public.guild_members FOR SELECT USING (true);
CREATE POLICY "Users can join guilds" ON public.guild_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave guilds" ON public.guild_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Leaderboard policies (public viewing)
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard_weekly FOR SELECT USING (true);
CREATE POLICY "Users can update own leaderboard entry" ON public.leaderboard_weekly FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can modify own leaderboard entry" ON public.leaderboard_weekly FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Login rewards policies
CREATE POLICY "Users can view own login rewards" ON public.login_rewards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can claim login rewards" ON public.login_rewards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own login rewards" ON public.login_rewards FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Function to update guild stats when members join/leave
CREATE OR REPLACE FUNCTION public.update_guild_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.guilds SET member_count = member_count + 1 WHERE id = NEW.guild_id;
    UPDATE public.profiles SET guild_id = NEW.guild_id WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.guilds SET member_count = member_count - 1 WHERE id = OLD.guild_id;
    UPDATE public.profiles SET guild_id = NULL WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_guild_member_change
AFTER INSERT OR DELETE ON public.guild_members
FOR EACH ROW EXECUTE FUNCTION public.update_guild_stats();

-- Function to aggregate guild XP from members
CREATE OR REPLACE FUNCTION public.update_guild_total_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.guilds g
  SET total_xp = (
    SELECT COALESCE(SUM(p.xp), 0)
    FROM public.profiles p
    WHERE p.guild_id = g.id
  )
  WHERE g.id = NEW.guild_id OR g.id = OLD.guild_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Timestamp triggers
CREATE TRIGGER update_guilds_updated_at
BEFORE UPDATE ON public.guilds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at
BEFORE UPDATE ON public.leaderboard_weekly
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
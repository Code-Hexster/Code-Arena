-- ============================================================
-- Code Learning Arena — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- REGIONS
-- ============================================================
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  story_intro TEXT,
  icon_url TEXT,
  sort_order INTEGER NOT NULL,
  unlock_level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Regions are viewable by everyone"
  ON public.regions FOR SELECT USING (true);

-- ============================================================
-- MISSIONS
-- ============================================================
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES public.regions(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  story_intro TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('novice','apprentice','adept')) NOT NULL,
  learning_objective TEXT NOT NULL,
  starter_code TEXT NOT NULL,
  test_cases JSONB NOT NULL,
  hint_1 TEXT,
  hint_2 TEXT,
  hint_3 TEXT,
  xp_reward INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  unlock_after UUID REFERENCES public.missions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Missions are viewable by everyone"
  ON public.missions FOR SELECT USING (true);

-- ============================================================
-- MISSION COMPLETIONS
-- ============================================================
CREATE TABLE public.mission_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES public.missions(id),
  code_submitted TEXT NOT NULL,
  tests_passed INTEGER NOT NULL,
  tests_total INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  hints_used INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

ALTER TABLE public.mission_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions"
  ON public.mission_completions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON public.mission_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- XP TRANSACTIONS (audit log)
-- ============================================================
CREATE TABLE public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own XP transactions"
  ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- BADGES
-- ============================================================
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  category TEXT NOT NULL,
  requirement JSONB NOT NULL,
  xp_bonus INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT USING (true);

-- ============================================================
-- PLAYER BADGES (junction table)
-- ============================================================
CREATE TABLE public.player_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id),
  awarded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.player_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON public.player_badges FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- AWARD XP FUNCTION (atomic, server-side)
-- ============================================================
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_ref UUID DEFAULT NULL
)
RETURNS TABLE(new_xp INTEGER, new_level INTEGER, leveled_up BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Log the XP transaction
  INSERT INTO public.xp_transactions (user_id, amount, source, reference_id)
  VALUES (p_user_id, p_amount, p_source, p_ref);

  -- Atomically increment XP
  UPDATE public.profiles
  SET total_xp = total_xp + p_amount
  WHERE id = p_user_id
  RETURNING level, total_xp INTO v_old_level, v_new_xp;

  -- Calculate new level: level = floor(sqrt(total_xp / 100)) + 1
  v_new_level := GREATEST(1, floor(sqrt(v_new_xp::float / 100))::INTEGER + 1);

  -- Update level if changed
  IF v_new_level != v_old_level THEN
    UPDATE public.profiles SET level = v_new_level WHERE id = p_user_id;
  END IF;

  RETURN QUERY SELECT v_new_xp, v_new_level, (v_new_level > v_old_level);
END;
$$;

-- ============================================================
-- SEED DATA: Regions
-- ============================================================
INSERT INTO public.regions (slug, name, description, story_intro, sort_order, unlock_level) VALUES
  ('variables', 'The Valley of Names', 'Where all things receive their true names. Learn to store and wield data.', 'In the beginning, the world was formless — a vast void of unnamed things. The first spell a coder must learn is the art of Naming...', 1, 1),
  ('loops', 'The Eternal Forge', 'Where patterns repeat and power multiplies. Master the art of repetition.', 'Beyond the Valley lies the Eternal Forge — a place where the same spell can be cast a thousand times in the blink of an eye...', 2, 3),
  ('functions', 'The Tower of Abstractions', 'Where spells are bottled and reused. Create your own magical incantations.', 'The Tower of Abstractions rises above the clouds. Within its walls, wizards learn to package their spells into reusable incantations...', 3, 5);

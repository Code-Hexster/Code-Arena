-- ============================================================
-- Update RLS Policies for Public Profiles
-- ============================================================

-- 1. Make player_badges viewable by everyone (for public profiles)
DROP POLICY IF EXISTS "Users can view own badges" ON public.player_badges;

CREATE POLICY "Public player badges are viewable by everyone"
  ON public.player_badges FOR SELECT USING (true);

-- 2. Make mission_completions viewable by everyone (so we can see other users' recent activity)
DROP POLICY IF EXISTS "Users can view own completions" ON public.mission_completions;

CREATE POLICY "Public mission completions are viewable by everyone"
  ON public.mission_completions FOR SELECT USING (true);

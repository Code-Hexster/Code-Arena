-- ============================================================
-- Update award_xp to calculate daily streaks
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
  v_last_active DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_today DATE;
BEGIN
  -- 1. Calculate and update streak
  v_today := CURRENT_DATE;
  
  SELECT last_active_date, current_streak, longest_streak 
  INTO v_last_active, v_current_streak, v_longest_streak
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_last_active IS NULL OR v_last_active < (v_today - INTERVAL '1 day') THEN
    -- Streak broken (or first time)
    v_current_streak := 1;
  ELSIF v_last_active = (v_today - INTERVAL '1 day') THEN
    -- Streak continued
    v_current_streak := v_current_streak + 1;
  END IF;
  -- If v_last_active == v_today, streak remains the same

  -- Update longest streak if necessary
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- 2. Log the XP transaction
  INSERT INTO public.xp_transactions (user_id, amount, source, reference_id)
  VALUES (p_user_id, p_amount, p_source, p_ref);

  -- 3. Atomically increment XP and update streak/date
  UPDATE public.profiles
  SET 
    total_xp = total_xp + p_amount,
    last_active_date = v_today,
    current_streak = v_current_streak,
    longest_streak = v_longest_streak
  WHERE id = p_user_id
  RETURNING level, total_xp INTO v_old_level, v_new_xp;

  -- 4. Calculate new level: level = floor(total_xp / 100) + 1
  v_new_level := floor(v_new_xp / 100)::INTEGER + 1;

  -- 5. Update level if changed
  IF v_new_level != v_old_level THEN
    UPDATE public.profiles SET level = v_new_level WHERE id = p_user_id;
  END IF;

  RETURN QUERY SELECT v_new_xp, v_new_level, (v_new_level > v_old_level);
END;
$$;

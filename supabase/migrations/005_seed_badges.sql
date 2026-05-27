-- ============================================================
-- Seed data for Badges table
-- ============================================================

INSERT INTO public.badges (slug, name, description, icon_url, category, requirement, xp_bonus)
VALUES
  (
    'first-blood',
    'First Blood',
    'Complete your very first mission.',
    '🩸',
    'milestone',
    '{"type": "mission_count", "threshold": 1}'::jsonb,
    50
  ),
  (
    'scholar',
    'Scholar',
    'Consult the AI Wizard for a hint.',
    '📜',
    'learning',
    '{"type": "hints_used", "threshold": 1}'::jsonb,
    25
  ),
  (
    'streak-apprentice',
    'Apprentice of Time',
    'Maintain a 3-day coding streak.',
    '⏳',
    'engagement',
    '{"type": "streak", "threshold": 3}'::jsonb,
    100
  )
ON CONFLICT (slug) DO NOTHING;

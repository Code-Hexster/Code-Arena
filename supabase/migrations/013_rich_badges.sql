-- ============================================================
-- Seed data for Rich Badges with Generated Visuals
-- ============================================================

INSERT INTO public.badges (slug, name, description, icon_url, category, requirement, xp_bonus)
VALUES
  (
    'valley-conqueror',
    'Valley Conqueror',
    'Complete all missions in the Valley of Names.',
    '/badges/valley_conqueror.png',
    'skill',
    '{"type": "region_complete", "region": "valley-of-names"}'::jsonb,
    250
  ),
  (
    'css-ramparts-builder',
    'Rampart Builder',
    'Complete all CSS Drawing missions in the Ramparts.',
    '/badges/css_ramparts.png',
    'skill',
    '{"type": "region_complete", "region": "css-ramparts"}'::jsonb,
    250
  ),
  (
    'streak-master-7',
    'Flame of the Adept',
    'Maintain a 7-day coding streak.',
    '/badges/streak_7.png',
    'streak',
    '{"type": "streak", "threshold": 7}'::jsonb,
    500
  ),
  (
    'streak-legend-30',
    'Crown of the Unyielding',
    'Maintain a 30-day coding streak.',
    '/badges/streak_30.png',
    'streak',
    '{"type": "streak", "threshold": 30}'::jsonb,
    2000
  )
ON CONFLICT (slug) DO UPDATE SET
  icon_url = EXCLUDED.icon_url,
  name = EXCLUDED.name,
  description = EXCLUDED.description;

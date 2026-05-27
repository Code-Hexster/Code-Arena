-- ============================================================
-- Update Schema for Realms & HTML/CSS Language Support
-- ============================================================

-- 1. Add `realm` to `regions`
ALTER TABLE public.regions ADD COLUMN IF NOT EXISTS realm TEXT DEFAULT 'code' NOT NULL;

-- 2. Add `language` to `missions`
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'python' NOT NULL;

-- 3. Update existing regions to 'code'
UPDATE public.regions SET realm = 'code' WHERE slug IN ('variables', 'loops', 'functions');

-- Clean up old creation regions if re-running (respect FK order: completions → missions → regions)
DELETE FROM public.mission_completions WHERE mission_id IN (
  SELECT id FROM public.missions WHERE region_id IN (
    SELECT id FROM public.regions WHERE realm = 'creation'
  )
);
DELETE FROM public.missions WHERE region_id IN (SELECT id FROM public.regions WHERE realm = 'creation');
DELETE FROM public.regions WHERE realm = 'creation';

-- 4. Insert 3 regions for the Creation Realm
INSERT INTO public.regions (slug, name, description, story_intro, icon_url, sort_order, unlock_level, realm) 
VALUES 
(
  'html-keep', 
  'The HTML Keep', 
  'Where the structural foundations of the visual world are forged in markup.', 
  'Welcome to the Realm of Creation. Here, spells do not calculate — they manifest structures. Your first task is to learn the basic incantations of HTML to build the walls of your fortress.', 
  'layout', 1, 1, 'creation'
),
(
  'css-ramparts', 
  'The CSS Ramparts', 
  'Where structures gain beauty, color, and precise placement.', 
  'A structure is nothing without style and position. Here on the Ramparts, you must learn CSS to position your defenses perfectly. Beware, arrows fly fast!', 
  'paintbrush', 2, 3, 'creation'
),
(
  'layout-labyrinth', 
  'The Layout Labyrinth', 
  'Master the art of Grid and Flexbox to command armies of elements.', 
  'Deep within the Labyrinth, elements must align perfectly. You will learn the advanced layout spells to organize your UI elements effortlessly.', 
  'component', 3, 5, 'creation'
);

-- 5. Insert missions
DO $$
DECLARE
  v_keep_id UUID;
  v_ramparts_id UUID;
  v_m1 UUID; v_m2 UUID; v_m3 UUID;
  v_r1 UUID; v_r2 UUID; v_r3 UUID; v_r4 UUID; v_r5 UUID;
BEGIN
  SELECT id INTO v_keep_id FROM public.regions WHERE slug = 'html-keep';
  SELECT id INTO v_ramparts_id FROM public.regions WHERE slug = 'css-ramparts';

  -- =====================
  -- STAGE 1: HTML Keep (3 basic missions using MissionView editor)
  -- =====================
  INSERT INTO public.missions (
    region_id, slug, title, story_intro, difficulty, learning_objective, 
    starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, language
  ) VALUES (
    v_keep_id, 'the-first-heading', 'The First Title',
    'Every grand fortress needs a nameplate. Use the <h1> tag to give your Keep a title.',
    'novice', 'Understand the <h1> heading tag.',
    '<!-- Write your heading below -->\n\n',
    '[{"input":"check_html_tag","expected_output":"h1","hidden":false,"description":"Create an <h1> element"}]'::jsonb,
    'Use the <h1> tag.', 'Write <h1>My Keep</h1>.', '<h1>My Keep</h1>',
    50, 1, 'html'
  ) RETURNING id INTO v_m1;

  INSERT INTO public.missions (
    region_id, slug, title, story_intro, difficulty, learning_objective, 
    starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after, language
  ) VALUES (
    v_keep_id, 'the-wooden-shield', 'The Wooden Shield',
    'We need a generic block to act as a barrier. Create a <div> element with the class "shield".',
    'novice', 'Understand <div> tags and the class attribute.',
    '<!-- Create a div with class="shield" -->\n\n',
    '[{"input":"check_html_tag","expected_output":"div","hidden":false,"description":"Create a <div>"},{"input":"check_html_class","expected_output":"shield","hidden":false,"description":"Add class shield"}]'::jsonb,
    'Use the <div> tag.', 'Add class="shield" to the tag.', '<div class="shield"></div>',
    50, 2, v_m1, 'html'
  ) RETURNING id INTO v_m2;

  INSERT INTO public.missions (
    region_id, slug, title, story_intro, difficulty, learning_objective, 
    starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after, language
  ) VALUES (
    v_keep_id, 'the-warning-sign', 'The Warning Sign',
    'Add a paragraph <p> below your shield to warn enemies away.',
    'novice', 'Understand <p> tags for text.',
    '<div class="shield"></div>\n<!-- Add your <p> tag below -->\n',
    '[{"input":"check_html_tag","expected_output":"p","hidden":false,"description":"Create a <p> element"}]'::jsonb,
    'Use the <p> tag.', 'Write <p>Keep out!</p>.', '<p>Keep out!</p>',
    50, 3, v_m2, 'html'
  ) RETURNING id INTO v_m3;

  -- =====================
  -- STAGE 2: CSS Ramparts (5 interactive visual levels)
  -- =====================
  INSERT INTO public.missions (
    region_id, slug, title, story_intro, difficulty, learning_objective, 
    starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, language
  ) VALUES (
    v_ramparts_id, 'css-ramparts-1', 'Block the Arrow',
    'An arrow is flying toward a person! Write CSS to give the shield block a size and color to intercept the arrow before it hits the target.',
    'apprentice', 'Use width, height, and background-color to create a visible block from a pre-existing element.',
    '/levels/css-ramparts-1.html',
    '[{"input":"interactive","expected_output":"complete","hidden":false,"description":"Block the arrow"}]'::jsonb,
    'Target the .shield class and give it width, height, background-color.', 'Make sure height is at least 60px.', 'See the level for visual hints.',
    100, 1, 'html-interactive'
  ) RETURNING id INTO v_r1;

  INSERT INTO public.missions (
    region_id, slug, title, story_intro, difficulty, learning_objective, 
    starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after, language
  ) VALUES (
    v_ramparts_id, 'css-ramparts-2', 'Build the Bridge',
    'The hero is stuck on a cliff with lava below! Build a bridge using a div that spans the gap.',
    'apprentice', 'Use width and height to create a structure that fills a space.',
    '/levels/css-ramparts-2.html',
    '[{"input":"interactive","expected_output":"complete","hidden":false,"description":"Bridge the gap"}]'::jsonb,
    'Use width:100% to span the gap.', 'Give it a height and background-color.', 'See the level for visual hints.',
    100, 2, v_r1, 'html-interactive'
  ) RETURNING id INTO v_r2;

  INSERT INTO public.missions (
    region_id, slug, title, story_intro, difficulty, learning_objective, 
    starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after, language
  ) VALUES (
    v_ramparts_id, 'css-ramparts-3', 'Shield from Rain',
    'It is pouring rain! Build a roof above the character to keep them dry.',
    'apprentice', 'Use width, height, background-color, and border-radius to create a roof.',
    '/levels/css-ramparts-3.html',
    '[{"input":"interactive","expected_output":"complete","hidden":false,"description":"Shelter from rain"}]'::jsonb,
    'Use width:100% and a background-color.', 'Add border-radius for a nice shape.', 'See the level for visual hints.',
    100, 3, v_r2, 'html-interactive'
  ) RETURNING id INTO v_r3;

  INSERT INTO public.missions (
    region_id, slug, title, story_intro, difficulty, learning_objective, 
    starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after, language
  ) VALUES (
    v_ramparts_id, 'css-ramparts-4', 'The Round Shield',
    'A fireball is coming! Only a round shield can deflect it. Use border-radius to create a circular defense.',
    'adept', 'Use border-radius:50% to create circular shapes, plus border for detail.',
    '/levels/css-ramparts-4.html',
    '[{"input":"interactive","expected_output":"complete","hidden":false,"description":"Create a round shield"}]'::jsonb,
    'Use border-radius:50% to make a circle.', 'Add a border for extra style.', 'See the level for visual hints.',
    100, 4, v_r3, 'html-interactive'
  ) RETURNING id INTO v_r4;

  INSERT INTO public.missions (
    region_id, slug, title, story_intro, difficulty, learning_objective, 
    starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after, language
  ) VALUES (
    v_ramparts_id, 'css-ramparts-5', 'The Final Stand',
    'Two threats attack at once — an arrow from the left and a boulder from above! Build a fortress using ALL your CSS skills.',
    'adept', 'Combine width, height, background-color, border, border-radius, and position to build a multi-piece defense.',
    '/levels/css-ramparts-5.html',
    '[{"input":"interactive","expected_output":"complete","hidden":false,"description":"Defend against all threats"}]'::jsonb,
    'You need a wall AND a roof — two divs.', 'Use position:absolute and top/left to place them.', 'See the level for visual hints.',
    150, 5, v_r4, 'html-interactive'
  );

END $$;

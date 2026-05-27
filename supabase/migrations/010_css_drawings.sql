-- ============================================================
-- Seed data for The CSS Canvas (CSS Drawing Challenges)
-- ============================================================

DO $$
DECLARE
  v_region_id UUID;
  v_m1 UUID := gen_random_uuid();
  v_m2 UUID := gen_random_uuid();
  v_m3 UUID := gen_random_uuid();
  v_m4 UUID := gen_random_uuid();
  v_m5 UUID := gen_random_uuid();
BEGIN
  -- We're repurposing the "html-keep" region into "The HTML Keep" (CSS Canvas theme)
  SELECT id INTO v_region_id FROM public.regions WHERE slug = 'html-keep' LIMIT 1;

  IF v_region_id IS NOT NULL THEN
    
    -- Update the region's name and description to fit the drawing theme
    UPDATE public.regions 
    SET name = 'The HTML Keep',
        description = 'Master the basics of CSS drawing by replicating simple shapes.',
        story_intro = 'Welcome to the artist''s studio inside the Keep. Here, your spells do not build walls; they paint shapes. Replicate the target shapes exactly to prove your worth as a CSS Artisan.'
    WHERE id = v_region_id;

    -- Clean up existing missions in this region to prevent duplicates
    DELETE FROM public.mission_completions WHERE mission_id IN (
      SELECT id FROM public.missions WHERE region_id = v_region_id
         OR slug IN ('the-perfect-square', 'the-magic-circle', 'the-potion-pill', 'the-golden-ring', 'the-dragons-eye')
    );
    DELETE FROM public.missions WHERE region_id = v_region_id 
       OR slug IN ('the-perfect-square', 'the-magic-circle', 'the-potion-pill', 'the-golden-ring', 'the-dragons-eye');

    -- Mission 1: The Perfect Square
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, language
    ) VALUES (
      v_m1, v_region_id, 'the-perfect-square', 'The Perfect Square',
      'Before you can paint the Mona Lisa, you must learn to draw a box. Replicate the blue square.',
      'novice', 'Learn width, height, and background-color.',
      '/levels/css-drawing-1.html',
      '[{"input":"interactive","expected_output":"complete","hidden":false,"description":"Match the square"}]'::jsonb,
      'Set width and height to 100px.', 'Use background-color: #3b82f6.', 'See the canvas for live feedback.',
      50, 1, 'html-interactive'
    );

    -- Mission 2: The Magic Circle
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after, language
    ) VALUES (
      v_m2, v_region_id, 'the-magic-circle', 'The Magic Circle',
      'Boxes are fine, but magic flows in circles. Use border-radius to round out your corners perfectly.',
      'novice', 'Learn to use border-radius: 50% to create circles.',
      '/levels/css-drawing-2.html',
      '[{"input":"interactive","expected_output":"complete","hidden":false,"description":"Match the circle"}]'::jsonb,
      'Set width and height to 100px.', 'Use border-radius: 50% to make it perfectly round.', 'See the canvas for live feedback.',
      50, 2, v_m1, 'html-interactive'
    );

    -- Mission 3: The Potion Pill
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after, language
    ) VALUES (
      v_m3, v_region_id, 'the-potion-pill', 'The Potion Pill',
      'Not all rounded shapes are circles. Create a wide rectangle with fully rounded ends to store your potions.',
      'novice', 'Learn to use large border-radius values on rectangles.',
      '/levels/css-drawing-3.html',
      '[{"input":"interactive","expected_output":"complete","hidden":false,"description":"Match the pill"}]'::jsonb,
      'It''s a rectangle, so width should be larger than height.', 'Use border-radius: 9999px to ensure fully rounded ends.', 'See the canvas for live feedback.',
      50, 3, v_m2, 'html-interactive'
    );

    -- Mission 4: The Golden Ring
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after, language
    ) VALUES (
      v_m4, v_region_id, 'the-golden-ring', 'The Golden Ring',
      'Now for something hollow. You must create a ring by removing the background and mastering borders.',
      'apprentice', 'Learn to use thick borders with transparent backgrounds.',
      '/levels/css-drawing-4.html',
      '[{"input":"interactive","expected_output":"complete","hidden":false,"description":"Match the ring"}]'::jsonb,
      'Use border: 15px solid #f59e0b.', 'Leave the background transparent.', 'Don''t forget border-radius: 50%!',
      80, 4, v_m3, 'html-interactive'
    );

    -- Mission 5: The Dragon''s Eye
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after, language
    ) VALUES (
      v_m5, v_region_id, 'the-dragons-eye', 'The Dragon''s Eye',
      'The ultimate test of a CSS Artisan. You can target specific corners with border-radius to create complex, asymmetric shapes like leaves or eyes.',
      'apprentice', 'Learn asymmetric border-radius shorthand.',
      '/levels/css-drawing-5.html',
      '[{"input":"interactive","expected_output":"complete","hidden":false,"description":"Match the eye"}]'::jsonb,
      'Border-radius shorthand works like this: top-left, top-right, bottom-right, bottom-left.', 'Try: border-radius: 50% 0 50% 0.', 'See the canvas for live feedback.',
      100, 5, v_m4, 'html-interactive'
    );

  END IF;
END $$;

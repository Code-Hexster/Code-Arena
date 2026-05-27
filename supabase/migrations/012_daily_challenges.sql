-- ============================================================
-- Daily Micro-Challenges (Hidden Region)
-- ============================================================

DO $$
DECLARE
  v_region_id UUID := gen_random_uuid();
  v_m1 UUID := gen_random_uuid();
  v_m2 UUID := gen_random_uuid();
  v_m3 UUID := gen_random_uuid();
BEGIN
  -- 1. Create the hidden daily region (sort order 999 to stay out of the way)
  INSERT INTO public.regions (
    id, slug, name, description, story_intro, sort_order, unlock_level
  ) VALUES (
    v_region_id, 'daily-quests', 'Daily Micro-Challenges', 
    'A secret vault of daily trials to keep your mind sharp.',
    'Every day brings a new minor disturbance in the magical weave. Fix it quickly to maintain your focus!',
    999, 1
  ) ON CONFLICT (slug) DO NOTHING;

  -- Re-fetch the region_id in case it already existed
  SELECT id INTO v_region_id FROM public.regions WHERE slug = 'daily-quests';

  -- 2. Insert Missions
  
  -- Mission 1: The String Reverser
  INSERT INTO public.missions (
    id, region_id, slug, title, story_intro, difficulty, learning_objective,
    starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, language
  ) VALUES (
    v_m1, v_region_id, 'daily-string-reverser', 'The Daily Reversal',
    'A rogue imp has scrambled a magical incantation by flipping it backwards! You must write a function to reverse a string and fix it.',
    'novice', 'Learn to reverse a string in Python.',
    'def reverse_string(s):
    # Your code here
    pass',
    '[{"input": "\"hello\"", "expected_output": "\"olleh\"", "hidden": false, "description": "Should reverse \"hello\""}, {"input": "\"Python\"", "expected_output": "\"nohtyP\"", "hidden": false, "description": "Should handle mixed case"}]'::jsonb,
    'You can use slicing to reverse a string in Python.',
    'Try using [::-1].',
    'The solution is return s[::-1].',
    50, 1, 'python'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Mission 2: Even Number Checker
  INSERT INTO public.missions (
    id, region_id, slug, title, story_intro, difficulty, learning_objective,
    starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, language
  ) VALUES (
    v_m2, v_region_id, 'daily-even-check', 'The Even Balance',
    'The scales of mana are unbalanced. Write a function that returns True if a number is even, and False if it is odd.',
    'novice', 'Use the modulo operator to check for even numbers.',
    'def is_even(num):
    # Your code here
    pass',
    '[{"input": "4", "expected_output": "True", "hidden": false, "description": "4 is even"}, {"input": "7", "expected_output": "False", "hidden": false, "description": "7 is odd"}]'::jsonb,
    'Use the modulo operator % to find the remainder of division by 2.',
    'If num % 2 equals 0, the number is even.',
    'return num % 2 == 0',
    50, 2, 'python'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Mission 3: List Summation
  INSERT INTO public.missions (
    id, region_id, slug, title, story_intro, difficulty, learning_objective,
    starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, language
  ) VALUES (
    v_m3, v_region_id, 'daily-list-sum', 'The Treasury Count',
    'The Kingdom needs a quick tally of today''s gold intake. Write a function that takes a list of numbers and returns their total sum.',
    'novice', 'Sum the elements of a list.',
    'def sum_list(numbers):
    # Your code here
    pass',
    '[{"input": "[1, 2, 3, 4]", "expected_output": "10", "hidden": false, "description": "Sum of 1+2+3+4"}, {"input": "[10, -5, 5]", "expected_output": "10", "hidden": false, "description": "Handles negative numbers"}]'::jsonb,
    'You can use a for loop to iterate through the numbers and add them up.',
    'Alternatively, Python has a built-in function specifically for this.',
    'return sum(numbers)',
    50, 3, 'python'
  ) ON CONFLICT (slug) DO NOTHING;
END $$;

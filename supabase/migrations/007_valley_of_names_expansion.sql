-- ============================================================
-- Expansion for The Valley of Names (Adds 2 missing missions)
-- ============================================================

DO $$
DECLARE
  v_region_id UUID;
  v_mission_4_id UUID := gen_random_uuid();
  v_mission_5_id UUID := gen_random_uuid();
BEGIN
  -- Get the Valley of Names region ID
  SELECT id INTO v_region_id FROM public.regions WHERE slug = 'variables' LIMIT 1;

  IF v_region_id IS NOT NULL THEN
    
    -- Delete existing versions of these two missions if they exist to prevent duplicates
    DELETE FROM public.missions WHERE region_id = v_region_id AND slug IN ('the-changing-form', 'the-math-of-magic');

    -- Mission 4: The Changing Form (Beginner)
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order
    ) VALUES (
      v_mission_4_id,
      v_region_id,
      'the-changing-form',
      'The Changing Form',
      'A true wizard knows that magic is never static. Variables can change their shape and value over time. You must learn to reassign a variable to a new value to adapt to the shifting tides of battle.',
      'apprentice',
      'Learn how to reassign a variable to a new value.',
      '# 🏔️ The Valley of Names — Mission 4: The Changing Form
#
# Your quest: 
# 1. Create a variable ''potion_color'' and set it to "Blue"
# 2. Print the potion color.
# 3. Reassign ''potion_color'' to "Red"
# 4. Print the potion color again.
#
# Expected output:
# The potion is Blue
# Now the potion is Red

potion_color = "Blue"
print("The potion is " + potion_color)

# Reassign the variable below:
potion_color = ___
print("Now the potion is " + potion_color)',
      '[{"input": "", "expected_output": "The potion is Blue\nNow the potion is Red", "hidden": false, "description": "Should print the initial and changed potion colors"}]'::jsonb,
      'Just like assigning the first time, use the = sign to give the variable a new value.',
      'To reassign, write potion_color = "Red" on line 16.',
      'Replace the ___ with "Red" (with quotes).',
      40,
      4
    );

    -- Mission 5: The Math of Magic (Intermediate)
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order
    ) VALUES (
      v_mission_5_id,
      v_region_id,
      'the-math-of-magic',
      'The Math of Magic',
      'Words are powerful, but numbers calculate the fate of the realm. A wizard must know how to add and subtract their magical reserves. In this trial, you will perform arithmetic using variables.',
      'adept',
      'Learn basic arithmetic operations (+, -, *, /) using numerical variables.',
      '# 🏔️ The Valley of Names — Mission 5: The Math of Magic
#
# Your quest: Calculate your total mana!
# 1. Create ''base_mana'' set to 100
# 2. Create ''bonus_mana'' set to 50
# 3. Create ''total_mana'' by adding base_mana and bonus_mana together.
# 4. Print the total mana.
#
# Expected output:
# Total Mana: 150

base_mana = 100
bonus_mana = 50

# Calculate total mana by adding the two variables:
total_mana = ___ + ___

print("Total Mana: " + str(total_mana))',
      '[{"input": "", "expected_output": "Total Mana: 150", "hidden": false, "description": "Should calculate and print the sum of base and bonus mana"}]'::jsonb,
      'You can use the + operator to add variables together, just like numbers.',
      'Write total_mana = base_mana + bonus_mana.',
      'Replace the first ___ with base_mana and the second ___ with bonus_mana.',
      50,
      5
    );

  END IF;
END $$;

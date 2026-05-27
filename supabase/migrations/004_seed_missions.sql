-- ============================================================
-- Seed data for Missions table
-- ============================================================

DO $$
DECLARE
  v_region_id UUID;
  v_mission_1_id UUID := gen_random_uuid();
  v_mission_2_id UUID := gen_random_uuid();
  v_mission_3_id UUID := gen_random_uuid();
  v_mission_4_id UUID := gen_random_uuid();
  v_mission_5_id UUID := gen_random_uuid();
BEGIN
  -- Get the Valley of Names region ID
  SELECT id INTO v_region_id FROM public.regions WHERE slug = 'variables' LIMIT 1;

  IF v_region_id IS NOT NULL THEN
    
    -- Clean up existing missions in this region to prevent duplicate errors
    DELETE FROM public.mission_completions WHERE mission_id IN (
      SELECT id FROM public.missions WHERE region_id = v_region_id
    );
    DELETE FROM public.missions WHERE region_id = v_region_id;

    -- Mission 1: The Naming Spell
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order
    ) VALUES (
      v_mission_1_id,
      v_region_id,
      'the-naming-spell',
      'The Naming Spell',
      'Every wizard''s journey begins with a single spell — the Naming Spell. In the arcane language of Python, to name something is to create a **variable**. A variable is like a magical chest: you give it a name, and it holds a value inside. Today, you will cast your first spell.',
      'novice',
      'Learn how to create a variable and assign a string value to it.',
      '# 🏔️ The Valley of Names — Mission 1: The Naming Spell
# 
# Your quest: Create a variable called ''hero_name''
# and set it to your chosen hero name (any name you like!)
# Then, print a welcome message.
#
# Example output: Welcome, Aether!

# Write your code below:
hero_name = ___
print("Welcome, " + hero_name + "!")',
      '[{"input": "", "expected_output": "Welcome, ", "hidden": false, "description": "Should print a welcome message with the hero name"}]'::jsonb,
      'A magical chest needs a name and a treasure. What treasure will you place inside?',
      'In Python, we assign values to variables using the = sign. A string value must be wrapped in quotes, like "Aether".',
      'Replace ___ with a string value in quotes, like "Aether". The variable hero_name will then hold that value.',
      25,
      1
    );

    -- Mission 2: The Number Rune
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order
    ) VALUES (
      v_mission_2_id,
      v_region_id,
      'the-number-rune',
      'The Number Rune',
      'Not all magic is made of words. Some spells require **numbers** — the ancient runes of mathematics. In Python, numbers don''t need quotes. They stand on their own, proud and precise. Learn to wield both strings and numbers, for a true wizard uses all tools.',
      'novice',
      'Learn the difference between strings and integers. Create numeric variables.',
      '# 🏔️ The Valley of Names — Mission 2: The Number Rune
#
# Your quest: Create two variables:
# 1. ''spell_power'' — set it to 42
# 2. ''spell_name'' — set it to "Fireball"
# Then print them both.
#
# Expected output:
# Spell: Fireball
# Power: 42

spell_power = ___
spell_name = ___
print("Spell: " + spell_name)
print("Power: " + str(spell_power))',
      '[{"input": "", "expected_output": "Spell: Fireball\nPower: 42", "hidden": false, "description": "Should print the spell name and power"}]'::jsonb,
      'One treasure is a word, the other is a number. They are stored differently in the chest...',
      'Strings need quotes around them ("Fireball"), but numbers don''t (42). Try assigning each variable with the right type of value.',
      'Set spell_power = 42 (no quotes, it''s a number) and spell_name = "Fireball" (with quotes, it''s a string).',
      30,
      2
    );

    -- Mission 3: The Combination Charm
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order
    ) VALUES (
      v_mission_3_id,
      v_region_id,
      'the-combination-charm',
      'The Combination Charm',
      'A master wizard doesn''t just name things — they **combine** them. String concatenation is the art of joining words together, like chaining spells in a combo. Master this, and your output will be powerful and precise.',
      'novice',
      'Learn string concatenation and f-strings in Python.',
      '# 🏔️ The Valley of Names — Mission 3: The Combination Charm
#
# Your quest: Create three variables and combine them
# into a single magical introduction.
#
# 1. ''name'' — your hero''s name
# 2. ''title'' — your hero''s title (e.g., "the Brave")
# 3. ''level'' — your hero''s level (a number)
#
# Print: "I am [name] [title], level [level]!"
# Use an f-string to combine them.
#
# Example output: I am Aether the Brave, level 1!

name = ___
title = ___
level = ___
print(f"I am {name} {title}, level {level}!")',
      '[{"input": "", "expected_output": "I am ", "hidden": false, "description": "Should print an introduction using f-string"}]'::jsonb,
      'Three ingredients make one potion. Give each ingredient its value, and the f-string spell will combine them.',
      'An f-string starts with f before the quotes: f"text {variable}". Inside the curly braces {}, Python inserts the variable''s value. Assign values to all three variables first.',
      'Set name = "Aether", title = "the Brave", level = 1. The f-string on the last line will automatically combine them. Replace each ___ with the right value.',
      35,
      3
    );

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

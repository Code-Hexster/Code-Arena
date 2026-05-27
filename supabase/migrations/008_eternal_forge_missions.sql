-- ============================================================
-- Seed data for The Eternal Forge (Loops)
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
  -- Get The Eternal Forge region ID
  SELECT id INTO v_region_id FROM public.regions WHERE slug = 'loops' LIMIT 1;

  IF v_region_id IS NOT NULL THEN
    
    -- Clean up existing missions in this region to prevent duplicates
    DELETE FROM public.mission_completions WHERE mission_id IN (
      SELECT id FROM public.missions WHERE region_id = v_region_id
    );
    DELETE FROM public.missions WHERE region_id = v_region_id;

    -- Mission 1: The First Strike
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order
    ) VALUES (
      v_m1,
      v_region_id,
      'the-first-strike',
      'The First Strike',
      'Welcome to The Eternal Forge! Here, the rhythm of the hammer shapes the world. A wizard of the Forge does not strike a hundred times manually; they command the hammer to repeat itself. Master the `for` loop to strike the anvil automatically.',
      'novice',
      'Learn the basic syntax of a for loop using range().',
      '# 🔥 The Eternal Forge — Mission 1: The First Strike
#
# Your quest: Command the magical hammer to strike 3 times.
# Use a `for` loop and `range(3)` to print "Clang!" 3 times.
#
# Expected output:
# Clang!
# Clang!
# Clang!

# Write your loop below:
for i in range(___):
    print("___")',
      '[{"input": "", "expected_output": "Clang!\nClang!\nClang!", "hidden": false, "description": "Should print Clang! three times."}]'::jsonb,
      'The range() function tells the loop how many times to run. If you want 3 strikes, put 3 inside the parentheses.',
      'Inside the print() statement, make sure to write "Clang!".',
      'Replace the first ___ with 3, and the second ___ with Clang!.',
      30,
      1
    );

    -- Mission 2: Forging the Metals
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after
    ) VALUES (
      v_m2,
      v_region_id,
      'forging-the-metals',
      'Forging the Metals',
      'A true smith works with many materials. Loops aren''t just for counting numbers; they can walk through a list of items one by one. Take this list of rare magical metals and heat each one in the forge.',
      'novice',
      'Learn how to iterate over a list using a for loop.',
      '# 🔥 The Eternal Forge — Mission 2: Forging the Metals
#
# Your quest: You have a list of magical metals.
# Use a `for` loop to go through each metal in the list.
# For each one, print: "Heating [metal]..."
#
# Expected output:
# Heating Iron...
# Heating Steel...
# Heating Mithril...

metals = ["Iron", "Steel", "Mithril"]

# Complete the loop below:
for metal in ___:
    print("Heating " + ___ + "...")',
      '[{"input": "", "expected_output": "Heating Iron...\nHeating Steel...\nHeating Mithril...", "hidden": false, "description": "Should iterate over the metals list and print the heating message."}]'::jsonb,
      'In a `for item in list:` loop, you need to provide the name of the list you want to loop over.',
      'You are looping over the `metals` list. Inside the loop, the current item is stored in the variable `metal`.',
      'Replace the first ___ with metals, and the second ___ with metal.',
      40,
      2,
      v_m1
    );

    -- Mission 3: The Heat of the Furnace
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after
    ) VALUES (
      v_m3,
      v_region_id,
      'the-heat-of-the-furnace',
      'The Heat of the Furnace',
      'The `for` loop knows exactly how many times to strike. But what if you need to keep heating the furnace UNTIL it is hot enough? For this, we use the `while` loop. It keeps repeating as long as a condition is true.',
      'apprentice',
      'Learn how to use a while loop with a condition.',
      '# 🔥 The Eternal Forge — Mission 3: The Heat of the Furnace
#
# Your quest: Heat the furnace until it reaches 100 degrees.
# The furnace starts at 20 degrees.
# Use a `while` loop that runs as long as `temp` is less than 100.
# Inside the loop, add 40 to `temp` and print it.
#
# Expected output:
# Temp: 60
# Temp: 100

temp = 20

# Complete the while loop condition:
while temp < ___:
    temp = temp + 40
    print("Temp: " + str(temp))',
      '[{"input": "", "expected_output": "Temp: 60\nTemp: 100", "hidden": false, "description": "Should print the temperature as it rises to 100."}]'::jsonb,
      'The while loop should keep going as long as the temperature is less than the target.',
      'The target temperature is 100. Put 100 in the while condition.',
      'Replace the ___ with 100.',
      50,
      3,
      v_m2
    );

    -- Mission 4: Quenching the Blade
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after
    ) VALUES (
      v_m4,
      v_region_id,
      'quenching-the-blade',
      'Quenching the Blade',
      'Sometimes, a wizard must stop the magic immediately before it goes too far. When plunging the hot blade into water, you must stop cooling it when it hits exactly 50 degrees, or it will shatter! Use the `break` command to escape a loop early.',
      'apprentice',
      'Learn how to use the break statement to exit a loop early.',
      '# 🔥 The Eternal Forge — Mission 4: Quenching the Blade
#
# Your quest: Cool the blade from 90 down to 30.
# But wait! If the temp reaches exactly 50, you must `break` out!
# 
# Expected output:
# Cooling... 90
# Cooling... 70
# Perfect temp reached! Stop!

temp = 90

while temp > 30:
    print("Cooling... " + str(temp))
    if temp == 50:
        print("Perfect temp reached! Stop!")
        ___  # Put the command to escape the loop here!
    
    temp = temp - 20',
      '[{"input": "", "expected_output": "Cooling... 90\nCooling... 70\nCooling... 50\nPerfect temp reached! Stop!", "hidden": false, "description": "Should break out of the loop when temp hits 50."}]'::jsonb,
      'Python has a special keyword that immediately stops and breaks out of a loop.',
      'The keyword is exactly what it sounds like: break.',
      'Replace ___ with the word break.',
      60,
      4,
      v_m3
    );

    -- Mission 5: The Masterpiece
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after
    ) VALUES (
      v_m5,
      v_region_id,
      'the-masterpiece',
      'The Masterpiece',
      'The final test of the Forge. You must gather all the glowing embers to forge your masterpiece. You will use a loop to accumulate (add up) a running total. A true master tracks their power continuously.',
      'adept',
      'Learn the accumulator pattern inside a loop.',
      '# 🔥 The Eternal Forge — Mission 5: The Masterpiece
#
# Your quest: You have a list of magical embers, each with a power level.
# You need to calculate the TOTAL power.
# Create a loop that adds each ember''s power to `total_power`.
#
# Expected output:
# Forged a masterpiece with power: 150

embers = [30, 50, 70]
total_power = 0

# Loop through each ember in embers
for ___ in ___:
    # Add the current ember to total_power
    total_power = total_power + ___

print("Forged a masterpiece with power: " + str(total_power))',
      '[{"input": "", "expected_output": "Forged a masterpiece with power: 150", "hidden": false, "description": "Should sum the embers and print the total power."}]'::jsonb,
      'First, set up your loop to go through the `embers` list.',
      'For `___ in ___`, use `ember` in `embers`. Then add `ember` to `total_power`.',
      'for ember in embers: \n total_power = total_power + ember',
      100,
      5,
      v_m4
    );

  END IF;
END $$;

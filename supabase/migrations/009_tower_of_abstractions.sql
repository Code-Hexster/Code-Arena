-- ============================================================
-- Seed data for The Tower of Abstractions (Functions)
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
  -- Get The Tower of Abstractions region ID
  SELECT id INTO v_region_id FROM public.regions WHERE slug = 'functions' LIMIT 1;

  IF v_region_id IS NOT NULL THEN
    
    -- Clean up existing missions in this region to prevent duplicates
    DELETE FROM public.mission_completions WHERE mission_id IN (
      SELECT id FROM public.missions WHERE region_id = v_region_id
    );
    DELETE FROM public.missions WHERE region_id = v_region_id;

    -- Mission 1: The Bottled Spell (Intermediate)
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order
    ) VALUES (
      v_m1,
      v_region_id,
      'the-bottled-spell',
      'The Bottled Spell',
      'Welcome to The Tower of Abstractions! Here, we do not cast spells wildly; we bottle them into **functions** so they can be reused at any time. Your first task is to bottle a spell that greets any ally by name. Master the `def` keyword to define your function.',
      'apprentice',
      'Learn how to define a function that takes arguments and prints a result.',
      '# 🏰 The Tower of Abstractions — Mission 1: The Bottled Spell
#
# Your quest: Define a function named `greet_ally`.
# It should take one argument: `name`.
# Inside the function, print: "Greetings, [name]! The Tower welcomes you."
#
# Expected output when tested:
# Greetings, Merlin! The Tower welcomes you.
# Greetings, Gandalf! The Tower welcomes you.

# Define your function below:
___ greet_ally(___):
    print(f"Greetings, {name}! The Tower welcomes you.")

# Let''s test the bottled spell!
greet_ally("Merlin")
greet_ally("Gandalf")',
      '[{"input": "", "expected_output": "Greetings, Merlin! The Tower welcomes you.\nGreetings, Gandalf! The Tower welcomes you.", "hidden": false, "description": "Should print greetings for Merlin and Gandalf."}]'::jsonb,
      'To define a function in Python, use the `def` keyword.',
      'The function needs an argument. Inside the parentheses, write `name`.',
      'Replace the first ___ with def and the second ___ with name.',
      50,
      1
    );

    -- Mission 2: The Alchemist''s Return (Intermediate)
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after
    ) VALUES (
      v_m2,
      v_region_id,
      'the-alchemists-return',
      'The Alchemist''s Return',
      'A true alchemist doesn''t just mix potions into the void; they bring the result back! In Python, printing just shows something on the screen, but `return` actually hands the result back to the code that called it. Brew a potion of multiplication!',
      'apprentice',
      'Learn how to use the return statement to output a calculated value.',
      '# 🏰 The Tower of Abstractions — Mission 2: The Alchemist''s Return
#
# Your quest: Define a function named `brew_potion`.
# It takes two arguments: `herb_power` and `crystal_multiplier`.
# The function should NOT print anything.
# Instead, it must RETURN the product of the two arguments.
#
# Expected output when tested:
# Brewed power: 150

def brew_potion(herb_power, crystal_multiplier):
    # Calculate the total power
    total = ___ * ___
    # Hand the result back!
    ___ total

# Testing the potion
result = brew_potion(50, 3)
print("Brewed power: " + str(result))',
      '[{"input": "", "expected_output": "Brewed power: 150", "hidden": false, "description": "Should multiply the inputs and return the result."}]'::jsonb,
      'Multiply the two arguments together using the * operator.',
      'To hand a value back out of a function, use the `return` keyword.',
      'total = herb_power * crystal_multiplier. Then write: return total',
      60,
      2,
      v_m1
    );

    -- Mission 3: The Multi-Target Hex (Adept)
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after
    ) VALUES (
      v_m3,
      v_region_id,
      'the-multi-target-hex',
      'The Multi-Target Hex',
      'A master of abstractions combines spells. Here, you must weave a loop INSIDE a function. Create a hex that strikes multiple enemies at once and calculates the total damage dealt across the battlefield!',
      'adept',
      'Combine functions with loops and accumulators.',
      '# 🏰 The Tower of Abstractions — Mission 3: The Multi-Target Hex
#
# Your quest: Define a function `cast_chain_lightning`.
# Arguments: `enemies` (a list of names), `base_damage` (a number)
# 
# 1. Start a `total_damage` variable at 0.
# 2. Loop through each enemy in the list.
# 3. Print: "Zapped [enemy] for [base_damage] damage!"
# 4. Add the damage to `total_damage`.
# 5. RETURN the `total_damage`.
#
# Expected output:
# Zapped Goblin for 40 damage!
# Zapped Orc for 40 damage!
# Total destruction: 80

def cast_chain_lightning(enemies, base_damage):
    total_damage = 0
    for ___ in ___:
        print(f"Zapped {enemy} for {base_damage} damage!")
        total_damage = total_damage + ___
    
    return ___

# Testing the hex
damage_done = cast_chain_lightning(["Goblin", "Orc"], 40)
print(f"Total destruction: {damage_done}")',
      '[{"input": "", "expected_output": "Zapped Goblin for 40 damage!\nZapped Orc for 40 damage!\nTotal destruction: 80", "hidden": false, "description": "Should zap each enemy and return total damage."}]'::jsonb,
      'Your loop should iterate over the `enemies` list. Use `for enemy in enemies:`.',
      'Inside the loop, add `base_damage` to `total_damage`.',
      'At the very end of the function (outside the loop), `return total_damage`.',
      80,
      3,
      v_m2
    );

    -- Mission 4: The Enchanted Armor (Adept)
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after
    ) VALUES (
      v_m4,
      v_region_id,
      'the-enchanted-armor',
      'The Enchanted Armor',
      'Magic is not just about dealing damage; it is about surviving it. You must write a function to calculate how much damage gets through your armor. But beware: damage can never be negative, even if your armor is incredibly strong!',
      'adept',
      'Use conditional logic (if/else) inside a function to return safe values.',
      '# 🏰 The Tower of Abstractions — Mission 4: The Enchanted Armor
#
# Your quest: Define `calculate_damage_taken`.
# Arguments: `incoming_damage`, `armor_rating`
#
# 1. Subtract `armor_rating` from `incoming_damage`.
# 2. If the result is less than 0, return 0 (armor blocked it all).
# 3. Otherwise, return the remaining damage.
#
# Expected output:
# Hit 1 took: 20
# Hit 2 took: 0

def calculate_damage_taken(incoming_damage, armor_rating):
    actual_damage = incoming_damage - armor_rating
    
    if actual_damage < 0:
        return ___
    else:
        return ___

# Testing the armor
hit_1 = calculate_damage_taken(50, 30)  # Should take 20
hit_2 = calculate_damage_taken(10, 50)  # Should take 0

print(f"Hit 1 took: {hit_1}")
print(f"Hit 2 took: {hit_2}")',
      '[{"input": "", "expected_output": "Hit 1 took: 20\nHit 2 took: 0", "hidden": false, "description": "Should correctly reduce damage and floor it at 0."}]'::jsonb,
      'If actual_damage is less than 0, the armor blocked everything. Return 0.',
      'Otherwise (in the else block), return the actual_damage.',
      'Replace the first ___ with 0, and the second ___ with actual_damage.',
      100,
      4,
      v_m3
    );

    -- Mission 5: The Grand Invocation (Advanced)
    INSERT INTO public.missions (
      id, region_id, slug, title, story_intro, difficulty, learning_objective,
      starter_code, test_cases, hint_1, hint_2, hint_3, xp_reward, sort_order, unlock_after
    ) VALUES (
      v_m5,
      v_region_id,
      'the-grand-invocation',
      'The Grand Invocation',
      'The pinnacle of the Tower! You must write a complex function that checks if a wizard has enough mana to cast an ultimate spell, casts it if they do, and returns a dictionary of the battle results.',
      'adept',
      'Write a complex function returning multiple pieces of data.',
      '# 🏰 The Tower of Abstractions — Mission 5: The Grand Invocation
#
# Your quest: Define `cast_ultimate`.
# Arguments: `current_mana`, `spell_cost`, `spell_damage`
#
# 1. If `current_mana` is greater than or equal to `spell_cost`:
#    - Print "METEOR STRIKE!"
#    - Calculate `mana_left` = current_mana - spell_cost
#    - RETURN the spell_damage AND the mana_left
# 2. Else:
#    - Print "Not enough mana..."
#    - RETURN 0 damage AND the original current_mana
#
# Expected output:
# METEOR STRIKE!
# Dealt 500 damage. Mana left: 20
# Not enough mana...
# Dealt 0 damage. Mana left: 40

def cast_ultimate(current_mana, spell_cost, spell_damage):
    if current_mana >= spell_cost:
        print("METEOR STRIKE!")
        mana_left = current_mana - spell_cost
        return spell_damage, mana_left
    else:
        print("Not enough mana...")
        return ___, ___

# Test 1: Successful cast
dmg1, mana1 = cast_ultimate(120, 100, 500)
print(f"Dealt {dmg1} damage. Mana left: {mana1}")

# Test 2: Failed cast
dmg2, mana2 = cast_ultimate(40, 100, 500)
print(f"Dealt {dmg2} damage. Mana left: {mana2}")',
      '[{"input": "", "expected_output": "METEOR STRIKE!\nDealt 500 damage. Mana left: 20\nNot enough mana...\nDealt 0 damage. Mana left: 40", "hidden": false, "description": "Should handle successful and failed casts properly."}]'::jsonb,
      'In Python, you can return two things separated by a comma. `return thing1, thing2`.',
      'If the spell fails, they deal 0 damage, and their mana stays exactly the same as `current_mana`.',
      'In the else block, replace the blanks with `0, current_mana`.',
      150,
      5,
      v_m4
    );

  END IF;
END $$;

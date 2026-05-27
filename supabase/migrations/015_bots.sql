-- ============================================================
-- Add Bot Users for 1v1 Arena
-- ============================================================

-- Note: In a real production Supabase instance, creating users via SQL
-- should be done carefully, but for this dev environment, it works perfectly to seed bots.

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
)
VALUES
('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'bot1@example.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"name":"CodeBot_Alpha", "preferred_username":"codebot_alpha[BOT]"}', now(), now()),
('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'bot2@example.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"name":"CSS_Phantom", "preferred_username":"css_phantom[BOT]"}', now(), now()),
('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'bot3@example.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"name":"ScriptMaster", "preferred_username":"script_master[BOT]"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- The trigger handle_new_user() will automatically create their profiles.
-- Let's give them some XP so they look intimidating!
UPDATE public.profiles
SET total_xp = 5000, level = 7
WHERE id IN ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003');

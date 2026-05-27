-- ============================================================
-- Multiplayer Arena & Friendships
-- ============================================================

-- 1. Friendships Table
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id_1, user_id_2)
);

-- Ensure user_id_1 < user_id_2 for uniqueness if we wanted to be strict, but for MVP pending/accepted works better with directional requests (user_id_1 is sender).

-- 2. Match Invites Table
CREATE TABLE IF NOT EXISTS public.match_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Matches Table (Active 1v1 Sessions)
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    player2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')),
    winner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Friendships
CREATE POLICY "Users can view their friendships"
    ON public.friendships FOR SELECT
    USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can create friend requests"
    ON public.friendships FOR INSERT
    WITH CHECK (auth.uid() = user_id_1);

CREATE POLICY "Users can accept their friend requests"
    ON public.friendships FOR UPDATE
    USING (auth.uid() = user_id_2);

-- RLS Policies for Match Invites
CREATE POLICY "Users can view their match invites"
    ON public.match_invites FOR SELECT
    USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Users can send match invites"
    ON public.match_invites FOR INSERT
    WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update received match invites"
    ON public.match_invites FOR UPDATE
    USING (auth.uid() = invitee_id OR auth.uid() = inviter_id);

-- RLS Policies for Matches
CREATE POLICY "Users can view matches they are in"
    ON public.matches FOR SELECT
    USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can create matches"
    ON public.matches FOR INSERT
    WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can update their matches"
    ON public.matches FOR UPDATE
    USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Enable Realtime
-- This relies on `supabase_realtime` publication.
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;

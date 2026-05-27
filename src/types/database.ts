// ============================================================
// Database types — mirrors Supabase schema
// ============================================================

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  created_at: string;
}

export interface Region {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  story_intro: string | null;
  icon_url: string | null;
  sort_order: number;
  unlock_level: number;
  realm: string;
  created_at: string;
}

export interface Mission {
  id: string;
  region_id: string;
  slug: string;
  title: string;
  story_intro: string;
  difficulty: "novice" | "apprentice" | "adept";
  learning_objective: string;
  starter_code: string;
  test_cases: TestCase[];
  hint_1: string | null;
  hint_2: string | null;
  hint_3: string | null;
  xp_reward: number;
  sort_order: number;
  unlock_after: string | null;
  language: string;
  created_at: string;
}

export interface TestCase {
  input: string;
  expected_output: string;
  hidden: boolean;
  description?: string;
}

export interface MissionCompletion {
  id: string;
  user_id: string;
  mission_id: string;
  code_submitted: string;
  tests_passed: number;
  tests_total: number;
  xp_earned: number;
  hints_used: number;
  completed_at: string;
}

export interface XpTransaction {
  id: string;
  user_id: string;
  amount: number;
  source: "mission" | "streak_bonus" | "badge" | "daily_login";
  reference_id: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_url: string | null;
  category: "skill" | "streak" | "milestone";
  requirement: BadgeRequirement;
  xp_bonus: number;
  created_at: string;
}

export interface BadgeRequirement {
  type: "missions_completed" | "streak_days" | "xp_total" | "region_complete";
  count?: number;
  region?: string;
}

export interface PlayerBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
}

export interface Friendship {
  id: string;
  user_id_1: string;
  user_id_2: string;
  status: "pending" | "accepted";
  created_at: string;
}

export interface MatchInvite {
  id: string;
  inviter_id: string;
  invitee_id: string;
  mission_id: string;
  status: "pending" | "accepted" | "declined" | "expired";
  created_at: string;
}

export interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  mission_id: string;
  status: "in_progress" | "completed";
  winner_id: string | null;
  created_at: string;
}

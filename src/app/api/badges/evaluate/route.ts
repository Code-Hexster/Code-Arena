import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch all badges
    const { data: allBadges } = await supabase.from("badges").select("*");
    
    // 3. Fetch user's existing badges
    const { data: userBadges } = await supabase
      .from("player_badges")
      .select("badge_id")
      .eq("user_id", user.id);

    const earnedBadgeIds = new Set(userBadges?.map((b) => b.badge_id) || []);

    // 4. Fetch user's stats
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_streak")
      .eq("id", user.id)
      .single();

    const { count: missionCount } = await supabase
      .from("mission_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // TODO: Track AI hints usage in a table in the future. For now, we will mock hints_used = 0
    const hintsUsed = 0; 

    const newlyEarned = [];

    // 5. Evaluate unearned badges
    if (allBadges) {
      for (const badge of allBadges) {
        if (earnedBadgeIds.has(badge.id)) continue;

        const req = badge.requirement as any;
        let earned = false;

        if (req.type === "mission_count" && (missionCount || 0) >= req.threshold) {
          earned = true;
        } else if (req.type === "streak" && (profile?.current_streak || 0) >= req.threshold) {
          earned = true;
        } else if (req.type === "hints_used" && hintsUsed >= req.threshold) {
          earned = true;
        }

        if (earned) {
          // Award badge
          await supabase.from("player_badges").insert({
            user_id: user.id,
            badge_id: badge.id,
          });

          // Award XP bonus
          if (badge.xp_bonus > 0) {
            await supabase.rpc("award_xp", {
              p_user_id: user.id,
              p_amount: badge.xp_bonus,
              p_source: `badge:${badge.slug}`,
            });
          }

          newlyEarned.push(badge);
        }
      }
    }

    return NextResponse.json({ success: true, newlyEarned });
  } catch (error) {
    console.error("Badge evaluation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

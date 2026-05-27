import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WorldMap from "@/components/game/WorldMap";

export default async function MapPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get player profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("level, current_streak, username, total_xp")
    .eq("id", user.id)
    .single();

  const playerLevel = profile?.level || 1;
  const currentStreak = profile?.current_streak || 0;
  const username = profile?.username || "Player";
  const totalXp = profile?.total_xp || 0;

  // Calculate player rank (number of users with strictly more XP + 1)
  const { count: higherXpCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gt("total_xp", totalXp);

  const playerRank = (higherXpCount || 0) + 1;

  // Get completed missions count grouped by region, including completion dates
  const { data: completions } = await supabase
    .from("mission_completions")
    .select(`
      mission_id,
      completed_at,
      missions (
        region_id,
        regions (slug)
      )
    `)
    .eq("user_id", user.id);

  // Calculate completed missions per region slug
  const completedMissions: Record<string, number> = {};
  
  if (completions) {
    for (const c of completions) {
      // @ts-ignore - Supabase types for joined tables can be tricky
      const slug = c.missions?.regions?.slug;
      if (slug) {
        completedMissions[slug] = (completedMissions[slug] || 0) + 1;
      }
    }
  }

  // Fetch Daily Quests
  const { data: dailyMissions } = await supabase
    .from("missions")
    .select("*, regions!inner(slug)")
    .eq("regions.slug", "daily-quests")
    .order("sort_order", { ascending: true });

  let dailyChallenge: any = null;
  let dailyCompleted = false;

  let dailyCompletionsCount = 0;

  if (dailyMissions && dailyMissions.length > 0) {
    // Pick one based on the current day of the year so it changes every day at midnight
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    dailyChallenge = dailyMissions[dayOfYear % dailyMissions.length];

    // Check if completed today
    if (completions) {
      const completionDate = completions.find(c => c.mission_id === dailyChallenge.id)?.completed_at;
      if (completionDate) {
        const compDate = new Date(completionDate);
        if (
          compDate.getFullYear() === now.getFullYear() &&
          compDate.getMonth() === now.getMonth() &&
          compDate.getDate() === now.getDate()
        ) {
          dailyCompleted = true;
        }
      }
    }

    // Get total players who completed it today
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const { count } = await supabase
      .from("mission_completions")
      .select("*", { count: "exact", head: true })
      .eq("mission_id", dailyChallenge.id)
      .gte("completed_at", startOfDay);
    
    dailyCompletionsCount = count || 0;
  }

  return (
    <WorldMap
      playerLevel={playerLevel}
      completedMissions={completedMissions}
      dailyChallenge={dailyChallenge}
      dailyCompleted={dailyCompleted}
      currentStreak={currentStreak}
      dailyCompletionsCount={dailyCompletionsCount}
      username={username}
      totalXp={totalXp}
      playerRank={playerRank}
    />
  );
}

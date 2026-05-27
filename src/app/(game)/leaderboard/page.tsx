import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GameCard from "@/components/ui/GameCard";
import { Trophy, UserRound } from "lucide-react";
import { calculateLevel, getLevelTitle } from "@/constants/xp";
import LeaderboardClient from "@/components/game/LeaderboardClient";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch top 50 players by total XP
  const { data: topPlayers } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, level, total_xp")
    .order("total_xp", { ascending: false })
    .limit(50);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-8">
      <LeaderboardClient topPlayers={topPlayers || []} currentUserId={user.id} />
    </div>
  );
}

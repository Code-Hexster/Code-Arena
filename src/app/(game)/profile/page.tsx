import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GameCard from "@/components/ui/GameCard";
import LogoutButton from "@/components/ui/LogoutButton";
import { UserRound, Flame } from "lucide-react";
import XpBar from "@/components/game/XpBar";
import ActivityHeatmap from "@/components/game/ActivityHeatmap";
import RankDisplay from "@/components/profile/RankDisplay";
import SettingsModal from "@/components/profile/SettingsModal";
import BadgeShowcase from "@/components/profile/BadgeShowcase";
import { calculateLevel, getLevelTitle } from "@/constants/xp";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <div>Profile not found</div>;
  }

  // Get recently completed missions
  const { data: completions } = await supabase
    .from("mission_completions")
    .select("*, missions(title, difficulty)")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(5);

  // Get all completion dates and xp for the heatmap
  const { data: allCompletions } = await supabase
    .from("mission_completions")
    .select("completed_at, xp_earned")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: true });

  const activityData = allCompletions 
    ? allCompletions.map((c: any) => ({
        date: c.completed_at,
        xp_earned: c.xp_earned || 0
      }))
    : [];

  const playerLevel = calculateLevel(profile.total_xp);
  const title = getLevelTitle(playerLevel);

  // Get user badges
  const { data: badgesData } = await supabase
    .from("player_badges")
    .select("*, badges(*)")
    .eq("user_id", profile.id);
  
  const earnedBadges = badgesData ? badgesData.map((pb: any) => pb.badges) : [];

  // Get all badges
  const { data: allBadgesData } = await supabase
    .from("badges")
    .select("*")
    .order("xp_bonus", { ascending: false });

  const allBadges = allBadgesData || [];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-8">
      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative w-32 h-32 rounded-full bg-void border-4 border-energy shadow-glow flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserRound className="w-12 h-12 text-energy" />
            )}
            <div className="absolute -bottom-2 bg-void px-3 py-1 rounded-full border border-energy/40 text-xs font-bold text-energy font-mono shadow-glow-sm">
              LVL {playerLevel}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
              <h1 className="font-display text-4xl text-parchment font-bold">
                {profile.display_name || profile.username}
              </h1>
              <div className="flex items-center gap-2">
                <SettingsModal currentDisplayName={profile.display_name || profile.username} currentAvatarUrl={profile.avatar_url} />
                <LogoutButton />
              </div>
            </div>
            
            <div className="mb-4 flex justify-center md:justify-start">
              <RankDisplay totalXp={profile.total_xp} currentLevel={playerLevel} />
            </div>
            
            <div className="max-w-md mx-auto md:mx-0">
              <XpBar currentXp={profile.total_xp} level={playerLevel} showDetails />
            </div>
          </div>
          
          {/* Badge Showcase Widget */}
          <div className="w-full md:w-auto self-stretch">
            <BadgeShowcase allBadges={allBadges} earnedBadges={earnedBadges} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Column */}
          <div className="md:col-span-1 space-y-6">
            <GameCard glowColor="purple">
              <h3 className="font-display text-2xl text-energy border-b border-energy/20 pb-2 mb-4 rune-glow">Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 hover:bg-energy-dim rounded-lg transition-colors">
                  <span className="text-mist uppercase tracking-wider text-xs">Total XP</span>
                  <span className="text-energy font-mono text-lg rune-glow">{profile.total_xp}</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-energy-dim rounded-lg transition-colors">
                  <span className="text-mist uppercase tracking-wider text-xs">Current Streak</span>
                  <span className="text-ember-400 font-mono text-lg drop-shadow-[0_0_8px_rgba(249,115,22,0.5)] flex items-center gap-1">{profile.current_streak} <Flame className="w-4 h-4 animate-pulse" /></span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-energy-dim rounded-lg transition-colors">
                  <span className="text-mist uppercase tracking-wider text-xs">Longest Streak</span>
                  <span className="text-energy/80 font-mono text-lg">{profile.longest_streak}</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-energy-dim rounded-lg transition-colors">
                  <span className="text-mist uppercase tracking-wider text-xs">Member Since</span>
                  <span className="text-smoke font-mono text-sm">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </GameCard>
          </div>

          {/* Activity Column */}
          <div className="md:col-span-2 space-y-6">
            <GameCard glowColor="purple">
              <h3 className="font-display text-2xl text-energy border-b border-energy/20 pb-2 mb-4 rune-glow">Recent Spells Cast</h3>
              
              {completions && completions.length > 0 ? (
                <div className="space-y-3">
                  {completions.map((comp: any) => (
                    <div key={comp.id} className="flex items-center justify-between p-4 bg-glass rounded-lg border border-energy/10 hover:border-energy/30 transition-colors shadow-inner">
                      <div>
                        <h4 className="text-parchment font-display text-lg tracking-wide">{comp.missions?.title}</h4>
                        <span className={`text-xs uppercase tracking-widest ${
                          comp.missions?.difficulty === "novice" ? "text-emerald-400" :
                          comp.missions?.difficulty === "apprentice" ? "text-gold-400" : "text-red-400"
                        }`}>
                          {comp.missions?.difficulty}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-energy font-mono text-lg rune-glow">+{comp.xp_earned} XP</div>
                        <div className="text-smoke text-xs font-mono">
                          {new Date(comp.completed_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-mist italic font-display text-lg">
                  <p>No spells cast yet. The ancient tome awaits your first incantation.</p>
                </div>
              )}
            </GameCard>

            {/* GitHub-style Activity Graph */}
            <ActivityHeatmap activityData={activityData} />
          </div>
        </div>

      </div>
    </div>
  );
}

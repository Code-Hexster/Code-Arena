import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GameCard from "@/components/ui/GameCard";
import { UserRound, Flame, Trophy } from "lucide-react";
import XpBar from "@/components/game/XpBar";
import ActivityHeatmap from "@/components/game/ActivityHeatmap";
import RankDisplay from "@/components/profile/RankDisplay";
import BadgeShowcase from "@/components/profile/BadgeShowcase";
import ProfileActions from "@/components/profile/ProfileActions";
import BackButton from "@/components/ui/BackButton";
import { calculateLevel, getLevelTitle } from "@/constants/xp";

interface PlayerProfileProps {
  params: Promise<{ username: string }>;
}

export default async function PlayerProfilePage({ params }: PlayerProfileProps) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Fetch profile by username
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", decodeURIComponent(username))
    .single();

  if (!profile) {
    notFound();
  }

  // Get recently completed missions
  const { data: completions } = await supabase
    .from("mission_completions")
    .select("*, missions(title, difficulty)")
    .eq("user_id", profile.id)
    .order("completed_at", { ascending: false })
    .limit(5);

  // Get all completion dates and xp for the heatmap
  const { data: allCompletions } = await supabase
    .from("mission_completions")
    .select("completed_at, xp_earned")
    .eq("user_id", profile.id)
    .order("completed_at", { ascending: true });

  const activityData = allCompletions 
    ? allCompletions.map((c: any) => ({
        date: c.completed_at,
        xp_earned: c.xp_earned || 0
      }))
    : [];

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

  const playerLevel = calculateLevel(profile.total_xp);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <BackButton />

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative w-32 h-32 rounded-full bg-void border-4 border-gold-500/60 shadow-[0_0_20px_rgba(244,208,104,0.3)] flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserRound className="w-12 h-12 text-gold-400" />
            )}
            <div className="absolute -bottom-2 bg-void px-3 py-1 rounded-full border border-gold-500/40 text-xs font-bold text-gold-400 font-mono shadow-[0_0_8px_rgba(244,208,104,0.2)]">
              LVL {playerLevel}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-display text-4xl text-parchment font-bold mb-2">
              {profile.display_name || profile.username}
            </h1>
            <div className="text-mist mb-4">@{profile.username}</div>
            
            <div className="mb-4 flex justify-center md:justify-start">
              <RankDisplay totalXp={profile.total_xp} currentLevel={playerLevel} />
            </div>
            
            <div className="max-w-md mx-auto md:mx-0">
              <XpBar currentXp={profile.total_xp} level={playerLevel} showDetails />
            </div>

            <div className="flex justify-center md:justify-start">
              <ProfileActions currentUserId={currentUser?.id} targetProfile={profile} />
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
            <GameCard glowColor="gold">
              <h3 className="font-display text-lg text-parchment border-b border-storm/30 pb-2 mb-4">Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-mist">Total XP</span>
                  <span className="text-gold-400 font-mono">{profile.total_xp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-mist">Current Streak</span>
                  <span className="text-ember-400 font-mono flex items-center gap-1">{profile.current_streak} <Flame className="w-4 h-4" /></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-mist">Longest Streak</span>
                  <span className="text-smoke font-mono">{profile.longest_streak}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-mist">Member Since</span>
                  <span className="text-smoke font-mono">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </GameCard>

            {/* Badges Section */}
            <GameCard glowColor="gold">
              <div className="flex items-center gap-2 border-b border-storm/30 pb-2 mb-4">
                <Trophy className="w-5 h-5 text-gold-400" />
                <h3 className="font-display text-lg text-parchment">Badges</h3>
              </div>
              
              {earnedBadges.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {earnedBadges.map((badge: any) => (
                    <div key={badge.id} className="flex flex-col items-center group relative cursor-help">
                      <div className="w-12 h-12 bg-shadow/60 border border-gold-500/30 rounded-full flex items-center justify-center text-2xl mb-1 shadow-[0_0_10px_rgba(251,191,36,0.15)] group-hover:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all">
                        {badge.icon_url}
                      </div>
                      <span className="text-[10px] text-center text-mist leading-tight">{badge.name}</span>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 w-32 p-2 bg-void border border-storm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                        <div className="text-xs text-parchment font-bold">{badge.name}</div>
                        <div className="text-[10px] text-smoke mt-1">{badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-smoke text-sm">
                  No badges earned yet.
                </div>
              )}
            </GameCard>
          </div>

          {/* Activity Column */}
          <div className="md:col-span-2 space-y-6">
            <GameCard glowColor="gold">
              <h3 className="font-display text-lg text-parchment border-b border-storm/30 pb-2 mb-4">Recent Spells Cast</h3>
              
              {completions && completions.length > 0 ? (
                <div className="space-y-3">
                  {completions.map((comp: any) => (
                    <div key={comp.id} className="flex items-center justify-between p-3 bg-shadow/40 rounded-lg border border-storm/20">
                      <div>
                        <h4 className="text-parchment font-medium">{comp.missions?.title}</h4>
                        <span className={`text-xs ${
                          comp.missions?.difficulty === "novice" ? "text-heal-400" :
                          comp.missions?.difficulty === "apprentice" ? "text-gold-400" : "text-danger-400"
                        }`}>
                          {comp.missions?.difficulty}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-gold-400 font-mono text-sm">+{comp.xp_earned} XP</div>
                        <div className="text-smoke text-xs">
                          {new Date(comp.completed_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-mist">
                  <p>No spells cast yet. The realm awaits their magic!</p>
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

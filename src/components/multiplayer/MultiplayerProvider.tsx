"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Swords, X, Check } from "lucide-react";
import type { Profile, MatchInvite } from "@/types/database";

interface MultiplayerContextType {
  challengeFriend: (friendId: string, missionId: string) => Promise<void>;
  challengeBot: (botId: string, missionId: string) => Promise<void>;
  activeInvite: (MatchInvite & { inviterProfile: Profile }) | null;
  declineInvite: () => void;
  acceptInvite: () => void;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export function MultiplayerProvider({ children, currentUserId }: { children: React.ReactNode; currentUserId?: string }) {
  const [activeInvite, setActiveInvite] = useState<(MatchInvite & { inviterProfile: Profile }) | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!currentUserId) return;

    // Listen to INSERTs on match_invites where invitee_id is currentUserId
    const channel = supabase
      .channel(`match_invites_${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "match_invites",
          filter: `invitee_id=eq.${currentUserId}`,
        },
        async (payload) => {
          const newInvite = payload.new as MatchInvite;
          
          if (newInvite.status === "pending") {
            // Fetch inviter profile
            const { data: inviter } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", newInvite.inviter_id)
              .single();

            if (inviter) {
              setActiveInvite({ ...newInvite, inviterProfile: inviter });
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "match_invites",
          filter: `inviter_id=eq.${currentUserId}`,
        },
        async (payload) => {
          const updatedInvite = payload.new as MatchInvite;
          // If we sent an invite and they accepted, we need to create the match and redirect
          if (updatedInvite.status === "accepted") {
            // Check if match already exists
            const { data: existingMatch } = await supabase
              .from("matches")
              .select("*")
              .eq("player1_id", currentUserId)
              .eq("player2_id", updatedInvite.invitee_id)
              .eq("mission_id", updatedInvite.mission_id)
              .eq("status", "in_progress")
              .single();
              
            let matchId = existingMatch?.id;

            if (!existingMatch) {
              const { data: newMatch, error } = await supabase
                .from("matches")
                .insert({
                  player1_id: currentUserId,
                  player2_id: updatedInvite.invitee_id,
                  mission_id: updatedInvite.mission_id,
                  status: "in_progress"
                })
                .select()
                .single();
                
              if (!error && newMatch) {
                matchId = newMatch.id;
              }
            }

            if (matchId) {
              router.push(`/arena/${matchId}`);
            }
          } else if (updatedInvite.status === "declined") {
             // We could show a toast here "User declined your invite"
             alert("Your 1v1 invite was declined.");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, router]);

  const challengeFriend = async (friendId: string, missionId: string) => {
    // 1. Create a pending match_invite
    await supabase.from("match_invites").insert({
      inviter_id: currentUserId!,
      invitee_id: friendId,
      mission_id: missionId,
      status: "pending",
    });
    alert("Challenge sent! Waiting for them to accept...");
  };

  const challengeBot = async (botId: string, missionId: string) => {
    // Bots accept instantly, bypass match_invites and create match directly
    const { data: newMatch, error } = await supabase
      .from("matches")
      .insert({
        player1_id: currentUserId!,
        player2_id: botId,
        mission_id: missionId,
        status: "in_progress"
      })
      .select()
      .single();
      
    if (!error && newMatch) {
      router.push(`/arena/${newMatch.id}`);
    } else {
      alert("Failed to challenge bot.");
    }
  };

  const declineInvite = async () => {
    if (!activeInvite) return;
    await supabase
      .from("match_invites")
      .update({ status: "declined" })
      .eq("id", activeInvite.id);
    setActiveInvite(null);
  };

  const acceptInvite = async () => {
    if (!activeInvite) return;
    
    // Update invite status
    await supabase
      .from("match_invites")
      .update({ status: "accepted" })
      .eq("id", activeInvite.id);
    
    // Wait a brief moment for the inviter to create the match row via their listener,
    // or we can just fetch the match if it exists. Actually, to avoid race conditions,
    // the invitee can also try to create the match using ON CONFLICT, but we don't have unique constraint.
    // Let's just wait 1s and query the match.
    setActiveInvite(null);
    setTimeout(async () => {
       const { data: match } = await supabase
          .from("matches")
          .select("*")
          .eq("player1_id", activeInvite.inviter_id)
          .eq("player2_id", currentUserId)
          .eq("mission_id", activeInvite.mission_id)
          .eq("status", "in_progress")
          .single();
       
       if (match) {
         router.push(`/arena/${match.id}`);
       }
    }, 1500);
  };

  return (
    <MultiplayerContext.Provider value={{ challengeFriend, challengeBot, activeInvite, declineInvite, acceptInvite }}>
      {children}
      {/* Global Invite Modal */}
      {activeInvite && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-void/80 backdrop-blur-sm p-4">
          <div className="bg-obsidian border border-ember-500/30 rounded-xl p-6 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-ember-500/20 border border-ember-500 flex items-center justify-center mb-4">
                <Swords className="w-8 h-8 text-ember-400" />
              </div>
              <h2 className="text-xl font-bold text-parchment mb-2">1v1 Challenge!</h2>
              <p className="text-mist mb-6">
                <strong className="text-white">{activeInvite.inviterProfile.display_name || activeInvite.inviterProfile.username}</strong> has challenged you to a coding battle!
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={declineInvite}
                  className="flex-1 py-3 px-4 rounded-lg bg-void border border-storm/30 text-mist hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Decline
                </button>
                <button
                  onClick={acceptInvite}
                  className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-ember-600 to-ember-500 text-white font-bold hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Accept & Fight
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayer() {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error("useMultiplayer must be used within a MultiplayerProvider");
  }
  return context;
}

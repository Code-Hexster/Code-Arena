"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck, UserX, Swords } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useMultiplayer } from "../multiplayer/MultiplayerProvider";
import type { Profile } from "@/types/database";

interface ProfileActionsProps {
  currentUserId?: string;
  targetProfile: Profile;
}

export default function ProfileActions({ currentUserId, targetProfile }: ProfileActionsProps) {
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "friends">("none");
  const [loading, setLoading] = useState(true);
  const { challengeFriend, challengeBot } = useMultiplayer();
  const supabase = createClient();
  
  const isBot = targetProfile.username.includes("[BOT]");

  useEffect(() => {
    if (!currentUserId || currentUserId === targetProfile.id || isBot) {
      setLoading(false);
      return;
    }

    const checkFriendStatus = async () => {
      const { data } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_id_1.eq.${currentUserId},user_id_2.eq.${currentUserId}`)
        .or(`user_id_1.eq.${targetProfile.id},user_id_2.eq.${targetProfile.id}`);

      if (data && data.length > 0) {
        // Find the specific friendship
        const friendship = data.find(f => 
          (f.user_id_1 === currentUserId && f.user_id_2 === targetProfile.id) ||
          (f.user_id_2 === currentUserId && f.user_id_1 === targetProfile.id)
        );

        if (friendship) {
          setFriendStatus(friendship.status === "accepted" ? "friends" : "pending");
        }
      }
      setLoading(false);
    };

    checkFriendStatus();
  }, [currentUserId, targetProfile.id, isBot, supabase]);

  if (!currentUserId || currentUserId === targetProfile.id) {
    return null; // Don't show actions for own profile or logged out users
  }

  const handleAddFriend = async () => {
    if (isBot) return; // Can't add bots as friends
    
    setLoading(true);
    await supabase.from("friendships").insert({
      user_id_1: currentUserId,
      user_id_2: targetProfile.id,
      status: "pending"
    });
    setFriendStatus("pending");
    setLoading(false);
  };

  const handleChallenge = async () => {
    // Pick a random mission
    const { data: missions } = await supabase.from("missions").select("id").limit(10);
    if (!missions || missions.length === 0) {
      alert("No missions available for 1v1!");
      return;
    }
    const randomMission = missions[Math.floor(Math.random() * missions.length)];
    
    if (isBot) {
      await challengeBot(targetProfile.id, randomMission.id);
    } else {
      await challengeFriend(targetProfile.id, randomMission.id);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {/* Friend Request Button (Hidden for bots) */}
      {!isBot && (
        <button
          onClick={handleAddFriend}
          disabled={loading || friendStatus !== "none"}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            friendStatus === "friends" 
              ? "bg-arcane-500/20 text-arcane-300 border border-arcane-500/50 cursor-default"
              : friendStatus === "pending"
                ? "bg-storm/30 text-mist border border-storm/50 cursor-default"
                : "bg-arcane-600 hover:bg-arcane-500 text-white shadow-glow"
          }`}
        >
          {loading ? (
             <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : friendStatus === "friends" ? (
            <><UserCheck className="w-4 h-4" /> Friends</>
          ) : friendStatus === "pending" ? (
            <><UserPlus className="w-4 h-4 opacity-50" /> Pending Request</>
          ) : (
            <><UserPlus className="w-4 h-4" /> Add Friend</>
          )}
        </button>
      )}

      {/* Challenge Button */}
      {(isBot || friendStatus === "friends") && (
        <button
          onClick={handleChallenge}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ember-600 to-ember-500 hover:from-ember-500 hover:to-ember-400 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all"
        >
          <Swords className="w-4 h-4" />
          Challenge 1v1
        </button>
      )}
    </div>
  );
}

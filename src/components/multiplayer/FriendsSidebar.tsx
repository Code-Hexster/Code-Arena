"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UserPlus, Check, Swords, User, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Friendship, Mission } from "@/types/database";
import { useMultiplayer } from "./MultiplayerProvider";

interface FriendsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export default function FriendsSidebar({ isOpen, onClose, currentUserId }: FriendsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [friends, setFriends] = useState<(Friendship & { friendProfile: Profile })[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<(Friendship & { friendProfile: Profile })[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<(Friendship & { friendProfile: Profile })[]>([]);
  const [bots, setBots] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { challengeFriend: sendChallenge, challengeBot } = useMultiplayer();

  const supabase = createClient();

  useEffect(() => {
    if (isOpen && currentUserId) {
      loadFriendsData();
    }
  }, [isOpen, currentUserId]);

  const loadFriendsData = async () => {
    // We need to fetch all friendships involving the current user
    const { data: friendships, error } = await supabase
      .from("friendships")
      .select("*")
      .or(`user_id_1.eq.${currentUserId},user_id_2.eq.${currentUserId}`);

    if (error || !friendships) return;

    // To display friend details, we need to fetch their profiles
    const friendIds = friendships.map(f => 
      f.user_id_1 === currentUserId ? f.user_id_2 : f.user_id_1
    );

    if (friendIds.length === 0) {
      setFriends([]);
      setIncomingRequests([]);
      setOutgoingRequests([]);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", friendIds);

    if (!profiles) return;

    const enrichedFriendships = friendships.map(f => {
      const friendId = f.user_id_1 === currentUserId ? f.user_id_2 : f.user_id_1;
      const profile = profiles.find(p => p.id === friendId);
      return { ...f, friendProfile: profile! };
    }).filter(f => f.friendProfile !== undefined); // Ensure profile exists

    setFriends(enrichedFriendships.filter(f => f.status === "accepted"));
    setIncomingRequests(enrichedFriendships.filter(f => f.status === "pending" && f.user_id_2 === currentUserId));
    setOutgoingRequests(enrichedFriendships.filter(f => f.status === "pending" && f.user_id_1 === currentUserId));

    // Fetch bots
    const { data: botProfiles } = await supabase
      .from("profiles")
      .select("*")
      .like("username", "%[BOT]%");
      
    if (botProfiles) {
      setBots(botProfiles);
    }
  };

  const searchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${query}%`)
      .neq("id", currentUserId)
      .limit(5);

    if (!error && data) {
      setSearchResults(data);
    }
    setLoading(false);
  };

  const sendFriendRequest = async (targetUserId: string) => {
    await supabase.from("friendships").insert({
      user_id_1: currentUserId,
      user_id_2: targetUserId,
      status: "pending",
    });
    
    // Clear search and reload
    setSearchQuery("");
    setSearchResults([]);
    loadFriendsData();
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);
    
    loadFriendsData();
  };

  const challengeSpecificUser = async (targetId: string, isBot: boolean = false) => {
    const { data: missions, error } = await supabase
      .from("missions")
      .select("id")
      .limit(10);
      
    if (error || !missions || missions.length === 0) {
      alert("No missions available for 1v1!");
      return;
    }
    
    const randomMission = missions[Math.floor(Math.random() * missions.length)];
    
    if (isBot) {
      await challengeBot(targetId, randomMission.id);
    } else {
      await sendChallenge(targetId, randomMission.id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-void/80 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-obsidian border-l border-arcane-500/20 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-arcane-500/20 bg-void/50">
              <h2 className="font-display font-bold text-xl text-parchment flex items-center gap-2">
                <User className="w-5 h-5 text-arcane-400" />
                Friends Arena
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-mist hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" />
                <input
                  type="text"
                  placeholder="Find coders by username..."
                  value={searchQuery}
                  onChange={(e) => searchUsers(e.target.value)}
                  className="w-full bg-void/50 border border-storm/30 rounded-lg pl-10 pr-4 py-2 text-sm text-parchment focus:outline-none focus:border-arcane-500 transition-colors"
                />
              </div>

              {/* Search Results */}
              {searchQuery.length >= 3 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-mist uppercase tracking-wider mb-3">Search Results</h3>
                  {loading ? (
                    <div className="text-sm text-mist text-center py-4">Searching arcane records...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(profile => (
                      <div key={profile.id} className="flex items-center justify-between bg-void/30 p-3 rounded-lg border border-storm/20">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-arcane-500 to-arcane-700 flex items-center justify-center font-bold text-xs">
                            {profile.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-parchment">{profile.display_name || profile.username}</div>
                            <div className="text-xs text-mist">Lvl {profile.level}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => sendFriendRequest(profile.id)}
                          className="p-2 hover:bg-arcane-500/20 text-arcane-400 hover:text-arcane-300 rounded-lg transition-colors"
                          title="Add Friend"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-mist text-center py-4">No mages found matching "{searchQuery}"</div>
                  )}
                </div>
              )}

              {/* Incoming Requests */}
              {incomingRequests.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-arcane-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-arcane-500 animate-pulse" />
                    Incoming Requests
                  </h3>
                  {incomingRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between bg-arcane-900/20 p-3 rounded-lg border border-arcane-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ember-500 to-ember-700 flex items-center justify-center font-bold text-xs">
                          {req.friendProfile.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-parchment">{req.friendProfile.display_name || req.friendProfile.username}</div>
                          <div className="text-xs text-arcane-400">Wants to battle</div>
                        </div>
                      </div>
                      <button
                        onClick={() => acceptFriendRequest(req.id)}
                        className="px-3 py-1.5 bg-arcane-600 hover:bg-arcane-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Friends List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-mist uppercase tracking-wider mb-3">Your Allies</h3>
                {friends.length > 0 ? (
                  friends.map(friend => (
                    <div key={friend.id} className="group flex items-center justify-between bg-void/30 p-3 rounded-lg border border-storm/20 hover:border-gold-500/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-ember-600 flex items-center justify-center font-bold text-sm overflow-hidden">
                            {friend.friendProfile.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={friend.friendProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              friend.friendProfile.username[0].toUpperCase()
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-sm text-parchment group-hover:text-gold-400 transition-colors">
                            {friend.friendProfile.display_name || friend.friendProfile.username}
                          </div>
                          <div className="text-xs text-mist">Lvl {friend.friendProfile.level} • {friend.friendProfile.total_xp} XP</div>
                        </div>
                      </div>
                      <button
                        onClick={() => challengeSpecificUser(friend.friendProfile.id)}
                        className="p-2 hover:bg-ember-500/20 text-ember-400 hover:text-ember-300 rounded-lg transition-colors flex items-center justify-center group-hover:bg-ember-500/10"
                        title="Challenge to 1v1"
                      >
                        <Swords className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-mist/60 text-center py-8 border border-dashed border-storm/20 rounded-lg">
                    You have no allies yet.<br/>Search for coders above to build your guild.
                  </div>
                )}
              </div>
              
              {/* Outgoing Requests */}
              {outgoingRequests.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-storm/20">
                  <h3 className="text-xs font-bold text-mist/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Pending Outgoing
                  </h3>
                  {outgoingRequests.map(req => (
                    <div key={req.id} className="flex items-center gap-3 bg-void/10 p-2 rounded-lg opacity-60">
                      <div className="w-6 h-6 rounded-full bg-storm/30 flex items-center justify-center font-bold text-[10px]">
                        {req.friendProfile.username[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-mist">{req.friendProfile.display_name || req.friendProfile.username}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bots */}
              {bots.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-storm/20">
                  <h3 className="text-xs font-bold text-arcane-300 uppercase tracking-wider mb-3">Practice Bots</h3>
                  {bots.map(bot => (
                    <div key={bot.id} className="group flex items-center justify-between bg-arcane-900/10 p-3 rounded-lg border border-arcane-500/20 hover:border-arcane-500/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-void border border-arcane-500/30 flex items-center justify-center font-bold text-sm text-arcane-400">
                          {bot.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-parchment flex items-center gap-2">
                            {bot.display_name || bot.username}
                            <span className="text-[10px] bg-arcane-500/20 text-arcane-300 px-1.5 py-0.5 rounded font-mono">BOT</span>
                          </div>
                          <div className="text-xs text-mist">Lvl {bot.level}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => challengeSpecificUser(bot.id, true)}
                        className="p-2 bg-void hover:bg-arcane-500/20 text-arcane-400 hover:text-arcane-300 border border-storm/30 hover:border-arcane-500/50 rounded-lg transition-colors"
                        title="Challenge Bot"
                      >
                        <Swords className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import GameCard from "@/components/ui/GameCard";
import { Trophy, UserRound, Crown, Medal, Flame, TrendingUp, Sparkles, Swords } from "lucide-react";
import { calculateLevel, getLevelTitle } from "@/constants/xp";

interface LeaderboardClientProps {
  topPlayers: any[];
  currentUserId: string;
}

export default function LeaderboardClient({ topPlayers, currentUserId }: LeaderboardClientProps) {
  const top3 = topPlayers.slice(0, 3);
  const rest = topPlayers.slice(3);

  // Reorder top 3 for podium: [ #2, #1, #3 ]
  const podiumOrder = [];
  if (top3[1]) podiumOrder.push({ ...top3[1], rank: 2 });
  if (top3[0]) podiumOrder.push({ ...top3[0], rank: 1 });
  if (top3[2]) podiumOrder.push({ ...top3[2], rank: 3 });

  // Current user stats
  const currentUserObj = topPlayers.find(p => p.id === currentUserId);
  const currentUserRank = topPlayers.findIndex(p => p.id === currentUserId) + 1;

  // Mock data for rising stars based on existing players
  const risingStars = topPlayers.slice(4, 7).map((p, i) => ({
    ...p,
    weekly_gained: [450, 320, 210][i] || 150
  }));

  const topPlayerXp = top3[0]?.total_xp || 1000;
  const myXp = currentUserObj?.total_xp || 0;
  const xpPercentage = Math.min(100, Math.max(0, (myXp / topPlayerXp) * 100));

  const recentAchievements = [
    `${top3[0]?.username || "A hero"} just reached Legendary Coder`,
    `${top3[1]?.username || "ScriptMaster"} solved 5 challenges today`,
    `${top3[2]?.username || "CSS_Phantom"} unlocked a new realm`,
    `${topPlayers[4]?.username || "ByteNinja"} earned the 'Bug Squasher' title`,
    `A new weekly challenge has appeared in the Realm of Code!`
  ];

  const getRingColor = (rank: number) => {
    switch (rank) {
      case 1: return "ring-gold-500 shadow-glow-gold border-gold-500";
      case 2: return "ring-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.4)] border-slate-300";
      case 3: return "ring-amber-600 shadow-[0_0_15px_rgba(217,148,74,0.4)] border-amber-600";
      default: return "border-energy/20";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-gold-400 drop-shadow-md" />;
      case 2: return <Medal className="w-5 h-5 text-slate-300 drop-shadow-md" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600 drop-shadow-md" />;
      default: return null;
    }
  };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 35 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 24 } }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 page-transition-wrapper">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <Trophy className="w-10 h-10 text-gold-400 drop-shadow-glow-gold" />
        </div>
        <h1 className="font-display-dec text-3xl text-parchment font-bold mb-2 tracking-wider uppercase">
          Champions Registry
        </h1>
        <p className="text-mist text-base font-serif-cormorant italic">
          The most powerful wizards inscribed in the scrolls
        </p>
      </div>

      {/* Podium Section */}
      {top3.length > 0 && (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex justify-center items-end gap-4 md:gap-8 mt-12 pt-4 mb-8"
        >
          {podiumOrder.map((player) => {
            const isFirst = player.rank === 1;
            const level = calculateLevel(player.total_xp || 0);
            
            return (
              <motion.div 
                key={player.id} 
                variants={item}
                className={`relative flex flex-col items-center w-28 md:w-40 ${
                  isFirst ? "order-2 z-20" : player.rank === 2 ? "order-1 z-10" : "order-3 z-10"
                }`}
              >
                {/* Floating Rank Icon */}
                <div className={`absolute ${isFirst ? "-top-10" : "-top-8"} z-35 flex flex-col items-center animate-bounce`}>
                  {getRankIcon(player.rank)}
                </div>

                {/* Avatar */}
                <Link href={`/player/${player.username}`} className="relative group cursor-pointer z-20">
                  <div className={`w-18 h-18 md:w-22 md:h-22 rounded-full bg-black border-4 ring-2 ring-offset-4 ring-offset-void flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 ${getRingColor(player.rank)}`}>
                    {player.avatar_url ? (
                      <img src={player.avatar_url} alt={player.username} className="w-full h-full object-cover" />
                    ) : (
                      <UserRound className="w-8 h-8 text-gold-500/40" />
                    )}
                  </div>
                </Link>

                {/* Podium Stand Card */}
                <div className={`w-full mt-4 rounded-t-xl border border-b-0 flex flex-col items-center pt-4 pb-3 px-2 shadow-card relative overflow-hidden group ${
                  isFirst 
                    ? "h-44 bg-gradient-to-t from-[rgba(244,208,104,0.08)] to-glass border-gold-500/35" 
                    : player.rank === 2
                      ? "h-36 bg-gradient-to-t from-slate-400/5 to-glass border-slate-500/20"
                      : "h-30 bg-gradient-to-t from-amber-600/5 to-glass border-amber-700/20"
                }`}>
                  <div className={`absolute -bottom-10 w-28 h-28 rounded-full blur-2xl opacity-60 ${
                    isFirst ? "bg-gold-500/20" : player.rank === 2 ? "bg-slate-400/15" : "bg-amber-600/15"
                  }`} />

                  <div className="relative z-10 text-center w-full">
                    <h3 className={`font-display font-bold text-xs md:text-sm truncate px-1 ${
                      isFirst ? "text-gold-400" : player.rank === 2 ? "text-slate-300" : "text-amber-600"
                    }`}>
                      {player.display_name || player.username}
                    </h3>
                    <p className="text-[10px] text-mist mt-1">Lv. {level}</p>
                    <div className="mt-2.5 inline-block px-3 py-0.5 rounded-full bg-black/50 border border-white/5">
                      <span className="font-mono text-xs font-bold text-parchment">{player.total_xp}</span>
                      <span className="text-[9px] text-smoke ml-1 font-display">XP</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Rest of the Leaderboard Table */}
      <div className="relative z-10 mt-8">
        <div className="bg-glass rounded-2xl border border-energy/20 overflow-hidden shadow-card p-0">
          <div className="divide-y divide-energy/10 bg-glass/40">
            {rest.length > 0 ? (
              rest.map((player: any, index: number) => {
                const actualRank = index + 4;
                const isCurrentUser = player.id === currentUserId;
                const playerLevel = calculateLevel(player.total_xp || 0);
                const title = getLevelTitle(playerLevel);

                return (
                  <Link 
                    href={`/player/${player.username}`}
                    key={player.id} 
                    className={`flex items-center gap-4 p-4.5 transition-all group border-b border-energy/5 last:border-0 ${
                      isCurrentUser 
                        ? "bg-energy-dim border-l-4 border-l-energy shadow-inner" 
                        : "hover:bg-glass/80 hover:scale-[1.01] hover:shadow-card-hover"
                    }`}
                  >
                    <div className="w-8 text-center font-display text-smoke font-bold text-sm">
                      #{actualRank}
                    </div>
                    
                    <div className={`relative w-11 h-11 rounded-full bg-void border flex items-center justify-center overflow-hidden shrink-0 transition-colors ${
                      isCurrentUser ? "border-energy ring-2 ring-energy/20" : "border-energy/15 group-hover:border-energy/45"
                    }`}>
                      {player.avatar_url ? (
                        <img src={player.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserRound className="w-5 h-5 text-gold-500/30" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3 className={`font-display text-sm font-semibold truncate transition-colors ${isCurrentUser ? "text-energy rune-glow" : "text-parchment group-hover:text-white"}`}>
                          {player.display_name || player.username}
                        </h3>
                        {isCurrentUser && <span className="text-[8px] uppercase bg-energy/20 text-energy px-2 py-0.5 rounded font-bold tracking-wider font-display">You</span>}
                      </div>
                      <p className="text-[10px] text-mist truncate">Lv. {playerLevel} • {title}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono text-energy font-bold group-hover:text-white transition-colors">{player.total_xp}</div>
                      <div className="text-[8px] text-smoke uppercase font-bold tracking-widest font-display">XP</div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-8 text-center text-mist italic font-serif-cormorant text-base">
                Only the top 3 legends have emerged so far.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Bottom Section */}
      <div className="pt-10 pb-6 space-y-12">
        
        {/* Comparison & Motivation */}
        {currentUserObj && (
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-glass border border-energy/20 rounded-2xl p-7 shadow-card relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-energy via-gold-500 to-energy" />
              
              <h3 className="text-gold-500 font-display font-bold text-lg mb-3 flex items-center justify-center gap-2.5 uppercase tracking-widest drop-shadow-glow-gold">
                <Swords className="w-4 h-4" /> 
                Magical Resonance Status
              </h3>
              
              <p className="text-mist text-sm mb-5 font-serif-cormorant italic text-base">
                You're <strong className="text-gold-400 font-mono font-bold not-italic">{topPlayerXp - myXp > 0 ? topPlayerXp - myXp : 0} XP</strong> away from the throne. Keep casting spells! ⚔️
              </p>

              {/* Progress Bar */}
              <div className="relative h-2 bg-void rounded-full overflow-hidden border border-energy/10 mb-3">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${xpPercentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-energy/60 to-energy rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold font-mono">
                <span className="text-energy/80">You: {myXp} XP</span>
                <span className="text-gold-500">Leader: {topPlayerXp} XP</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* This Week's Rising Stars */}
        {risingStars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2 justify-center">
              <TrendingUp className="w-4 h-4 text-energy" />
              <h2 className="text-lg font-display font-bold uppercase tracking-widest text-parchment">This week's rising stars</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {risingStars.map((star, idx) => (
                <div key={star.id || idx} className="bg-glass border border-energy/15 rounded-xl p-4 flex items-center gap-4 hover:border-energy/40 transition-all hover:scale-[1.02] group">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-energy/20">
                      {star.avatar_url ? (
                        <img src={star.avatar_url} alt={star.username} className="w-full h-full object-cover" />
                      ) : (
                        <UserRound className="w-5 h-5 m-auto mt-2 text-gold-500/40" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-void rounded-full border border-energy/30 flex items-center justify-center">
                      <Flame className="w-2.5 h-2.5 text-ember-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="font-display font-bold text-parchment text-xs group-hover:text-energy transition-colors truncate">{star.display_name || star.username}</h4>
                    <p className="text-[10px] text-mist">Lv. {calculateLevel(star.total_xp || 0)}</p>
                    <div className="text-[10px] text-energy font-bold mt-1 font-mono">+{star.weekly_gained} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Marquee Achievement Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative w-full bg-glass/30 border-y border-energy/10 py-3 overflow-hidden flex items-center rounded-xl"
        >
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-void to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-void to-transparent z-10" />
          
          <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite] items-center gap-8 px-4">
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}} />
            
            <div className="flex items-center gap-8 shrink-0">
              {recentAchievements.map((ach, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-gold-400" />
                  <span className="text-mist text-[9px] font-display tracking-widest uppercase font-bold">{ach}</span>
                  <span className="text-gold-500/10 mx-4">•</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-8 shrink-0">
              {recentAchievements.map((ach, idx) => (
                <div key={`dup-${idx}`} className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-gold-400" />
                  <span className="text-mist text-[9px] font-display tracking-widest uppercase font-bold">{ach}</span>
                  <span className="text-gold-500/10 mx-4">•</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

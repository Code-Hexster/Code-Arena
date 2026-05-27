"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Lock } from "lucide-react";
import type { Badge } from "@/types/database";

interface BadgeShowcaseProps {
  allBadges: Badge[];
  earnedBadges: Badge[];
}

export default function BadgeShowcase({ allBadges, earnedBadges }: BadgeShowcaseProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Sort earned badges by XP bonus to get the "best" 3
  const topBadges = [...earnedBadges]
    .sort((a, b) => b.xp_bonus - a.xp_bonus)
    .slice(0, 3);

  const lockedBadges = allBadges.filter(
    (badge) => !earnedBadges.some((eb) => eb.id === badge.id)
  );

  return (
    <>
      {/* Mini Showcase Widget (The "Red Box" replacement) */}
      <div 
        onClick={() => setIsOpen(true)}
        className="flex-1 min-w-[200px] cursor-pointer group bg-void/60 border border-gold-500/30 rounded-xl p-4 transition-all hover:bg-void/80 hover:border-gold-400 hover:shadow-[0_0_20px_rgba(244,208,104,0.1)] flex flex-col justify-center items-center h-full relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 to-amber-500"></div>
        <h3 className="text-[10px] font-bold text-mist uppercase tracking-widest mb-3 w-full text-center group-hover:text-gold-300 font-display transition-colors">
          Top Badges
        </h3>
        
        {topBadges.length > 0 ? (
          <div className="flex gap-4 justify-center items-center">
            {topBadges.map((badge, idx) => (
              <motion.div 
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="text-3xl mb-1 drop-shadow-glow group-hover:scale-110 transition-transform duration-300">
                  {badge.icon_url?.includes(".png") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={badge.icon_url} alt={badge.name} className="w-10 h-10 object-contain drop-shadow-glow" />
                  ) : (
                    badge.icon_url
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-smoke py-2">
            <Trophy className="w-8 h-8 mb-2 opacity-20" />
            <span className="text-[10px] font-display uppercase tracking-widest font-semibold">No badges yet</span>
          </div>
        )}
      </div>

      {/* Full Badge Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-void border border-gold-500/25 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gold-500/10 bg-void">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-gold-400 drop-shadow-[0_0_8px_rgba(244,208,104,0.4)]" />
                  <h2 className="font-display-dec text-lg text-parchment font-bold tracking-widest uppercase">Badge Collection</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-mist hover:text-gold-400 hover:bg-gold-500/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 scrollbar-thin">
                {/* Earned Badges Section */}
                <div className="mb-8">
                  <h3 className="text-xs font-semibold text-gold-400 font-display uppercase tracking-widest mb-4 flex items-center gap-2">
                    Earned Badges ({earnedBadges.length})
                    <div className="h-px bg-gold-400/20 flex-1"></div>
                  </h3>
                  
                  {earnedBadges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {earnedBadges.map(badge => (
                        <div key={badge.id} className="bg-void border border-gold-500/20 rounded-xl p-4 flex flex-col items-center text-center shadow-[0_0_15px_rgba(244,208,104,0.06)] shadow-inner">
                          <span className="text-4xl mb-3 drop-shadow-glow">
                            {badge.icon_url?.includes(".png") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={badge.icon_url} alt={badge.name} className="w-16 h-16 object-contain drop-shadow-glow" />
                            ) : (
                              badge.icon_url
                            )}
                          </span>
                          <span className="text-sm font-bold text-parchment leading-tight mb-1">{badge.name}</span>
                          <span className="text-[10px] text-mist">{badge.description}</span>
                          <span className="mt-2 text-[9px] font-mono font-bold tracking-wider text-gold-400 bg-gold-400/5 border border-gold-500/25 px-2 py-0.5 rounded-full uppercase">
                            +{badge.xp_bonus} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed border-gold-500/10 rounded-xl text-smoke text-sm font-serif-cormorant italic">
                      Complete missions and regions to earn your first badge!
                    </div>
                  )}
                </div>

                {/* Locked Badges Section */}
                <div>
                  <h3 className="text-xs font-semibold text-smoke font-display uppercase tracking-widest mb-4 flex items-center gap-2">
                    Locked Badges ({lockedBadges.length})
                    <div className="h-px bg-gold-500/10 flex-1"></div>
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {lockedBadges.map(badge => (
                      <div key={badge.id} className="bg-void/50 border border-gold-500/10 rounded-xl p-4 flex flex-col items-center text-center opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                        <div className="relative">
                          <span className="text-4xl mb-3 block">
                            {badge.icon_url?.includes(".png") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={badge.icon_url} alt={badge.name} className="w-16 h-16 object-contain drop-shadow-glow" />
                            ) : (
                              badge.icon_url
                            )}
                          </span>
                          <div className="absolute -top-2 -right-2 bg-void rounded-full p-1 border border-gold-500/25">
                            <Lock className="w-3 h-3 text-smoke" />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-mist leading-tight mb-1">{badge.name}</span>
                        <span className="text-[10px] text-smoke line-clamp-2">{badge.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

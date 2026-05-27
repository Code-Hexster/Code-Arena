"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Lock, Unlock, Sparkles, X, Shield } from "lucide-react";
import { LEVEL_TITLES, XP_PER_LEVEL, getLevelTitle } from "@/constants/xp";

interface RankDisplayProps {
  totalXp: number;
  currentLevel: number;
}

export default function RankDisplay({ currentLevel }: RankDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentTitle = getLevelTitle(currentLevel);

  // Get all rank thresholds sorted ascending
  const rankLevels = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => a - b);

  // Find the index of the user's current rank
  let currentRankIndex = 0;
  for (let i = 0; i < rankLevels.length; i++) {
    if (currentLevel >= rankLevels[i]) {
      currentRankIndex = i;
    }
  }

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 group transition-all bg-gold-900/10 hover:bg-gold-500/10 border border-gold-500/25 px-4 py-2 rounded-full shadow-[0_0_10px_rgba(244,208,104,0.05)] hover:shadow-[0_0_15px_rgba(244,208,104,0.15)]"
      >
        <Shield className="w-5 h-5 text-gold-400 group-hover:scale-105 transition-transform" />
        <p className="text-gold-400 font-display text-base tracking-widest uppercase group-hover:text-gold-300 transition-colors">
          {currentTitle}
        </p>
        <ChevronRight className="w-4 h-4 text-gold-500" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-void/90 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-void border border-gold-500/30 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-void border-b border-gold-500/15">
              <h4 className="text-sm font-bold text-gold-400 font-display tracking-widest uppercase flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-400 drop-shadow-[0_0_8px_rgba(244,208,104,0.4)]" />
                The Tome of Ranks
              </h4>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-mist hover:text-gold-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {rankLevels.map((lvl, index) => {
                const rankName = LEVEL_TITLES[lvl];
                const requiredXp = (lvl - 1) * XP_PER_LEVEL;
                const isUnlocked = currentLevel >= lvl;
                const isNextRank = index === currentRankIndex + 1;
                const isTooFar = index > currentRankIndex + 1;

                return (
                  <div
                    key={lvl}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isUnlocked
                        ? "bg-gold-500/5 border-gold-500/20 text-gold-300"
                        : isNextRank
                        ? "bg-gold-500/10 border-gold-500/40 text-gold-100 shadow-[0_0_15px_rgba(244,208,104,0.15)]"
                        : "bg-void border-white/5 text-mist/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${isUnlocked ? 'bg-gold-500/10 border border-gold-500/20' : isNextRank ? 'bg-gold-500/20 border border-gold-500/30' : 'bg-white/5 border border-transparent'}`}>
                        {isUnlocked ? (
                          <Unlock className="w-4 h-4 text-gold-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-current" />
                        )}
                      </div>
                      <div>
                        <span className="font-display font-bold text-sm tracking-wider uppercase block leading-none">
                          {isUnlocked || isNextRank ? rankName : "???"}
                        </span>
                        <span className="text-[10px] font-mono tracking-widest uppercase opacity-70">
                          Level {lvl}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {isUnlocked ? (
                        <span className="text-xs font-bold text-gold-400 tracking-wider font-display uppercase">Unlocked</span>
                      ) : isTooFar ? (
                        <span className="text-xs font-bold text-mist/20 font-mono tracking-wider">??? XP</span>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-gold-400 font-mono font-bold">{requiredXp} XP</span>
                          <span className="text-[9px] uppercase tracking-widest opacity-60">Required</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-void border-t border-gold-500/10 text-center">
              <p className="text-[10px] text-smoke uppercase tracking-wider font-semibold">
                Gain XP by completing missions and maintaining your daily streak.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

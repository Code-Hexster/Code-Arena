"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

import { xpProgress } from "@/constants/xp";

interface XpBarProps {
  currentXp: number; // Actually totalXp
  level: number;
  className?: string;
  showDetails?: boolean;
  animate?: boolean;
}

export default function XpBar({
  currentXp,
  level,
  className = "",
  showDetails = true,
  animate: shouldAnimate = true,
}: XpBarProps) {
  const { currentLevelXp, nextLevelXp, progressPercent } = xpProgress(currentXp);
  const percentage = progressPercent;
  const motionWidth = useMotionValue(0);
  const displayWidth = useTransform(motionWidth, (v) => `${v}%`);

  useEffect(() => {
    if (shouldAnimate) {
      animate(motionWidth, percentage, {
        duration: 1,
        ease: "easeOut",
      });
    } else {
      motionWidth.set(percentage);
    }
  }, [percentage, shouldAnimate, motionWidth]);

  return (
    <div className={`w-full ${className}`}>
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-display text-gold-400 text-sm font-bold">
              LVL {level}
            </span>
          </div>
          <span className="text-mist text-xs font-mono">
            {currentLevelXp} / {nextLevelXp} XP
          </span>
        </div>
      )}
      <div className="relative h-3 bg-shadow rounded-full overflow-hidden border border-gold-500/15">
        {/* Background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

        {/* XP fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400"
          style={{ width: displayWidth }}
        />

        {/* Glow effect on the edge */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: displayWidth,
            boxShadow: "0 0 12px rgba(244, 208, 104, 0.5), 0 0 4px rgba(244, 208, 104, 0.7)",
          }}
        />
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

interface SkillBadgeProps {
  name: string;
  icon: string;
  earned?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-12 h-12 text-lg",
  md: "w-16 h-16 text-2xl",
  lg: "w-20 h-20 text-3xl",
};

const labelSizeMap = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
};

export default function SkillBadge({
  name,
  icon,
  earned = false,
  size = "md",
  className = "",
}: SkillBadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`flex flex-col items-center gap-1.5 ${className}`}
    >
      <div
        className={`
          ${sizeMap[size]} rounded-2xl flex items-center justify-center
          relative overflow-hidden
          ${
            earned
              ? "bg-gradient-to-br from-gold-500/20 to-gold-600/10 glow-border-gold"
              : "bg-shadow/60 border border-storm/30 grayscale opacity-50"
          }
        `}
      >
        {/* Shimmer overlay for earned badges */}
        {earned && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-400/10 to-transparent animate-shimmer" />
        )}
        <span className="relative z-10">{icon}</span>
      </div>
      <span
        className={`
          ${labelSizeMap[size]} font-body text-center leading-tight
          ${earned ? "text-gold-300" : "text-smoke"}
        `}
      >
        {name}
      </span>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";

interface GameCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "purple" | "gold" | "ruby" | "sapphire" | "emerald";
  hover?: boolean;
  onClick?: () => void;
}

export default function GameCard({
  children,
  className = "",
  glowColor = "purple",
  hover = true,
  onClick,
}: GameCardProps) {
  const baseClasses = `
    relative rounded-[10px] p-6 
    bg-[rgba(1,1,3,0.85)] 
    shadow-[inset_0_0_50px_rgba(0,0,0,0.95),_0_10px_30px_rgba(0,0,0,0.6)]
    transition-colors duration-400 ease-out backdrop-blur-md
    ${className}
  `;

  // Dynamic borders/glow based on color
  const getGlowStyles = () => {
    switch (glowColor) {
      case "gold":
        return {
          border: hover ? "1px solid rgba(244, 208, 104, 0.25)" : "1px solid rgba(244, 208, 104, 0.1)",
          boxShadowOnHover: "0 0 35px rgba(244, 208, 104, 0.3), inset 0 0 50px rgba(0, 0, 0, 0.95)",
          borderColorOnHover: "rgba(244, 208, 104, 0.75)"
        };
      case "ruby":
        return {
          border: hover ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(239, 68, 68, 0.1)",
          boxShadowOnHover: "0 0 35px rgba(239, 68, 68, 0.3), inset 0 0 50px rgba(0, 0, 0, 0.95)",
          borderColorOnHover: "rgba(239, 68, 68, 0.75)"
        };
      case "sapphire":
        return {
          border: hover ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid rgba(59, 130, 246, 0.1)",
          boxShadowOnHover: "0 0 35px rgba(59, 130, 246, 0.3), inset 0 0 50px rgba(0, 0, 0, 0.95)",
          borderColorOnHover: "rgba(59, 130, 246, 0.75)"
        };
      case "emerald":
        return {
          border: hover ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(16, 185, 129, 0.1)",
          boxShadowOnHover: "0 0 35px rgba(16, 185, 129, 0.3), inset 0 0 50px rgba(0, 0, 0, 0.95)",
          borderColorOnHover: "rgba(16, 185, 129, 0.75)"
        };
      case "purple":
      default:
        return {
          border: hover ? "1px solid rgba(168, 85, 247, 0.25)" : "1px solid rgba(168, 85, 247, 0.1)",
          boxShadowOnHover: "0 0 35px rgba(168, 85, 247, 0.3), inset 0 0 50px rgba(0, 0, 0, 0.95)",
          borderColorOnHover: "rgba(168, 85, 247, 0.75)"
        };
    }
  };

  const glowStyles = getGlowStyles();

  return (
    <motion.div
      onClick={onClick}
      style={{
        border: glowStyles.border,
      }}
      whileHover={hover ? { 
        scale: 1.02, 
        y: -6,
        boxShadow: glowStyles.boxShadowOnHover,
        borderColor: glowStyles.borderColorOnHover
      } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`${baseClasses} ${hover ? "cursor-pointer" : ""}`}
    >
      {/* Subtle overlay noise to simulate parchment/stone */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none rounded-[10px]" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

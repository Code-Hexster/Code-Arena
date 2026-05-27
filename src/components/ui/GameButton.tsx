"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "gold" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface GameButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  glowing?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0a0a0f] text-arcane-300 border border-arcane-500/40 shadow-[0_0_15px_rgba(139,92,246,0.15)] hover:border-arcane-400 hover:text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.6),inset_0_0_20px_rgba(139,92,246,0.2)] hover:-translate-y-0.5",
  secondary:
    "bg-[rgba(14,14,20,0.8)] text-mist border border-mist/20 hover:text-white hover:border-arcane-400/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]",
  gold: "bg-[#0a0f0a] text-gold-400 border border-gold-500/40 shadow-[0_0_15px_rgba(244,208,104,0.15)] hover:border-gold-300 hover:text-white hover:shadow-[0_0_30px_rgba(244,208,104,0.6),inset_0_0_20px_rgba(244,208,104,0.2)] hover:-translate-y-0.5 font-semibold",
  ghost:
    "bg-transparent text-mist hover:text-gold-300 hover:text-shadow-[0_0_15px_rgba(244,208,104,0.4)]",
  danger:
    "bg-[#150505] text-danger-400 border border-danger-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:border-danger-400 hover:text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.6),inset_0_0_20px_rgba(239,68,68,0.2)] hover:-translate-y-0.5",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-lg gap-1.5",
  md: "px-6 py-3 text-base rounded-xl gap-2",
  lg: "px-8 py-4 text-lg rounded-xl gap-2.5",
};

const GameButton = forwardRef<HTMLButtonElement, GameButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      glowing = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`
          relative inline-flex items-center justify-center font-body font-medium
          transition-all duration-300 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${glowing ? "animate-pulse-glow" : ""}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

GameButton.displayName = "GameButton";
export default GameButton;

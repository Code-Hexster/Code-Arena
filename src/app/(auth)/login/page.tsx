"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { UserRound } from "lucide-react";
import GameButton from "@/components/ui/GameButton";
import GameCard from "@/components/ui/GameCard";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setError("Failed to connect with Google. Please try again.");
        setIsLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Magical Portal Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-40">
        <div className="absolute inset-0 rounded-full border border-arcane-500/30 animate-[spin_20s_linear_infinite] shadow-[0_0_50px_rgba(139,92,246,0.2)]" />
        <div className="absolute inset-4 rounded-full border border-gold-500/20 animate-[spin_15s_linear_infinite_reverse] border-dashed" />
        <div className="absolute inset-12 rounded-full border border-mana-500/20 animate-[spin_10s_linear_infinite] border-dotted" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full relative z-10"
      >
        <GameCard glowColor="gold" hover={false} className="text-center w-full max-w-md relative overflow-hidden">
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

          {/* Logo */}
          <div className="mb-8 relative z-10">
            <motion.div
              className="flex justify-center mb-6"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-20 h-20 rounded-full border border-gold-500/30 flex items-center justify-center bg-void shadow-[inset_0_0_20px_rgba(244,208,104,0.1)] relative">
                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-arcane-500/30" />
                <UserRound className="w-10 h-10 text-gold-400" />
              </div>
            </motion.div>
            <h1 className="font-display text-3xl text-parchment mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              The Academy
            </h1>
            <p className="text-mist text-sm font-light tracking-wider uppercase">
              Gateway to the Arcane Arts
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-arcane-500/50 to-transparent mb-8 relative z-10" />

          {/* Google OAuth Button */}
          <div className="relative z-10">
            <GameButton
              variant="primary"
              size="lg"
              className="w-full group"
              onClick={handleGoogleLogin}
              isLoading={isLoading}
              id="google-login-button"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Cross the Threshold
            </GameButton>
          </div>

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-danger-400 text-sm relative z-10"
            >
              {error}
            </motion.p>
          )}

          {/* Terms */}
          <p className="mt-8 text-smoke text-[10px] tracking-widest uppercase relative z-10">
            By continuing, you bind your soul to the Terms of Service
          </p>
        </GameCard>
      </motion.div>
    </div>
  );
}

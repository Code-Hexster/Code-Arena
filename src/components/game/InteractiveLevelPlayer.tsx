"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GameButton from "@/components/ui/GameButton";

interface InteractiveLevelPlayerProps {
  mission: {
    id?: string;
    slug: string;
    title: string;
    xp_reward: number;
    level_file?: string;
    test_cases: any[];
    region?: { slug: string } | null;
  };
}

export default function InteractiveLevelPlayer({ mission }: InteractiveLevelPlayerProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(false);

  // Determine the level file URL from the mission slug
  const levelFile = mission.level_file || `/levels/${mission.slug}.html`;

  // Listen for postMessage from the iframe
  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      if (event.data?.type === "level-complete") {
        setCompleted(true);

        // Save progress to Supabase
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user && mission.id) {
            // Insert mission completion
            const { error: insertError } = await supabase.from("mission_completions").insert({
              user_id: user.id,
              mission_id: mission.id,
              code_submitted: "interactive-level",
              tests_passed: mission.test_cases.length || 1,
              tests_total: mission.test_cases.length || 1,
              xp_earned: mission.xp_reward,
              hints_used: 0,
            });

            if (!insertError) {
              await supabase.rpc("award_xp", {
                p_user_id: user.id,
                p_amount: mission.xp_reward,
                p_source: "mission",
                p_ref: mission.id,
              });

              // Evaluate badges
              await fetch("/api/badges/evaluate", { method: "POST" });
            }
          }
        } catch (e) {
          console.error("Failed to save progress:", e);
        }
      }

      if (event.data?.type === "next-level" || event.data?.type === "course-complete") {
        const regionSlug = mission.region?.slug || "css-ramparts";
        router.push(`/map/${regionSlug}`);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [mission, router]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[rgba(1,1,3,0.85)] border-b border-gold-500/15 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-mist hover:text-gold-400 text-sm transition-all hover:translate-x-[-2px] uppercase font-display tracking-wider font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4 text-gold-500" /> Back to Map
        </button>
        <span className="font-display text-sm md:text-base text-gold-400 font-bold tracking-widest uppercase drop-shadow-[0_0_8px_rgba(244,208,104,0.3)]">{mission.title}</span>
        <div className="flex items-center gap-3">
          {completed && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-heal-400 text-xs font-medium uppercase font-display tracking-wide font-bold"
            >
              <CheckCircle className="w-4 h-4" /> Completed
            </motion.span>
          )}
          <span className="text-gold-400 text-xs font-mono font-bold bg-gold-500/5 border border-gold-500/25 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(244,208,104,0.1)]">+{mission.xp_reward} XP</span>
        </div>
      </div>

      {/* Level iframe */}
      <iframe
        src={levelFile}
        className="flex-1 w-full border-0"
        sandbox="allow-scripts allow-same-origin"
        title={mission.title}
      />
    </div>
  );
}

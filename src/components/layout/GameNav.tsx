"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Map, Trophy, Swords, Flame, Users } from "lucide-react";
import type { Profile } from "@/types/database";
import { xpProgress } from "@/constants/xp";
import FriendsSidebar from "@/components/multiplayer/FriendsSidebar";

interface GameNavProps {
  profile: Profile | null;
}

const navLinks = [
  { href: "/map", label: "Celestial Map", icon: <Map className="w-4 h-4" /> },
  { href: "/leaderboard", label: "Legends", icon: <Trophy className="w-4 h-4" /> },
];

export default function GameNav({ profile }: GameNavProps) {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const progress = profile ? xpProgress(profile.total_xp) : null;

  const triggerCoreShockwave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined") {
      const themes: ("syntaxis" | "algor" | "null" | "gold")[] = ["syntaxis", "algor", "null", "gold"];
      
      // Determine current theme
      let currentTheme: "syntaxis" | "algor" | "null" | "gold" = "syntaxis";
      for (const t of themes) {
        if (document.body.classList.contains(`theme-${t}`)) {
          currentTheme = t;
          break;
        }
      }
      
      // Cycle to next theme
      const currentIndex = themes.indexOf(currentTheme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      
      // Apply theme
      document.body.classList.remove("theme-gold", "theme-algor", "theme-syntaxis", "theme-null");
      document.body.classList.add(`theme-${nextTheme}`);
      localStorage.setItem("CLA_THEME", nextTheme);
      
      // Dispatch sync event to keep GemstoneForge widget updated
      const syncEvent = new CustomEvent("cla-theme-changed", { detail: { theme: nextTheme } });
      window.dispatchEvent(syncEvent);
      
      // Dispatch magic shockwave
      const event = new CustomEvent("magic-shockwave", {
        detail: { x: e.clientX, y: e.clientY }
      });
      window.dispatchEvent(event);
    }
  };

  const isWorkspacePage = /^\/(map\/[^/]+|mission\/[^/]+)$/.test(pathname);
  if (isWorkspacePage) {
    return null;
  }

  return (
    <motion.nav 
      variants={{
        visible: { y: 0 },
        hidden: { y: "-120%" }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="sticky top-5 left-0 right-0 mx-auto w-[95%] max-w-[1600px] z-50 rounded-xl bg-glass backdrop-blur-md border border-energy/20 shadow-card hover:border-energy/35 transition-all duration-700"
    >
      {/* Corner Brackets */}
      <div className="absolute top-[-2px] left-[-2px] w-3 h-3 border-t-2 border-l-2 border-gold-500 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-[-2px] right-[-2px] w-3 h-3 border-t-2 border-r-2 border-gold-500 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-[-2px] left-[-2px] w-3 h-3 border-b-2 border-l-2 border-gold-500 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-[-2px] right-[-2px] w-3 h-3 border-b-2 border-r-2 border-gold-500 rounded-br-sm pointer-events-none" />

      <div className="px-6 h-16 flex items-center justify-between">
        
        {/* Logo Shield */}
        <Link href="/map" className="flex items-center gap-3 group relative z-10">
          <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 border border-gold-500 rounded-full animate-spin-slow" />
            <div className="absolute inset-[3px] border border-dashed border-energy rounded-full animate-spin-reverse" />
            <Swords className="w-4 h-4 text-gold-500 drop-shadow-[0_0_8px_rgba(244,208,104,0.6)] group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-display tracking-widest text-gold-400 text-xs font-bold hidden md:block group-hover:text-gold-300 group-hover:drop-shadow-[0_0_10px_rgba(244,208,104,0.5)] transition-all uppercase">
            Code Arena
          </span>
        </Link>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-bold tracking-widest font-display transition-all duration-300 uppercase
                  ${
                    isActive
                      ? "text-energy bg-energy-dim border border-energy/20 rune-glow"
                      : "text-mist hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <span className="flex items-center justify-center">{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-[-1.5px] left-3 right-3 h-[2px] bg-energy rounded-full shadow-glow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Player Stats HUD */}
        {profile && progress && (
          <div className="flex items-center gap-4 relative z-10">
            {/* Streak */}
            {profile.current_streak > 0 && (
              <div className="flex items-center gap-1.5 text-ember-400 text-xs font-bold font-display drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]">
                <Flame className="w-4 h-4 text-ember-500 animate-pulse" />
                <span className="font-mono">{profile.current_streak}D</span>
              </div>
            )}

            {/* XP progress core flask */}
            <div 
              className="flex items-center gap-3 select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-energy rounded-lg p-0.5"
              onClick={triggerCoreShockwave}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  triggerCoreShockwave(e as any);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="core-text-details text-right hidden sm:flex flex-col">
                <span className="core-lvl-label text-[10px] font-bold font-display text-gold-500 tracking-wider">
                  LVL {progress.level}
                </span>
                <span className="core-xp-val text-[9px] font-mono text-mist">
                  {progress.currentLevelXp} / {progress.nextLevelXp} XP
                </span>
              </div>

              <div className="relative w-10 h-10 rounded-full bg-black/60 border border-gold-500 hover:border-gold-300 transition-colors flex items-center justify-center cursor-pointer overflow-hidden shadow-glow-gold">
                <div 
                  className="absolute bottom-0 left-0 w-full transition-all duration-800"
                  style={{ 
                    height: `${progress.progressPercent}%`,
                    backgroundImage: "linear-gradient(to top, rgba(var(--energy-color-rgb), 0.75) 0%, var(--energy-color) 100%)",
                    boxShadow: "0 0 12px var(--energy-glow-heavy)"
                  }}
                >
                  {/* Wave layer */}
                  <div className="absolute top-[-4px] left-[-50%] w-[200%] h-2 bg-white/20 rounded-t-full animate-[spin_4s_linear_infinite]" />
                </div>
                <span className="relative z-10 font-display font-black text-[10px] text-white select-none">
                  ✧
                </span>
              </div>
            </div>

            {/* Friends Button */}
            <button
              onClick={() => setIsFriendsOpen(true)}
              className="p-2 hover:bg-white/5 rounded-lg text-mist hover:text-energy hover:scale-105 transition-all flex items-center justify-center border border-transparent hover:border-energy/20"
              title="Friends & Multiplayer"
            >
              <Users className="w-4.5 h-4.5" />
            </button>

            {/* Avatar */}
            <Link href="/profile">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-xs font-bold border border-gold-400/40 overflow-hidden hover:scale-105 hover:border-gold-300 transition-all shadow-glow-gold">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-void">{(profile.display_name || "H")[0].toUpperCase()}</span>
                )}
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Friends Sidebar */}
      {profile && (
        <FriendsSidebar 
          isOpen={isFriendsOpen} 
          onClose={() => setIsFriendsOpen(false)} 
          currentUserId={profile.id} 
        />
      )}
    </motion.nav>
  );
}

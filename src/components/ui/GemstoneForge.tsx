"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type ThemeType = "gold" | "algor" | "syntaxis" | "null";

const themes: { key: ThemeType; label: string; title: string }[] = [
  { key: "gold", label: "Imperial Gold Shard", title: "Guild Gold" },
  { key: "algor", label: "House Algor Crimson Shard (Ruby)", title: "House Algor" },
  { key: "syntaxis", label: "House Syntaxis Cobalt Shard (Sapphire)", title: "House Syntaxis" },
  { key: "null", label: "House Null Jade Shard (Emerald)", title: "House Null" },
];

const renderGemstoneSVG = (theme: ThemeType, isActive: boolean) => {
  const activeClass = isActive 
    ? "scale-110 filter drop-shadow-[0_0_12px_rgba(255,255,255,0.75)] animate-pulse" 
    : "opacity-75 group-hover:opacity-100 group-hover:scale-105";

  switch (theme) {
    case "gold":
      return (
        <svg viewBox="0 0 24 24" className={`w-8 h-8 transition-all duration-300 ${activeClass}`}>
          {/* Facets for Gold Octahedron */}
          <polygon points="12,2 18,9 12,13 6,9" fill="#FFF2AD" />
          <polygon points="12,13 18,9 12,22" fill="#E2BD3E" />
          <polygon points="12,13 6,9 12,22" fill="#B18C1D" />
          <polygon points="12,2 12,13 6,9" fill="#FCE98A" />
          <polygon points="12,2 18,9 12,13" fill="#F6D657" />
        </svg>
      );
    case "algor":
      return (
        <svg viewBox="0 0 24 24" className={`w-8 h-8 transition-all duration-300 ${activeClass}`}>
          {/* Facets for ruby sharp crystal */}
          <polygon points="12,2 20,8 12,14 4,8" fill="#FFA3A3" />
          <polygon points="12,14 20,8 16,22" fill="#EF4444" />
          <polygon points="12,14 4,8 8,22" fill="#B91C1C" />
          <polygon points="8,22 12,14 16,22 12,23" fill="#7F1D1D" />
          <polygon points="12,2 12,14 4,8" fill="#FCA5A5" />
          <polygon points="12,2 20,8 12,14" fill="#DC2626" />
        </svg>
      );
    case "syntaxis":
      return (
        <svg viewBox="0 0 24 24" className={`w-8 h-8 transition-all duration-300 ${activeClass}`}>
          {/* Facets for tear-cut sapphire */}
          <polygon points="12,2 19,7 19,15 12,22 5,15 5,7" fill="#93C5FD" />
          <polygon points="12,2 12,12 19,7" fill="#60A5FA" />
          <polygon points="19,7 12,12 19,15" fill="#3B82F6" />
          <polygon points="19,15 12,12 12,22" fill="#2563EB" />
          <polygon points="12,22 12,12 5,15" fill="#1D4ED8" />
          <polygon points="5,15 12,12 5,7" fill="#1E40AF" />
          <polygon points="5,7 12,12 12,2" fill="#3B82F6" />
        </svg>
      );
    case "null":
      return (
        <svg viewBox="0 0 24 24" className={`w-8 h-8 transition-all duration-300 ${activeClass}`}>
          {/* Facets for hexagonal emerald */}
          <polygon points="8,3 16,3 21,8 21,16 16,21 8,21 3,16 3,8" fill="#A7F3D0" />
          <polygon points="8,3 16,3 12,12" fill="#34D399" />
          <polygon points="16,3 21,8 12,12" fill="#10B981" />
          <polygon points="21,8 21,16 12,12" fill="#059669" />
          <polygon points="21,16 16,21 12,12" fill="#047857" />
          <polygon points="16,21 8,21 12,12" fill="#065F46" />
          <polygon points="8,21 3,16 12,12" fill="#064E3B" />
          <polygon points="3,16 3,8 12,12" fill="#047857" />
          <polygon points="3,8 8,3 12,12" fill="#10B981" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 100" className={`w-12 h-12 transition-all duration-300 ${activeClass}`}>
          <polygon points="50,5 85,25 95,65 65,95 35,95 5,65 15,25" fill="url(#grad-null)" />
          <polygon points="50,5 85,25 95,65 65,95 35,95 5,65 15,25" fill="none" stroke="#4DFF4D" strokeWidth="2" />
          <polygon points="50,15 75,30 85,60 60,85 40,85 15,60 25,30" fill="rgba(46, 139, 87, 0.4)" />
          <defs>
            <linearGradient id="grad-null" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3CB371" />
              <stop offset="50%" stopColor="#2E8B57" />
              <stop offset="100%" stopColor="#006400" />
            </linearGradient>
          </defs>
        </svg>
      );
  }
};

const applyTheme = (theme: ThemeType, dispatchSync: boolean = true) => {
  if (typeof window === "undefined") return;
  const body = document.body;
  body.classList.remove("theme-gold", "theme-algor", "theme-syntaxis", "theme-null");
  body.classList.add(`theme-${theme}`);
  localStorage.setItem("CLA_THEME", theme);

  if (dispatchSync) {
    const syncEvent = new CustomEvent("cla-theme-changed", { detail: { theme } });
    window.dispatchEvent(syncEvent);
  }
};

export default function GemstoneForge() {
  const [activeTheme, setActiveTheme] = useState<ThemeType>("syntaxis");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    const savedTheme = localStorage.getItem("CLA_THEME") as ThemeType;
    if (savedTheme && ["gold", "algor", "syntaxis", "null"].includes(savedTheme)) {
      setTimeout(() => setActiveTheme(savedTheme), 0);
      applyTheme(savedTheme, false);
    } else {
      applyTheme("syntaxis", false);
    }

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.theme) {
        setActiveTheme(customEvent.detail.theme);
      }
    };

    window.addEventListener("cla-theme-changed", handleSync);
    return () => {
      window.removeEventListener("cla-theme-changed", handleSync);
    };
  }, []);

  const handleSelectTheme = (e: React.MouseEvent<HTMLButtonElement>, theme: ThemeType) => {
    setActiveTheme(theme);
    applyTheme(theme);

    // Trigger magic shockwave custom event originating from clicked gemstone coordinate
    if (typeof window !== "undefined") {
      const event = new CustomEvent("magic-shockwave", {
        detail: { x: e.clientX, y: e.clientY }
      });
      window.dispatchEvent(event);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-center gap-3.5 bg-glass backdrop-blur-lg p-4 rounded-xl border border-gold-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(244,208,104,0.05)] relative overflow-hidden select-none">
      {/* Runic markings on corners */}
      <div className="absolute top-1 left-1.5 text-[8px] text-white/10 select-none font-mono">ᚨ</div>
      <div className="absolute top-1 right-1.5 text-[8px] text-white/10 select-none font-mono">ᛒ</div>
      <div className="absolute bottom-1 left-1.5 text-[8px] text-white/10 select-none font-mono">ᚲ</div>
      <div className="absolute bottom-1 right-1.5 text-[8px] text-white/10 select-none font-mono">ᛏ</div>

      <div className="text-[9px] font-display font-bold tracking-[0.25em] text-gold-400 uppercase select-none opacity-80 mb-1 border-b border-white/5 pb-1 text-center w-full">
        Forge Resonance
      </div>

      <div className="flex flex-col gap-4">
        {themes.map((theme) => {
          const isActive = activeTheme === theme.key;
          return (
            <button
              key={theme.key}
              onClick={(e) => handleSelectTheme(e, theme.key)}
              title={theme.label}
              className="relative w-12 h-12 flex items-center justify-center group cursor-pointer"
            >
              {/* Runic socket base */}
              <div className="absolute inset-0 rounded-full border border-white/[0.04] bg-void/50 shadow-inner flex items-center justify-center" />
              
              {/* Rotating runic ring on active / hover */}
              <div className={`absolute inset-0.5 rounded-full border border-dashed transition-all duration-700 ${
                isActive 
                  ? "border-energy/45 scale-105 animate-[spin_12s_linear_infinite]" 
                  : "border-white/5 group-hover:border-white/15 group-hover:scale-105"
              }`} />
              
              {/* Gemstone wrapper */}
              <div className={`relative z-10 transform transition-all duration-300 ${
                isActive 
                  ? "scale-110 drop-shadow-[0_0_12px_var(--energy-color)]" 
                  : "opacity-75 hover:opacity-100 hover:scale-105"
              }`}>
                {renderGemstoneSVG(theme.key, isActive)}
              </div>
              
              {/* Active selection dot indicator */}
              {isActive && (
                <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-energy shadow-glow animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

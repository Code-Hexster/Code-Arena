"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mountain, Flame, Castle, Lock, Layout, Code2, Paintbrush, Timer, Users, Swords } from "lucide-react";
import { REGIONS } from "@/constants/regions";
import GameCard from "@/components/ui/GameCard";

interface WorldMapProps {
  playerLevel: number;
  completedMissions: Record<string, number>; // regionSlug -> count
  dailyChallenge?: any;
  dailyCompleted?: boolean;
  currentStreak?: number;
  dailyCompletionsCount?: number;
  username?: string;
  totalXp?: number;
  playerRank?: number;
}

// Nodes layout coordinates (in percentages)
const mapNodesCoords: Record<string, { x: number; y: number; locksRune: string }> = {
  // Code Realm
  variables: { x: 22, y: 28, locksRune: "⚚" },
  loops: { x: 50, y: 52, locksRune: "✧" },
  functions: { x: 78, y: 76, locksRune: "∿" },
  conditionals_dummy: { x: 76, y: 26, locksRune: "⚔" },
  arrays_dummy: { x: 26, y: 78, locksRune: "✦" },
  
  // Creation Realm
  "html-keep": { x: 22, y: 28, locksRune: "⚚" },
  "css-ramparts": { x: 50, y: 52, locksRune: "✧" },
  "layout-labyrinth": { x: 78, y: 76, locksRune: "∿" },
  advanced_dummy: { x: 76, y: 26, locksRune: "⚔" },
  spaces_dummy: { x: 26, y: 78, locksRune: "✦" },
};

const dummyNodesDetails: Record<string, { name: string; description: string; unlockLevel: number }> = {
  conditionals_dummy: {
    name: "Citadel of Choices",
    description: "An ancient arcane citadel floating in the nebulae. Here, spellcasters master the pathways of logic, branches, and conditional control flow blocks to alter the reality grid.",
    unlockLevel: 8
  },
  arrays_dummy: {
    name: "Arrays Sanctum",
    description: "A sanctuary dedicated to sequence structures. Channel indexing matrices, stack buffers, and mapping spells to manipulate multiple incantations in unison.",
    unlockLevel: 10
  },
  advanced_dummy: {
    name: "Advanced Styles",
    description: "The peak of aesthetic styling. Shape filter effects, backdrop blurs, clipping masks, and customized properties to mold premium elemental interfaces.",
    unlockLevel: 12
  },
  spaces_dummy: {
    name: "3D Spaces",
    description: "Defy the flat dimensions. Distort elements across the Z-axis, construct 3D rotations, perspective grids, and volumetric layout cubes.",
    unlockLevel: 15
  }
};

export default function WorldMap({
  playerLevel,
  completedMissions,
  dailyChallenge,
  dailyCompleted,
  currentStreak = 0,
  dailyCompletionsCount = 0,
  username = "Player",
  totalXp = 0,
  playerRank = 0,
}: WorldMapProps) {
  const router = useRouter();
  const [activeRealm, setActiveRealm] = useState<"code" | "creation">("code");
  const [selectedRegionSlug, setSelectedRegionSlug] = useState<string>("variables");
  const [timeLeft, setTimeLeft] = useState<string>("--:--:--");
  const [isUrgent, setIsUrgent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Magical animation tracking refs
  const lineGrowProgressRef = useRef(1);
  const shockwaveRadiusRef = useRef(9999);

  const displayRegions = REGIONS.filter((r) => r.realm === activeRealm);
  
  // Reset animation progress when activeRealm changes
  useEffect(() => {
    lineGrowProgressRef.current = 0;
    shockwaveRadiusRef.current = 0;
  }, [activeRealm]);

  // Select first region by default when realm changes
  useEffect(() => {
    const firstRegion = displayRegions[0];
    if (firstRegion) {
      setSelectedRegionSlug(firstRegion.slug);
    }
  }, [activeRealm]);

  // Set default selection on load
  useEffect(() => {
    if (displayRegions.length > 0 && !selectedRegionSlug) {
      setSelectedRegionSlug(displayRegions[0].slug);
    }
  }, []);

  // Timer logic for daily challenge
  useEffect(() => {
    if (!dailyChallenge) return;
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow.getTime() - now.getTime();
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
      setIsUrgent(diff < 60 * 60 * 1000);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [dailyChallenge]);

  // Ley Lines Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let canvasRaf: number;
    let dashOffset = 0;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.scale(dpr, dpr);
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const drawPaths = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      ctx.clearRect(0, 0, w, h);

      dashOffset -= 0.6;

      // Increment transition progress animations
      if (lineGrowProgressRef.current < 1) {
        lineGrowProgressRef.current = Math.min(1, lineGrowProgressRef.current + 0.035);
      }
      
      const maxRadius = Math.max(w, h) * 1.25;
      if (shockwaveRadiusRef.current < maxRadius) {
        shockwaveRadiusRef.current += 13.5;
      }

      const activeColor = getComputedStyle(document.body).getPropertyValue("--energy-color").trim() || "#3B82F6";

      // Draw expanding energy shockwave
      if (shockwaveRadiusRef.current < maxRadius) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, shockwaveRadiusRef.current, 0, Math.PI * 2);
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 3;
        ctx.globalAlpha = Math.max(0, 1 - (shockwaveRadiusRef.current / maxRadius)) * 0.45;
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();
      }

      // Define map connections based on current realm
      const connections = activeRealm === "code" ? [
        { from: "variables", to: "loops", active: playerLevel >= 3 },
        { from: "loops", to: "functions", active: playerLevel >= 5 },
        { from: "loops", to: "conditionals_dummy", active: false },
        { from: "variables", to: "arrays_dummy", active: false }
      ] : [
        { from: "html-keep", to: "css-ramparts", active: playerLevel >= 3 },
        { from: "css-ramparts", to: "layout-labyrinth", active: playerLevel >= 5 },
        { from: "css-ramparts", to: "advanced_dummy", active: false },
        { from: "html-keep", to: "spaces_dummy", active: false }
      ];

      connections.forEach((conn) => {
        const startCoord = mapNodesCoords[conn.from];
        const endCoord = mapNodesCoords[conn.to];
        if (!startCoord || !endCoord) return;

        const sx = (startCoord.x / 100) * w;
        const sy = (startCoord.y / 100) * h;
        const ex = (endCoord.x / 100) * w;
        const ey = (endCoord.y / 100) * h;

        // Interpolated target coords for the line grow transition
        const currX = sx + (ex - sx) * lineGrowProgressRef.current;
        const currY = sy + (ey - sy) * lineGrowProgressRef.current;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(currX, currY);

        if (conn.active) {
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 2.4;
          ctx.shadowColor = activeColor;
          ctx.shadowBlur = 8;
          ctx.setLineDash([8, 4]);
          ctx.lineDashOffset = dashOffset;
          ctx.stroke();
        } else {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        ctx.restore();
      });

      canvasRaf = requestAnimationFrame(drawPaths);
    };

    drawPaths();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(canvasRaf);
    };
  }, [activeRealm, playerLevel]);

  const focusedRegion = REGIONS.find((r) => r.slug === selectedRegionSlug);
  const dummyInfo = dummyNodesDetails[selectedRegionSlug];
  
  const activeRegionName = focusedRegion ? focusedRegion.name : (dummyInfo ? dummyInfo.name : "Region Registry");
  const activeRegionDescription = focusedRegion ? focusedRegion.description : (dummyInfo ? dummyInfo.description : "Select an unlocked star node to channel spells...");
  const activeRegionLevel = focusedRegion ? focusedRegion.unlockLevel : (dummyInfo ? dummyInfo.unlockLevel : 1);
  const isNodeLocked = focusedRegion 
    ? (playerLevel < focusedRegion.unlockLevel) 
    : (dummyInfo ? true : false);

  return (
    <div className="relative z-10 w-[95%] max-w-[1600px] mx-auto px-6 py-10 page-transition-wrapper">
      
      {/* Top Floating Stats and Realm Switcher Row */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10 bg-glass/40 border border-white/5 p-5 rounded-2xl glow-border">
        
        {/* Profile/Welcome Block */}
        <div className="flex items-center gap-4 text-left">
          <div className="flex flex-col">
            <span className="text-[10px] font-display font-bold tracking-widest text-energy rune-glow uppercase">
              Welcome back, wizard
            </span>
            <h2 className="text-2xl font-bold font-display text-white tracking-wider">
              {username} ⚔️
            </h2>
          </div>
        </div>

        {/* Flat Mini Stats Box */}
        <div className="flex items-center gap-6 font-display font-bold text-[10px] tracking-widest uppercase">
          <div className="flex flex-col items-center bg-black/35 border border-white/5 px-4 py-2.5 rounded-lg">
            <span className="text-mist">Total XP</span>
            <span className="text-energy font-mono text-sm mt-1">{totalXp}</span>
          </div>
          <div className="flex flex-col items-center bg-black/35 border border-white/5 px-4 py-2.5 rounded-lg">
            <span className="text-mist">Guild Rank</span>
            <span className="text-energy font-mono text-sm mt-1">#{playerRank}</span>
          </div>
          <div className="flex flex-col items-center bg-black/35 border border-white/5 px-4 py-2.5 rounded-lg">
            <span className="text-mist">Streak</span>
            <span className="text-ember-500 font-mono text-sm mt-1 flex items-center gap-1">
              {currentStreak}D <Flame className="w-3.5 h-3.5 animate-pulse" />
            </span>
          </div>
        </div>

        {/* Realm Toggle Selector */}
        <div className="relative flex bg-black/90 p-1.5 rounded-xl border border-energy/20 shadow-[inset_0_0_15px_rgba(0,0,0,0.9)] w-80">
          <button
            onClick={() => setActiveRealm("code")}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-bold text-[10px] tracking-widest uppercase transition-colors z-10 ${
              activeRealm === "code" ? "text-white" : "text-mist hover:text-gold-300"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Python
            {activeRealm === "code" && (
              <motion.div
                layoutId="activeMapPill"
                className="absolute inset-0 bg-energy-dim border border-energy/35 rounded-lg -z-10 shadow-[0_0_15px_var(--energy-glow)]"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
          </button>
          
          <button
            onClick={() => setActiveRealm("creation")}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-bold text-[10px] tracking-widest uppercase transition-colors z-10 ${
              activeRealm === "creation" ? "text-white" : "text-mist hover:text-gold-300"
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" /> HTML/CSS
            {activeRealm === "creation" && (
              <motion.div
                layoutId="activeMapPill"
                className="absolute inset-0 bg-energy-dim border border-energy/35 rounded-lg -z-10 shadow-[0_0_15px_var(--energy-glow)]"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Ley Lines Map & Interactive Sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Astrological Map Card */}
        <div className="lg:col-span-2 relative h-[650px] bg-glass rounded-2xl border border-energy/20 overflow-hidden shadow-card">
          <canvas ref={canvasRef} id="map-lines-canvas" className="pointer-events-none" />

          {/* Active Nodes */}
          <AnimatePresence mode="popLayout">
            {displayRegions.map((region) => {
              const isUnlocked = playerLevel >= region.unlockLevel;
              const completed = completedMissions[region.slug] || 0;
              const coords = mapNodesCoords[region.slug] || { x: 50, y: 50 };
              const isActive = selectedRegionSlug === region.slug;

              return (
                <motion.div
                  key={region.slug}
                  initial={{ scale: 0, opacity: 0, rotate: -60 }}
                  animate={{ 
                    scale: isActive ? 1.15 : 1, 
                    opacity: 1, 
                    rotate: 0,
                    transition: { type: "spring", stiffness: 220, damping: 16 } 
                  }}
                  exit={{ scale: 0, opacity: 0, rotate: 60, transition: { duration: 0.2 } }}
                  className={`constellation-star absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group ${
                    !isUnlocked ? "locked" : ""
                  }`}
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  onClick={() => setSelectedRegionSlug(region.slug)}
                >
                  <div 
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive ? "scale-115" : "scale-100"
                    }`}
                  >
                    {/* Outer spinning ring */}
                    <div className={`absolute inset-0 border border-dashed rounded-full transition-all duration-500 ${
                      isActive 
                        ? isUnlocked
                          ? "border-energy scale-125 animate-[spin_4s_linear_infinite] shadow-glow-sm" 
                          : "border-amber-500 scale-125 animate-[spin_4s_linear_infinite] shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        : isUnlocked
                          ? "border-energy/20 scale-100 animate-spin-slow"
                          : "border-white/5 scale-100 animate-[spin_20s_linear_infinite] group-hover:border-amber-500/40"
                    }`} />
                    
                    {/* Inner glowing sphere (Magical Socket) */}
                    <div 
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-500 text-[10px] select-none ${
                        isActive
                          ? isUnlocked
                            ? "bg-energy border-white shadow-glow-lg scale-110 animate-[pulse_1.5s_ease-in-out_infinite]"
                            : "bg-amber-600/30 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-110 animate-[pulse_1.8s_ease-in-out_infinite]"
                          : completed >= region.missionCount
                            ? "bg-black/90 border-energy shadow-[0_0_12px_var(--energy-glow)]"
                            : isUnlocked
                              ? "bg-energy/20 border-energy/40 shadow-none"
                              : "bg-storm/40 border-ash/45 shadow-none group-hover:border-amber-500/40"
                      }`}
                    >
                      {isActive ? (
                        isUnlocked ? (
                          <span className="text-white font-black animate-[spin_10s_linear_infinite]">✧</span>
                        ) : (
                          <Lock className="w-2.5 h-2.5 text-amber-300" />
                        )
                      ) : completed >= region.missionCount ? (
                        <span className="text-energy font-bold animate-[pulse_2s_ease-in-out_infinite]">✦</span>
                      ) : isUnlocked ? (
                        <span className="text-energy/60">•</span>
                      ) : (
                        <Lock className="w-2.5 h-2.5 text-ash group-hover:text-amber-500/80 transition-colors" />
                      )}
                    </div>
                    
                    {/* Star Label */}
                    <span className={`star-text-label absolute top-10 left-50% -translate-x-1/2 text-[9px] font-display font-bold tracking-widest uppercase transition-colors duration-300 ${
                      isActive 
                        ? isUnlocked 
                          ? "text-white text-shadow font-extrabold rune-glow"
                          : "text-amber-200 font-extrabold"
                        : isUnlocked 
                          ? "text-mist" 
                          : "text-ash group-hover:text-mist"
                    }`}>
                      {region.name.replace("The ", "")}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Locked Dummy Nodes (Uncharted Territory) */}
          <AnimatePresence mode="popLayout">
            {activeRealm === "code" ? (
              <motion.div 
                key="code-dummies"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className="contents"
              >
                {/* Citadel of Choices */}
                <div 
                  className={`constellation-star absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group ${
                    selectedRegionSlug === "conditionals_dummy" ? "active" : ""
                  }`}
                  style={{ left: `${mapNodesCoords.conditionals_dummy.x}%`, top: `${mapNodesCoords.conditionals_dummy.y}%` }}
                  onClick={() => setSelectedRegionSlug("conditionals_dummy")}
                >
                  <div 
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      selectedRegionSlug === "conditionals_dummy" ? "scale-115" : "scale-100"
                    }`}
                  >
                    {/* Outer spinning ring */}
                    <div className={`absolute inset-0 border border-dashed rounded-full transition-all duration-500 ${
                      selectedRegionSlug === "conditionals_dummy"
                        ? "border-amber-500 scale-125 animate-[spin_4s_linear_infinite] shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        : "border-white/5 scale-100 animate-[spin_20s_linear_infinite] group-hover:border-amber-500/40"
                    }`} />
                    
                    {/* Inner glowing sphere (Magical Socket) */}
                    <div 
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-500 text-[10px] select-none ${
                        selectedRegionSlug === "conditionals_dummy"
                          ? "bg-amber-600/30 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-110 animate-[pulse_1.8s_ease-in-out_infinite]"
                          : "bg-storm/40 border-ash/45 shadow-none group-hover:border-amber-500/40"
                      }`}
                    >
                      <Lock className={`w-2.5 h-2.5 transition-colors ${
                        selectedRegionSlug === "conditionals_dummy" ? "text-amber-300" : "text-ash group-hover:text-amber-500/80"
                      }`} />
                    </div>
                    
                    {/* Star Label */}
                    <span className={`star-text-label absolute top-10 left-50% -translate-x-1/2 text-[9px] font-display font-bold tracking-widest uppercase transition-colors duration-300 text-center w-[120px] ${
                      selectedRegionSlug === "conditionals_dummy" ? "text-amber-200 font-extrabold" : "text-ash group-hover:text-mist"
                    }`}>
                      Citadel of Choices
                    </span>
                  </div>
                </div>
                
                {/* Arrays Sanctum */}
                <div 
                  className={`constellation-star absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group ${
                    selectedRegionSlug === "arrays_dummy" ? "active" : ""
                  }`}
                  style={{ left: `${mapNodesCoords.arrays_dummy.x}%`, top: `${mapNodesCoords.arrays_dummy.y}%` }}
                  onClick={() => setSelectedRegionSlug("arrays_dummy")}
                >
                  <div 
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      selectedRegionSlug === "arrays_dummy" ? "scale-115" : "scale-100"
                    }`}
                  >
                    {/* Outer spinning ring */}
                    <div className={`absolute inset-0 border border-dashed rounded-full transition-all duration-500 ${
                      selectedRegionSlug === "arrays_dummy"
                        ? "border-amber-500 scale-125 animate-[spin_4s_linear_infinite] shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        : "border-white/5 scale-100 animate-[spin_20s_linear_infinite] group-hover:border-amber-500/40"
                    }`} />
                    
                    {/* Inner glowing sphere (Magical Socket) */}
                    <div 
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-500 text-[10px] select-none ${
                        selectedRegionSlug === "arrays_dummy"
                          ? "bg-amber-600/30 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-110 animate-[pulse_1.8s_ease-in-out_infinite]"
                          : "bg-storm/40 border-ash/45 shadow-none group-hover:border-amber-500/40"
                      }`}
                    >
                      <Lock className={`w-2.5 h-2.5 transition-colors ${
                        selectedRegionSlug === "arrays_dummy" ? "text-amber-300" : "text-ash group-hover:text-amber-500/80"
                      }`} />
                    </div>
                    
                    {/* Star Label */}
                    <span className={`star-text-label absolute top-10 left-50% -translate-x-1/2 text-[9px] font-display font-bold tracking-widest uppercase transition-colors duration-300 text-center w-[120px] ${
                      selectedRegionSlug === "arrays_dummy" ? "text-amber-200 font-extrabold" : "text-ash group-hover:text-mist"
                    }`}>
                      Arrays Sanctum
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="creation-dummies"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className="contents"
              >
                {/* Layout Advanced */}
                <div 
                  className={`constellation-star absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group ${
                    selectedRegionSlug === "advanced_dummy" ? "active" : ""
                  }`}
                  style={{ left: `${mapNodesCoords.advanced_dummy.x}%`, top: `${mapNodesCoords.advanced_dummy.y}%` }}
                  onClick={() => setSelectedRegionSlug("advanced_dummy")}
                >
                  <div 
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      selectedRegionSlug === "advanced_dummy" ? "scale-115" : "scale-100"
                    }`}
                  >
                    {/* Outer spinning ring */}
                    <div className={`absolute inset-0 border border-dashed rounded-full transition-all duration-500 ${
                      selectedRegionSlug === "advanced_dummy"
                        ? "border-amber-500 scale-125 animate-[spin_4s_linear_infinite] shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        : "border-white/5 scale-100 animate-[spin_20s_linear_infinite] group-hover:border-amber-500/40"
                    }`} />
                    
                    {/* Inner glowing sphere (Magical Socket) */}
                    <div 
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-500 text-[10px] select-none ${
                        selectedRegionSlug === "advanced_dummy"
                          ? "bg-amber-600/30 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-110 animate-[pulse_1.8s_ease-in-out_infinite]"
                          : "bg-storm/40 border-ash/45 shadow-none group-hover:border-amber-500/40"
                      }`}
                    >
                      <Lock className={`w-2.5 h-2.5 transition-colors ${
                        selectedRegionSlug === "advanced_dummy" ? "text-amber-300" : "text-ash group-hover:text-amber-500/80"
                      }`} />
                    </div>
                    
                    {/* Star Label */}
                    <span className={`star-text-label absolute top-10 left-50% -translate-x-1/2 text-[9px] font-display font-bold tracking-widest uppercase transition-colors duration-300 text-center w-[120px] ${
                      selectedRegionSlug === "advanced_dummy" ? "text-amber-200 font-extrabold" : "text-ash group-hover:text-mist"
                    }`}>
                      Advanced Styles
                    </span>
                  </div>
                </div>
                
                {/* 3D Spaces */}
                <div 
                  className={`constellation-star absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group ${
                    selectedRegionSlug === "spaces_dummy" ? "active" : ""
                  }`}
                  style={{ left: `${mapNodesCoords.spaces_dummy.x}%`, top: `${mapNodesCoords.spaces_dummy.y}%` }}
                  onClick={() => setSelectedRegionSlug("spaces_dummy")}
                >
                  <div 
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      selectedRegionSlug === "spaces_dummy" ? "scale-115" : "scale-100"
                    }`}
                  >
                    {/* Outer spinning ring */}
                    <div className={`absolute inset-0 border border-dashed rounded-full transition-all duration-500 ${
                      selectedRegionSlug === "spaces_dummy"
                        ? "border-amber-500 scale-125 animate-[spin_4s_linear_infinite] shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        : "border-white/5 scale-100 animate-[spin_20s_linear_infinite] group-hover:border-amber-500/40"
                    }`} />
                    
                    {/* Inner glowing sphere (Magical Socket) */}
                    <div 
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-500 text-[10px] select-none ${
                        selectedRegionSlug === "spaces_dummy"
                          ? "bg-amber-600/30 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-110 animate-[pulse_1.8s_ease-in-out_infinite]"
                          : "bg-storm/40 border-ash/45 shadow-none group-hover:border-amber-500/40"
                      }`}
                    >
                      <Lock className={`w-2.5 h-2.5 transition-colors ${
                        selectedRegionSlug === "spaces_dummy" ? "text-amber-300" : "text-ash group-hover:text-amber-500/80"
                      }`} />
                    </div>
                    
                    {/* Star Label */}
                    <span className={`star-text-label absolute top-10 left-50% -translate-x-1/2 text-[9px] font-display font-bold tracking-widest uppercase transition-colors duration-300 text-center w-[120px] ${
                      selectedRegionSlug === "spaces_dummy" ? "text-amber-200 font-extrabold" : "text-ash group-hover:text-mist"
                    }`}>
                      3D Spaces
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right 1 Column: Immersive Glassmorphism Sidebars */}
        <div className="flex flex-col gap-6">
          
          {/* Sidebar Part 1: Quest Details Card */}
          <div className="bg-glass flex flex-col justify-between p-6 rounded-2xl min-h-[300px] transition-all duration-700 shadow-card hover:shadow-card-hover">
            <div className="scroll-title-bar border-b border-dashed border-energy/20 pb-3 mb-4 flex justify-between items-center text-energy rune-glow">
              <span className="font-display font-bold text-sm tracking-widest uppercase">
                {activeRegionName}
              </span>
              <span className="quest-difficulty font-mono text-[9px] uppercase border border-energy/30 px-2 py-0.5 rounded text-energy">
                LVL {activeRegionLevel}
              </span>
            </div>

            <div className="quest-instructions flex-1">
              <p className="font-serif-cormorant font-medium text-lg leading-relaxed text-parchment/90 italic">
                "{activeRegionDescription}"
              </p>

              {focusedRegion && !isNodeLocked && (
                <div className="objective-badge border-l-2 border-energy/30 bg-energy/10 p-3 rounded-r-lg mt-4 text-[11px] text-parchment/90">
                  <strong>Quest Reward:</strong> +350 Guild XP, 1x Amulet Core Shard
                </div>
              )}

              {isNodeLocked && (
                <div className="objective-badge border-l-2 border-amber-500/40 bg-amber-950/15 p-3 rounded-r-lg mt-4 text-[11px] text-amber-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0 text-amber-500" />
                  <span><strong>Secured Node:</strong> Reach Level {activeRegionLevel} to decrypt this constellation's missions. (Current: Level {playerLevel})</span>
                </div>
              )}
            </div>

            {(focusedRegion || dummyInfo) && (
              <div className="mt-6">
                {isNodeLocked ? (
                  <button
                    disabled
                    className="w-full py-3.5 bg-zinc-900/50 text-zinc-500 border border-zinc-800 font-display font-bold tracking-widest text-[10px] uppercase rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked (Requires Level {activeRegionLevel})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(`/map/${focusedRegion!.slug}`)}
                    className="cast-ritual-btn w-full py-3.5 bg-energy/15 text-energy border border-energy/30 hover:border-energy/60 hover:text-white hover:bg-energy/85 hover:shadow-[0_0_20px_var(--energy-glow),inset_0_0_12px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 transition-all duration-300 font-display font-bold tracking-widest text-[10px] uppercase rounded-xl cursor-pointer"
                  >
                    Enter spell workbench
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Part 2: Compact Daily Quest Card */}
          {dailyChallenge && (
            <div className="bg-glass p-6 rounded-2xl transition-all duration-700 shadow-card hover:shadow-card-hover">
              <div className="scroll-title-bar border-b border-dashed border-energy/20 pb-3 mb-4 flex justify-between items-center text-energy rune-glow">
                <span className="font-display font-bold text-sm tracking-widest uppercase flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-ember-500 animate-pulse" /> Daily Spell
                </span>
                
                {dailyCompleted ? (
                  <span className="font-mono text-[9px] uppercase text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                    Mastered
                  </span>
                ) : (
                  <div className={`flex items-center gap-1 text-[9px] font-mono font-bold tracking-wider ${isUrgent ? 'text-danger-500 animate-pulse' : 'text-energy'}`}>
                    <Timer className="w-3.5 h-3.5" />
                    <span>{timeLeft}</span>
                  </div>
                )}
              </div>

              <div className="text-left font-serif-cormorant font-medium text-base text-parchment/80 italic mb-4">
                "Complete the daily incantation trial to compound your streak value and draw more energy into your core."
              </div>

              {!dailyCompleted && (
                <button
                  onClick={() => router.push(`/mission/${dailyChallenge.slug}`)}
                  className="cast-ritual-btn w-full py-3.5 bg-energy/15 text-energy border border-energy/30 hover:border-energy/60 hover:text-white hover:bg-energy/85 hover:shadow-[0_0_20px_var(--energy-glow),inset_0_0_12px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 transition-all duration-300 font-display font-bold tracking-widest text-[10px] uppercase rounded-xl cursor-pointer"
                >
                  Cast Daily Spell (+{dailyChallenge.xp_reward} XP)
                </button>
              )}
              
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-mist font-bold uppercase tracking-wider font-display">
                <Users className="w-3.5 h-3.5 text-energy" />
                <span><strong className="text-parchment">{dailyCompletionsCount}</strong> wizards succeeded today</span>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

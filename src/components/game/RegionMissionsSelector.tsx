"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Mission, Region } from "@/types/database";

interface RegionMissionsSelectorProps {
  region: Region;
  missions: Mission[];
  completedMissionIds: string[];
}

export default function RegionMissionsSelector({
  region,
  missions,
  completedMissionIds,
}: RegionMissionsSelectorProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTheme, setActiveTheme] = useState<string>("syntaxis");
  const [mounted, setMounted] = useState(false);

  const deckCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const lastScrollTimeRef = useRef<number>(0);
  const scrollThrottle = 300; // ms

  // Sync theme on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("CLA_THEME");
    if (savedTheme && ["gold", "algor", "syntaxis", "null"].includes(savedTheme)) {
      setActiveTheme(savedTheme);
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

  const applyTheme = (theme: string, dispatchSync = true) => {
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

  const handleSelectTheme = (e: React.MouseEvent, theme: string) => {
    setActiveTheme(theme);
    applyTheme(theme);

    // Trigger magic shockwave
    if (typeof window !== "undefined") {
      const event = new CustomEvent("magic-shockwave", {
        detail: { x: e.clientX, y: e.clientY },
      });
      window.dispatchEvent(event);
    }
    
    // Trigger local canvas stardust burst
    triggerBurst();
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") {
        if (activeIndex > 0) {
          selectLevel(activeIndex - 1);
        }
      } else if (e.key === "ArrowDown" || e.key === "s") {
        if (activeIndex < missions.length - 1) {
          selectLevel(activeIndex + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, missions]);

  // Track mouse coordinates for ambient radial glow spotlight
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 3D Tilt effect listener
  useEffect(() => {
    const cardHolder = document.getElementById("deck-card-holder");
    if (!cardHolder) return;

    const handleCardTilt = (e: MouseEvent) => {
      const activeCard = cardHolder.querySelector(".deck-card.active") as HTMLElement;
      if (!activeCard) return;

      const rect = activeCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const angleX = (yc - y) / 10;
        const angleY = (x - xc) / 20;

        activeCard.style.transform = `translateX(0px) translateY(0px) translateZ(100px) rotateX(${angleX}deg) rotateY(${angleY - 10}deg) scale(1.04)`;
        activeCard.style.boxShadow = `0 0 45px var(--energy-glow), 0 30px 70px rgba(0,0,0,0.95)`;
      }
    };

    const handleCardReset = () => {
      const activeCard = cardHolder.querySelector(".deck-card.active") as HTMLElement;
      if (activeCard) {
        activeCard.style.transform = `translateX(0px) translateY(0px) translateZ(80px) rotateY(-10deg) scale(1.02)`;
        activeCard.style.boxShadow = "";
      }
    };

    cardHolder.addEventListener("mousemove", handleCardTilt);
    cardHolder.addEventListener("mouseleave", handleCardReset);
    return () => {
      cardHolder.removeEventListener("mousemove", handleCardTilt);
      cardHolder.removeEventListener("mouseleave", handleCardReset);
    };
  }, [activeIndex]);

  // Local particles canvas loop
  useEffect(() => {
    const canvas = deckCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let canvasRaf: number;

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          particlesRef.current.splice(idx, 1);
          return;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });

      canvasRaf = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(canvasRaf);
    };
  }, []);

  const triggerBurst = () => {
    const canvas = deckCanvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const activeColor = getComputedStyle(document.body).getPropertyValue("--energy-color").trim() || "#3B82F6";
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: Math.random() * 2.8 + 1,
        alpha: 1,
        color: activeColor,
        decay: Math.random() * 0.02 + 0.015,
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  const selectLevel = (idx: number) => {
    setActiveIndex(idx);
    triggerBurst();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastScrollTimeRef.current < scrollThrottle) return;

    if (e.deltaY > 0) {
      if (activeIndex < missions.length - 1) {
        selectLevel(activeIndex + 1);
        lastScrollTimeRef.current = now;
      }
    } else {
      if (activeIndex > 0) {
        selectLevel(activeIndex - 1);
        lastScrollTimeRef.current = now;
      }
    }
  };

  const currentMission = missions[activeIndex];
  const isCompleted = currentMission ? completedMissionIds.includes(currentMission.id) : false;

  // Render loading state if not mounted to prevent mismatch
  if (!mounted || !currentMission) return null;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden w-full select-none">
      {/* Standalone styles block to scope page rules */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* scoped layout tweaks for client maps */
        html, body {
          overflow: hidden !important;
          height: 100% !important;
        }

        .header-nav {
          position: absolute;
          top: 40px;
          left: 5%;
          z-index: 100;
        }

        .back-link {
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: color 0.3s;
        }

        .back-link:hover {
          color: var(--energy-color);
          text-shadow: 0 0 8px var(--energy-glow);
        }

        .ambient-radial-glow {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(var(--energy-color-rgb), 0.08), transparent 75%);
          transition: background 0.2s ease;
        }

        .mystical-fog-canopy {
          position: fixed;
          bottom: -20vh;
          left: 0;
          width: 100vw;
          height: 55vh;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(ellipse at bottom, var(--energy-dim) 0%, transparent 70%);
          opacity: 0.85;
          transition: background 0.8s ease;
        }

        .console-workspace {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 50px;
          width: 90%;
          max-width: 1400px;
          z-index: 10;
          perspective: 1200px;
          margin: 40px auto;
        }

        .deck-viewport {
          position: relative;
          height: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
        }

        .sigil-ring-backdrop {
          position: absolute;
          width: 520px;
          height: 520px;
          pointer-events: none;
          opacity: 0.08;
          z-index: 1;
          transform-style: preserve-3d;
          transform: translateZ(-90px) rotateY(-10deg);
          transition: opacity 0.8s ease;
        }

        .sigil-ring-backdrop svg {
          width: 100%;
          height: 100%;
          fill: none;
          stroke: var(--energy-color);
          stroke-width: 1.2;
          transition: stroke 0.8s ease;
        }

        .deck-3d-axis {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
          transform: rotateX(2deg) rotateY(12deg);
          z-index: 3;
        }

        .deck-card {
          position: absolute;
          width: 440px;
          height: 82px;
          background: var(--glass-bg);
          border: 1.5px solid rgba(var(--energy-color-rgb), 0.2);
          border-radius: 12px;
          padding: 0 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 20px 40px rgba(0,0,0,0.85);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.8s, 
                      opacity 0.6s, 
                      box-shadow 0.8s;
          cursor: pointer;
          transform-style: preserve-3d;
        }

        .deck-card.active {
          border-color: var(--energy-color);
          box-shadow: 0 0 35px var(--energy-glow), 0 25px 60px rgba(0,0,0,0.9);
          background: rgba(12, 10, 22, 0.95);
        }

        .card-inner {
          display: flex;
          align-items: center;
          gap: 20px;
          pointer-events: none;
        }

        .card-seal {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1.5px solid rgba(var(--energy-color-rgb), 0.3);
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 700;
          color: var(--energy-color);
          box-shadow: inset 0 0 10px rgba(var(--energy-color-rgb), 0.08);
          transition: border-color 0.8s, color 0.8s, box-shadow 0.8s;
        }

        .card-seal.completed {
          border-color: #10B981;
          color: #10B981;
          background: rgba(16, 185, 129, 0.06);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.25);
        }

        .card-title-text {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          transition: color 0.4s;
        }

        .deck-card.active .card-title-text {
          color: #FFF;
        }

        .card-num-tag {
          font-size: 9px;
          font-family: var(--font-display);
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.15em;
        }

        .card-meta-tag {
          font-size: 9px;
          font-weight: bold;
          text-transform: uppercase;
          color: var(--energy-color);
          letter-spacing: 0.08em;
          margin-top: 2px;
          transition: color 0.8s;
        }

        .deck-card.active .card-meta-tag {
          color: var(--gold);
        }

        .card-status-badge {
          font-family: var(--font-display);
          font-size: 8px;
          font-weight: bold;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
          background: rgba(0,0,0,0.3);
          pointer-events: none;
          transition: all 0.4s;
        }

        .card-status-badge.completed {
          border-color: rgba(16, 185, 129, 0.35);
          color: #10B981;
          background: rgba(16, 185, 129, 0.06);
        }

        .deck-card.active .card-status-badge {
          border-color: var(--energy-color);
          color: #FFF;
          background: var(--energy-dim);
          text-shadow: 0 0 8px var(--energy-glow);
        }

        .deck-card.active .card-status-badge.completed {
          border-color: #10B981;
          color: #10B981;
          background: rgba(16, 185, 129, 0.12);
          text-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
        }

        .grimoire-codex {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border: 1.5px solid rgba(var(--energy-color-rgb), 0.25);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.9), inset 0 0 15px rgba(255,255,255,0.02);
          min-height: 520px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          transition: border-color 0.8s ease;
        }

        .codex-bracket {
          position: absolute;
          width: 24px;
          height: 24px;
          border: 1.5px solid rgba(var(--energy-color-rgb), 0.4);
          pointer-events: none;
          transition: border-color 0.8s ease;
        }

        .codex-bracket::after {
          content: '•';
          position: absolute;
          font-size: 8px;
          color: var(--energy-color);
          transition: color 0.8s ease;
        }

        .codex-bracket-tl { top: 12px; left: 12px; border-right: none; border-bottom: none; }
        .codex-bracket-tl::after { top: -6px; left: -4px; }
        .codex-bracket-tr { top: 12px; right: 12px; border-left: none; border-bottom: none; }
        .codex-bracket-tr::after { top: -6px; right: -4px; }
        .codex-bracket-bl { bottom: 12px; left: 12px; border-right: none; border-top: none; }
        .codex-bracket-bl::after { bottom: -6px; left: -4px; }
        .codex-bracket-br { bottom: 12px; right: 12px; border-left: none; border-top: none; }
        .codex-bracket-br::after { bottom: -6px; right: -4px; }

        .codex-header {
          border-bottom: 1.5px dashed rgba(var(--energy-color-rgb), 0.2);
          padding-bottom: 20px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: border-color 0.8s;
        }

        .codex-title-label {
          font-family: var(--font-display-dec);
          font-size: 20px;
          font-weight: 700;
          color: #FFF;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .codex-subtitle-meta {
          font-size: 10px;
          font-weight: bold;
          color: var(--energy-color);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-top: 4px;
          transition: color 0.8s;
        }

        .codex-difficulty-badge {
          font-family: var(--font-display);
          font-size: 9px;
          font-weight: bold;
          color: var(--gold);
          border: 1px solid var(--gold);
          padding: 4px 14px;
          border-radius: 4px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          box-shadow: 0 0 10px var(--gold-glow);
        }

        .codex-desc-paragraph {
          font-family: var(--font-serif);
          font-size: 18px;
          line-height: 1.8;
          color: #94a3b8;
          font-style: italic;
        }

        .codex-objectives-box {
          background: rgba(var(--energy-color-rgb), 0.05);
          border-left: 3px solid var(--energy-color);
          padding: 20px;
          border-radius: 0 8px 8px 0;
          transition: border-color 0.8s, background 0.8s;
        }

        .objectives-title {
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #FFF;
          margin-bottom: 8px;
        }

        .objectives-text {
          font-family: var(--font-body);
          font-size: 12px;
          line-height: 1.6;
          color: #94a3b8;
        }

        .rewards-highlight {
          color: var(--gold);
          text-shadow: 0 0 8px var(--gold-glow);
        }

        .codex-rewards-strip {
          display: flex;
          align-items: center;
          gap: 15px;
          font-family: var(--font-display);
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 10px;
        }

        .codex-action-btn {
          width: 100%;
          background: var(--energy-dim);
          border: 1.5px solid var(--energy-color);
          color: #FFF;
          padding: 16px;
          border-radius: 8px;
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .codex-action-btn:hover {
          transform: translateY(-2px);
          background: var(--energy-color);
          box-shadow: 0 0 25px var(--energy-glow), 0 12px 30px rgba(0,0,0,0.6);
          border-color: #FFF;
        }

        @keyframes riseDot {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-80px) scale(1.2); opacity: 0; }
        }

        @keyframes pulseGlow {
          0%, 100% { transform: translateY(-50%) scale(1); opacity: 1; }
          50% { transform: translateY(-50%) scale(1.3); opacity: 0.7; }
        }

        @keyframes spinClockwise {
          100% { transform: rotate(360deg); }
        }

        @keyframes spinCounterClockwise {
          100% { transform: rotate(-360deg); }
        }

      ` }} />

      {/* Ambient Mouse trail spotlight and bottom fog */}
      <div className="ambient-radial-glow" />
      <div className="mystical-fog-canopy" />

      {/* Background Stardust Particles */}
      <canvas ref={deckCanvasRef} id="deck-canvas" className="absolute inset-0 z-0 pointer-events-none w-full h-full" />

      {/* Absolute Back Link */}
      <div className="absolute top-[40px] left-[5%] z-[150] header-nav">
        <Link
          href="/map"
          className="back-link flex items-center gap-2 text-mist hover:text-white transition-colors"
        >
          ← Back to World Map
        </Link>
      </div>

      {/* Main Grid: Scroll wheel on left, codex board on right */}
      <div className="console-workspace" onWheel={handleWheel}>
        
        {/* Left Side: Scroll Wheel deck viewport */}
        <div className="deck-viewport">
          
          {/* Summoning Sigil behind cards */}
          <div className="sigil-ring-backdrop">
            <svg viewBox="0 0 100 100">
              {/* Outer circle spinning clockwise */}
              <g style={{ transformOrigin: "50px 50px", animation: "spinClockwise 40s linear infinite" }}>
                <circle cx="50" cy="50" r="46" />
                <circle cx="50" cy="50" r="42" strokeDasharray="2 2" />
                <text x="50" y="10" fontSize="3.5" textAnchor="middle" fill="currentColor">ᚨ</text>
                <text x="78" y="18" fontSize="3.5" textAnchor="middle" fill="currentColor" transform="rotate(45 50 50)">ᛒ</text>
                <text x="90" y="50" fontSize="3.5" textAnchor="middle" fill="currentColor" transform="rotate(90 50 50)">ᚲ</text>
                <text x="78" y="82" fontSize="3.5" textAnchor="middle" fill="currentColor" transform="rotate(135 50 50)">ᛏ</text>
                <text x="50" y="90" fontSize="3.5" textAnchor="middle" fill="currentColor" transform="rotate(180 50 50)">ᛖ</text>
                <text x="22" y="82" fontSize="3.5" textAnchor="middle" fill="currentColor" transform="rotate(225 50 50)">ᛗ</text>
                <text x="10" y="50" fontSize="3.5" textAnchor="middle" fill="currentColor" transform="rotate(270 50 50)">ᛚ</text>
                <text x="22" y="18" fontSize="3.5" textAnchor="middle" fill="currentColor" transform="rotate(315 50 50)">ᛟ</text>
              </g>
              {/* Inner circle spinning counter-clockwise */}
              <g style={{ transformOrigin: "50px 50px", animation: "spinCounterClockwise 25s linear infinite" }}>
                <circle cx="50" cy="50" r="34" />
                <circle cx="50" cy="50" r="28" strokeDasharray="5 3" />
                <polygon points="50,18 78,65 22,65" strokeDasharray="1 1" />
                <polygon points="50,82 78,35 22,35" strokeDasharray="1 1" />
                <text x="50" y="24" fontSize="3" textAnchor="middle" fill="currentColor">ᚠ</text>
                <text x="70" y="34" fontSize="3" textAnchor="middle" fill="currentColor" transform="rotate(60 50 50)">ᚢ</text>
                <text x="76" y="58" fontSize="3" textAnchor="middle" fill="currentColor" transform="rotate(120 50 50)">ᚦ</text>
                <text x="50" y="76" fontSize="3" textAnchor="middle" fill="currentColor" transform="rotate(180 50 50)">ᚨ</text>
                <text x="24" y="58" fontSize="3" textAnchor="middle" fill="currentColor" transform="rotate(240 50 50)">ᚱ</text>
                <text x="30" y="34" fontSize="3" textAnchor="middle" fill="currentColor" transform="rotate(300 50 50)">ᚲ</text>
              </g>
            </svg>
          </div>

          {/* Cards container */}
          <div className="deck-3d-axis" id="deck-card-holder">
            {missions.map((mission, index) => {
              const diff = index - activeIndex;
              const isCardCompleted = completedMissionIds.includes(mission.id);
              const isActive = diff === 0;

              // Apply inline 3D rotations based on active diff offsets
              let cardStyle: React.CSSProperties = {
                opacity: 0,
                zIndex: 1,
                pointerEvents: "none",
              };

              if (diff === 0) {
                cardStyle = {
                  transform: "translateX(0px) translateY(0px) translateZ(80px) rotateY(-10deg) scale(1.02)",
                  opacity: 1,
                  zIndex: 10,
                  pointerEvents: "auto",
                };
              } else if (diff === 1) {
                cardStyle = {
                  transform: "translateX(25px) translateY(95px) translateZ(10px) rotateY(-18deg) scale(0.92)",
                  opacity: 0.7,
                  zIndex: 8,
                  pointerEvents: "auto",
                };
              } else if (diff === -1) {
                cardStyle = {
                  transform: "translateX(25px) translateY(-95px) translateZ(10px) rotateY(-18deg) scale(0.92)",
                  opacity: 0.7,
                  zIndex: 8,
                  pointerEvents: "auto",
                };
              } else if (diff === 2) {
                cardStyle = {
                  transform: "translateX(50px) translateY(185px) translateZ(-60px) rotateY(-24deg) scale(0.84)",
                  opacity: 0.45,
                  zIndex: 5,
                  pointerEvents: "auto",
                };
              } else if (diff === -2) {
                cardStyle = {
                  transform: "translateX(50px) translateY(-185px) translateZ(-60px) rotateY(-24deg) scale(0.84)",
                  opacity: 0.45,
                  zIndex: 5,
                  pointerEvents: "auto",
                };
              } else if (diff > 2) {
                cardStyle = {
                  transform: "translateX(75px) translateY(270px) translateZ(-130px) rotateY(-30deg) scale(0.76)",
                  opacity: 0,
                  zIndex: 1,
                  pointerEvents: "none",
                };
              } else if (diff < -2) {
                cardStyle = {
                  transform: "translateX(75px) translateY(-270px) translateZ(-130px) rotateY(-30deg) scale(0.76)",
                  opacity: 0,
                  zIndex: 1,
                  pointerEvents: "none",
                };
              }

              return (
                <button
                  key={mission.id}
                  className={`deck-card ${isActive ? "active" : ""}`}
                  style={cardStyle}
                  onClick={() => selectLevel(index)}
                >
                  {/* Sparkle Emitters */}
                  <div
                    className="sparkle-fountain"
                    style={{
                      position: "absolute",
                      inset: 0,
                      overflow: "hidden",
                      borderRadius: "inherit",
                      pointerEvents: "none",
                      opacity: isActive ? 1 : 0,
                      transition: "opacity 0.5s",
                    }}
                  >
                    <span style={{ position: "absolute", bottom: "-10px", left: "15%", width: "3px", height: "3px", borderRadius: "50%", animation: "riseDot 3s infinite linear", opacity: 0 }} />
                    <span style={{ position: "absolute", bottom: "-10px", left: "45%", width: "3px", height: "3px", borderRadius: "50%", animation: "riseDot 4s infinite linear", animationDelay: "1s", opacity: 0 }} />
                    <span style={{ position: "absolute", bottom: "-10px", left: "75%", width: "3px", height: "3px", borderRadius: "50%", animation: "riseDot 3.5s infinite linear", animationDelay: "0.5s", opacity: 0 }} />
                  </div>
                  <div className="pedestal-shimmer" style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: "inherit", zIndex: 4 }} />

                  <div className="card-inner">
                    <div className={`card-seal ${isCardCompleted ? "completed" : ""}`}>
                      {isCardCompleted ? "✦" : index + 1}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="card-num-tag">Level 0{index + 1}</span>
                      <h3 className="card-title-text">{mission.title}</h3>
                      <span className="card-meta-tag">+{mission.xp_reward} XP • {mission.difficulty}</span>
                    </div>
                  </div>
                  <span className={`card-status-badge ${isCardCompleted ? "completed" : ""}`}>
                    {isCardCompleted ? "Mastered" : "Start"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Grimoire Codex details board */}
        <div className="grimoire-codex">
          <div className="codex-bracket codex-bracket-tl" />
          <div className="codex-bracket codex-bracket-tr" />
          <div className="codex-bracket codex-bracket-bl" />
          <div className="codex-bracket codex-bracket-br" />

          <div className="codex-header">
            <div className="flex flex-col">
              <span className="codex-title-label">{currentMission.title}</span>
              <span className="codex-subtitle-meta">Level 0{activeIndex + 1}</span>
            </div>
            <span className="codex-difficulty-badge">{currentMission.difficulty}</span>
          </div>

          <div className="flex-1 flex flex-col gap-5" key={currentMission.id} style={{ animation: "fadeInText 0.5s ease-out forwards" }}>
            <p className="codex-desc-paragraph">
              "{currentMission.story_intro || "Erect defenses by styling absolute coordinates to intercept projectiles."}"
            </p>

            <div className="codex-objectives-box">
              <h4 className="objectives-title">Objective Parameter</h4>
              <p className="objectives-text">
                {currentMission.learning_objective || "Configure layout settings to shield target areas from incoming elementals."}
              </p>
            </div>

            <div className="codex-rewards-strip">
              <span>Reward yield:</span>
              <span className="rewards-highlight">+{currentMission.xp_reward} XP, 1x Amulet Core Shard</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => router.push(`/mission/${currentMission.slug}`)}
              className="codex-action-btn"
            >
              <span>{isCompleted ? "Replay Workbench" : "Channel Workbench"}</span>
              <span style={{ fontSize: "12px" }}>{isCompleted ? "↻" : "→"}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

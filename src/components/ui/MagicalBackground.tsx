"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  depthMultiplier: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  opacity: number;
  color: string;
}

export default function MagicalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shockwavesRef = useRef<Shockwave[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasRaf: number | null = null;
    const stars: Star[] = [];

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      
      // Scale canvas width and height for Retina displays
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      // Adjust CSS sizing to display normally
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Populate stardust stars
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.4,
        opacity: Math.random(),
        speed: Math.random() * 0.015 + 0.003,
        depthMultiplier: Math.random() * 0.75 + 0.25,
      });
    }

    // Track mouse coordinates for radial glow
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Shockwave trigger handler
    const triggerShockwave = (e: Event) => {
      const customEvent = e as CustomEvent;
      const x = customEvent.detail?.x ?? window.innerWidth / 2;
      const y = customEvent.detail?.y ?? window.innerHeight * 0.2;
      
      const activeColor = getComputedStyle(document.body).getPropertyValue("--energy-color").trim() || "#3B82F6";

      shockwavesRef.current.push({
        x,
        y,
        radius: 10,
        maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.8,
        speed: 16,
        opacity: 1,
        color: activeColor,
      });
    };
    window.addEventListener("magic-shockwave", triggerShockwave);

    const renderCanvas = () => {
      // Clear the canvas instead of solid fill so the CSS body gradient remains visible
      ctx.clearRect(0, 0, width, height);
      
      const currentScrollY = window.scrollY;

      // Draw drifting stars
      for (const star of stars) {
        star.opacity += star.speed;
        if (star.opacity > 1 || star.opacity < 0) {
          star.speed = -star.speed;
        }

        const scrollOffset = currentScrollY * star.depthMultiplier;
        let displayY = (star.y - scrollOffset) % height;
        if (displayY < 0) displayY += height;

        ctx.beginPath();
        ctx.arc(star.x, displayY, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.opacity)})`;
        ctx.fill();
      }

      // Draw active ripples
      const shockwaves = shockwavesRef.current;
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const wave = shockwaves[i];
        wave.radius += wave.speed;
        wave.opacity = 1 - wave.radius / wave.maxRadius;

        ctx.save();
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 3.5;
        ctx.globalAlpha = wave.opacity * 0.5;
        ctx.shadowColor = wave.color;
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();

        if (wave.radius >= wave.maxRadius) {
          shockwaves.splice(i, 1);
        }
      }

      canvasRaf = requestAnimationFrame(renderCanvas);
    };

    renderCanvas();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("magic-shockwave", triggerShockwave);
      if (canvasRaf) cancelAnimationFrame(canvasRaf);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-screen h-screen -z-50 pointer-events-none"
      />
      {/* Ambient mouse trailing glow spotlight */}
      <div className="fixed inset-0 -z-40 pointer-events-none ambient-radial-glow" />
      {/* Mystical rising fog canopy */}
      <div className="fixed bottom-[-20vh] left-0 w-screen h-[55vh] -z-30 pointer-events-none bg-[radial-gradient(ellipse_at_bottom,var(--energy-dim)_0%,transparent_70%)] opacity-85 transition-all duration-800" />
    </>
  );
}

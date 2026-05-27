"use client";

import { useEffect, useRef } from "react";

export default function ClientEffects() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Glowing Cursor Trail
    let mouseX = -100;
    let mouseY = -100;
    let glowX = mouseX;
    let glowY = mouseY;
    let cursorX = mouseX;
    let cursorY = mouseY;

    // 2. Magnetic Buttons
    let hoveredButton: HTMLElement | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Magnetic Buttons Logic
      const target = e.target as HTMLElement;
      // Target any buttons or elements with the .magnetic class
      const button = target.closest('button, a, .magnetic') as HTMLElement | null;
      
      if (button !== hoveredButton) {
        if (hoveredButton) {
          hoveredButton.style.transform = '';
          hoveredButton.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        }
        hoveredButton = button;
      }

      if (hoveredButton) {
        const rect = hoveredButton.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // We use a slight pull factor (0.15 for smooth effect)
        hoveredButton.style.transition = 'transform 0.1s ease-out';
        hoveredButton.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        
        // Enhance cursor visual over magnetic elements
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%) scale(1.5)`;
          cursorRef.current.style.backgroundColor = 'rgba(251, 191, 36, 0.8)'; // gold glow on hover
          cursorRef.current.style.boxShadow = '0 0 15px rgba(251, 191, 36, 0.8)';
        }
      } else {
        // Reset cursor visual
        if (cursorRef.current) {
          cursorRef.current.style.backgroundColor = 'rgba(168, 85, 247, 0.8)'; // arcane default
          cursorRef.current.style.boxShadow = '0 0 10px rgba(168, 85, 247, 0.8)';
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (hoveredButton && !hoveredButton.contains(e.relatedTarget as Node)) {
        hoveredButton.style.transform = '';
        hoveredButton.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        hoveredButton = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseout', handleMouseOut);

    const animate = () => {
      // Easing for smooth follow (glow is slower, cursor is faster)
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      
      cursorX += (mouseX - cursorX) * 0.3;
      cursorY += (mouseY - cursorY) * 0.3;

      if (cursorRef.current && !hoveredButton) {
        cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      }
      
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      }

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animId);
      
      if (hoveredButton) {
        hoveredButton.style.transform = '';
        hoveredButton.style.transition = '';
      }
    };
  }, []);

  return (
    <>
      <div 
        ref={glowRef}
        className="fixed top-0 left-0 w-80 h-80 bg-arcane-500/15 rounded-full blur-[64px] pointer-events-none z-[9998] mix-blend-screen transition-colors duration-500"
        style={{ willChange: 'transform' }}
      />
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-3 h-3 bg-arcane-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)] pointer-events-none z-[9999] transition-colors duration-300"
        style={{ willChange: 'transform' }}
      />
    </>
  );
}

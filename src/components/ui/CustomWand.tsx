"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function CustomWand() {
  const wandRef = useRef<HTMLDivElement>(null);
  const sparksRef = useRef<{ x: number; y: number; life: number; vx: number; vy: number }[]>([]);
  const lastSparkTime = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pathname = usePathname();

  useEffect(() => {
    // Hide standard cursor globally
    document.body.style.cursor = 'none';
    
    // Make interactive elements use none too so wand always shows
    const style = document.createElement('style');
    style.innerHTML = `
      * { cursor: none !important; }
    `;
    document.head.appendChild(style);

    const wand = wandRef.current;
    const canvas = canvasRef.current;
    if (!wand || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let rafId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      const now = Date.now();
      if (now - lastSparkTime.current > 30 && Math.random() > 0.4) {
        sparksRef.current.push({ 
          x: mouseX + (Math.random() - 0.5) * 40, 
          y: mouseY + (Math.random() - 0.5) * 40, 
          life: 1.0, 
          vx: (Math.random() - 0.5) * 2, 
          vy: Math.random() * 2 + 1 
        });
        lastSparkTime.current = now;
      }
    };
    window.addEventListener('mousemove', onMouseMove);

    const render = () => {
      if (wand) {
        wand.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const sparks = sparksRef.current;
      
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.life -= 0.02;
        
        if (spark.life <= 0) {
          sparks.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(spark.x, spark.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(244, 208, 104, ${spark.life})`;
          ctx.fill();
        }
      }
      
      rafId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(rafId);
      document.head.removeChild(style);
      document.body.style.cursor = 'auto';
    };
  }, [pathname]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[9999]"
      />
      <div 
        ref={wandRef}
        className="fixed top-0 left-0 w-[6px] h-[6px] bg-white rounded-full pointer-events-none z-[10000] will-change-transform"
        style={{
          boxShadow: "0 0 20px 10px rgba(255, 255, 255, 0.8), 0 0 50px 20px rgba(244, 208, 104, 0.4), 150px 0 150px -10px #F4D068, -150px 0 150px -10px #F4D068",
          opacity: 0,
          animation: "fadeIn 1s 0.5s ease-in-out forwards"
        }}
      />
    </>
  );
}

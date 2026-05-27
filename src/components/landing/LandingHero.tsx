"use client";

import { useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import GameButton from "@/components/ui/GameButton";
import { FlaskConical, Hourglass, Eye } from "lucide-react";

export default function LandingHero() {
  useEffect(() => {

    const lumosWrapper = document.getElementById('lumos-wrapper');
    const wand = document.getElementById('wand');
    const titleEl = document.getElementById('title');
    const descEl = document.getElementById('description');
    const ctaBtn = document.getElementById('cta-button');
    
    let mouseX = window.innerWidth / 2; let mouseY = window.innerHeight / 2; let rafId: number | null = null;
    let parallaxEnabled = false; 
    const pTimer = setTimeout(() => { parallaxEnabled = true; }, 4000);

    const onMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX; mouseY = e.clientY;
        if (!rafId) rafId = requestAnimationFrame(updatePositions);
    };
    document.addEventListener('mousemove', onMouseMove);

    function updatePositions() {
        if (wand) wand.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;
        if (lumosWrapper) lumosWrapper.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        if (parallaxEnabled && window.scrollY < window.innerHeight) {
            const centerX = window.innerWidth / 2; const centerY = window.innerHeight / 2;
            const rotX = ((mouseY - centerY) / centerY) * -15; const rotY = ((mouseX - centerX) / centerX) * 15;
            if (titleEl) titleEl.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(50px)`;
            if (descEl) descEl.style.transform = `perspective(1000px) rotateX(${rotX * 0.7}deg) rotateY(${rotY * 0.7}deg) translateZ(25px)`;
            if (ctaBtn) ctaBtn.style.transform = `perspective(1000px) rotateX(${rotX * 0.5}deg) rotateY(${rotY * 0.5}deg) translateZ(10px)`;
        }
        rafId = null;
    }

    const panels = document.querySelectorAll('.section-panel');
    const cpWrapper = document.getElementById('centerpiece-wrapper');
    const rings = document.querySelectorAll('.ring');
    const magicCore = document.querySelector('.magic-core');
    
    let panelOffsets: number[] = []; function cacheOffsets() { panelOffsets = Array.from(panels).map(p => (p as HTMLElement).offsetTop); }
    cacheOffsets(); window.addEventListener('resize', cacheOffsets);
    let isScrolling = false;
    
    const onScroll = () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY; const windowHeight = window.innerHeight;
                let lumosOp = 1 - (scrollY / (windowHeight * 0.2)); 
                
                if (lumosWrapper) {
                    if (lumosOp <= 0) {
                        lumosWrapper.style.display = 'none';
                    } else {
                        lumosWrapper.style.display = 'block';
                        lumosWrapper.style.opacity = lumosOp.toString();
                    }
                }

                panels.forEach((panel, index) => {
                    const scrollProgress = (scrollY - panelOffsets[index]) / windowHeight;
                    if (scrollProgress > 0 && scrollProgress <= 1.5) {
                        (panel as HTMLElement).style.opacity = Math.max(1 - scrollProgress * 1.5, 0).toString();
                        (panel as HTMLElement).style.transform = `scale(${1 - scrollProgress * 0.05}) translateZ(0)`;
                    } else if (scrollProgress <= 0) {
                        (panel as HTMLElement).style.opacity = '1'; (panel as HTMLElement).style.transform = `scale(1) translateZ(0)`;
                    }
                });

                const ringProgress = Math.min(scrollY / (windowHeight * 1.5), 1);
                if (cpWrapper) cpWrapper.style.transform = `scale(${1 + ringProgress * 4})`;
                
                if (ringProgress < 1) {
                    rings.forEach(ring => {
                        (ring as HTMLElement).style.borderRadius = '50%'; 
                        (ring as HTMLElement).style.opacity = (1 - (ringProgress * 0.8)).toString();
                        (ring as HTMLElement).style.borderColor = `rgba(244, 208, 104, ${0.15 + (ringProgress * 0.2)})`;
                    });
                    if (magicCore) (magicCore as HTMLElement).style.opacity = Math.max(1 - ringProgress * 3, 0).toString();
                }
                isScrolling = false;
            });
            isScrolling = true;
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const cards = document.querySelectorAll('.tarot-card');
    const cardListeners: any[] = [];
    cards.forEach(card => {
        const inner = card.querySelector('.tarot-inner');
        let tiltRaf: number | null = null;
        if (!inner) return;

        const onCardMove = (e: Event) => {
            if (tiltRaf) return;
            const ev = e as MouseEvent;
            tiltRaf = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = ev.clientX - rect.left; const y = ev.clientY - rect.top;
                const tiltX = ((y - rect.height/2) / (rect.height/2)) * -18; 
                const tiltY = ((x - rect.width/2) / (rect.width/2)) * 18;
                (inner as HTMLElement).style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
                tiltRaf = null;
            });
        };
        const onCardLeave = () => {
            (inner as HTMLElement).style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        };
        card.addEventListener('mousemove', onCardMove);
        card.addEventListener('mouseleave', onCardLeave);
        cardListeners.push({ card, onCardMove, onCardLeave });
    });

    const magicChars = "∿⚚⍜✧⟡⤞⎈☫∆∇ℵℶℷℸ⍟⍣⍤⍥⍨⍩+-/|\\[]{}*&^%$#@!";
    class HoverScramble {
        el: HTMLElement;
        originalText: string;
        chars: string;
        isAnimating: boolean;
        queue: any[];
        frame: number;
        raf: number | null;
        onEnter: () => void;

        constructor(el: HTMLElement) { 
            this.el = el; this.originalText = el.innerText; this.chars = magicChars; this.isAnimating = false; 
            this.queue = []; this.frame = 0; this.raf = null;
            this.onEnter = () => { if (!this.isAnimating) this.scramble(); };
            el.addEventListener('mouseenter', this.onEnter); 
        }
        scramble() { 
            this.isAnimating = true; this.queue = []; 
            for (let i = 0; i < this.originalText.length; i++) { 
                const to = this.originalText[i]; 
                if (to === ' ' || to === ',') { this.queue.push({ to, start: 0, end: 0, char: to }); continue; } 
                this.queue.push({ to, start: 0, end: Math.floor(Math.random() * 30) + 15, char: '' }); 
            } 
            this.frame = 0; this.update(); 
        }
        update() { 
            let output = ''; let complete = 0; 
            for (let i = 0; i < this.queue.length; i++) { 
                let { to, end, char } = this.queue[i]; 
                if (this.frame >= end) { complete++; output += to; } else { 
                    if (!char || Math.random() < 0.3) { 
                        char = this.chars[Math.floor(Math.random() * this.chars.length)]; this.queue[i].char = char; 
                    } 
                    output += `<span class="rune-glow">${char}</span>`; 
                } 
            } 
            this.el.innerHTML = output; 
            if (complete === this.queue.length) { 
                this.isAnimating = false; this.el.innerHTML = this.originalText; 
            } else { 
                this.raf = requestAnimationFrame(() => this.update()); this.frame++; 
            } 
        }
        destroy() {
            this.el.removeEventListener('mouseenter', this.onEnter);
            if (this.raf) cancelAnimationFrame(this.raf);
        }
    }
    
    let subtitleScramble: HoverScramble;
    let scrambleInterval: NodeJS.Timeout;
    const scrambleTimeout = setTimeout(() => { 
        const subtitleEl = document.getElementById('subtitle');
        if (subtitleEl) {
            subtitleScramble = new HoverScramble(subtitleEl); 
            scrambleInterval = setInterval(() => { if (!subtitleScramble.isAnimating) subtitleScramble.scramble(); }, 3000);
        }
    }, 3000);

    const canvas = document.getElementById('star-canvas') as HTMLCanvasElement; 
    let canvasRaf: number | null = null;
    let width = window.innerWidth, height = window.innerHeight;
    const stars: any[] = []; 
    function resizeCanvas() { 
        if (!canvas) return;
        width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; 
    }
    
    if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: false }); 
        window.addEventListener('resize', resizeCanvas); 
        resizeCanvas();
        for (let i = 0; i < 200; i++) { 
            stars.push({ x: Math.random() * width, y: Math.random() * height, radius: Math.random() * 1.5 + 0.5, opacity: Math.random(), speed: (Math.random() * 0.02) + 0.005, depthMultiplier: Math.random() * 0.8 + 0.2 }); 
        }
        
        function renderCanvas() {
            if (!ctx) return;
            if (window.scrollY < window.innerHeight * 1.5) {
                ctx.fillStyle = '#010103'; ctx.fillRect(0, 0, width, height); 
                const currentScrollY = window.scrollY;
                for (let star of stars) { 
                    star.opacity += star.speed; 
                    if (star.opacity > 1 || star.opacity < 0) star.speed = -star.speed; 
                    const scrollOffset = currentScrollY * star.depthMultiplier; 
                    let displayY = (star.y - scrollOffset) % height; 
                    if (displayY < 0) displayY += height; 
                    ctx.beginPath(); 
                    ctx.arc(star.x, displayY, star.radius, 0, Math.PI * 2); 
                    ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.opacity)})`; 
                    ctx.fill(); 
                }
            }
            canvasRaf = requestAnimationFrame(renderCanvas);
        }
        renderCanvas();
    }

    return () => {
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', cacheOffsets);
        window.removeEventListener('resize', resizeCanvas);
        clearTimeout(pTimer);
        clearTimeout(scrambleTimeout);
        clearInterval(scrambleInterval);
        if (subtitleScramble) subtitleScramble.destroy();
        if (rafId) cancelAnimationFrame(rafId);
        if (canvasRaf) cancelAnimationFrame(canvasRaf);
        cardListeners.forEach(listener => {
            listener.card.removeEventListener('mousemove', listener.onCardMove);
            listener.card.removeEventListener('mouseleave', listener.onCardLeave);
        });
    };

  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop,
        behavior: "smooth"
      });
    }
  };

  const handleHouseSelect = (e: React.MouseEvent<HTMLAnchorElement>, themeClass: string, color: string) => {
    e.preventDefault();

    const themeKey = themeClass.replace("theme-", "");

    // 1. Instantly swap theme class on body & save to localStorage
    document.body.classList.remove("theme-gold", "theme-algor", "theme-syntaxis", "theme-null");
    document.body.classList.add(themeClass);
    localStorage.setItem("CLA_THEME", themeKey);

    // 2. Dispatch shockwave from card center
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const event = new CustomEvent("magic-shockwave", {
      detail: { x, y, color }
    });
    window.dispatchEvent(event);

    // 3. Wait for shockwave ripple effect, then redirect to login page
    setTimeout(() => {
      window.location.href = "/login";
    }, 850);
  };

  return (
    <div className="dark-magic-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        .dark-magic-wrapper {
            --bg-dark: #010103; --gold: #F4D068; --gold-glow: rgba(244, 208, 104, 0.4);
            margin: 0; padding: 0; width: 100%; min-height: 100vh; background-color: var(--bg-dark); color: #E2E8F0;
            font-family: 'Inter', sans-serif; overflow-x: hidden; cursor: none;
        }
        .dark-magic-wrapper #star-canvas { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 0; pointer-events: none; }
        .dark-magic-wrapper #lumos-wrapper {
            position: fixed; top: 0; left: 0; width: 0; height: 0; pointer-events: none; z-index: 10;
            transform: translate3d(-1000px, -1000px, 0); will-change: transform;
        }
        .dark-magic-wrapper #lumos-mask {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 0px; height: 0px; border-radius: 50%;
            box-shadow: 0 0 0 9999px rgba(1, 1, 3, 0.98), inset 0 0 60px 20px rgba(1, 1, 3, 0.98);
            animation: expandHole 3s 0.5s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
        }
        .dark-magic-wrapper .magical-mist {
            position: fixed; bottom: -20vh; left: 0; width: 100vw; height: 60vh; z-index: 2; pointer-events: none;
            background: radial-gradient(ellipse at bottom, rgba(30, 20, 60, 0.4) 0%, transparent 70%);
            animation: breatheMist 10s ease-in-out infinite alternate;
        }
        .dark-magic-wrapper .nav { position: fixed; top: 40px; left: 0; width: 100%; display: flex; justify-content: center; gap: 80px; z-index: 30; opacity: 0; animation: fadeIn 2s 1s forwards; }
        .dark-magic-wrapper .nav a { text-decoration: none; color: #777; font-size: 0.8rem; letter-spacing: 0.25em; transition: all 0.3s; text-transform: uppercase; font-weight: 500; }
        .dark-magic-wrapper .nav a:hover { color: var(--gold); text-shadow: 0 0 15px var(--gold-glow); }
        .dark-magic-wrapper #centerpiece-wrapper {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1; pointer-events: none;
            display: flex; justify-content: center; align-items: center; will-change: transform; transform-origin: center center;
        }
        .dark-magic-wrapper .magical-centerpiece { position: relative; width: 0; height: 0; opacity: 0; animation: fadeIn 4s 0.5s forwards; transform-style: preserve-3d; }
        .dark-magic-wrapper .ring {
            position: absolute; top: 50%; left: 50%; border-radius: 50%; border: 1.5px solid rgba(244, 208, 104, 0.15);
            transform-style: preserve-3d; transition: border-color 0.1s;
        }
        .dark-magic-wrapper .ring-1 { width: 750px; height: 750px; margin-top: -375px; margin-left: -375px; animation: spin1 40s linear infinite; border: 2px solid rgba(244, 208, 104, 0.3); box-shadow: 0 0 40px rgba(244, 208, 104, 0.15), inset 0 0 40px rgba(244, 208, 104, 0.15); }
        .dark-magic-wrapper .ring-2 { width: 600px; height: 600px; margin-top: -300px; margin-left: -300px; animation: spin2 30s linear infinite; border: 1.5px solid rgba(244, 208, 104, 0.4); box-shadow: 0 0 30px rgba(244, 208, 104, 0.2), inset 0 0 30px rgba(244, 208, 104, 0.2); }
        .dark-magic-wrapper .ring-3 { width: 450px; height: 450px; margin-top: -225px; margin-left: -225px; animation: spin3 20s linear infinite; border: 1.5px dashed rgba(244, 208, 104, 0.5); box-shadow: 0 0 20px rgba(244, 208, 104, 0.3), inset 0 0 20px rgba(244, 208, 104, 0.3); }
        .dark-magic-wrapper .ring-4 { width: 300px; height: 300px; margin-top: -150px; margin-left: -150px; animation: spin4 15s linear infinite; border: 1px dotted rgba(244, 208, 104, 0.8); box-shadow: 0 0 15px rgba(244, 208, 104, 0.5), inset 0 0 15px rgba(244, 208, 104, 0.5); }
        .dark-magic-wrapper .magic-core {
            position: absolute; top: 50%; left: 50%; width: 250px; height: 250px; margin-top: -125px; margin-left: -125px;
            background: radial-gradient(circle, rgba(244, 208, 104, 0.4) 0%, transparent 60%);
            border-radius: 50%; animation: pulseLight 3s ease-in-out infinite alternate; will-change: opacity;
        }
        @keyframes spin1 { 100% { transform: rotateX(360deg) rotateY(180deg) rotateZ(0deg); } }
        @keyframes spin2 { 100% { transform: rotateX(180deg) rotateY(360deg) rotateZ(180deg); } }
        @keyframes spin3 { 100% { transform: rotateX(0deg) rotateY(180deg) rotateZ(360deg); } }
        @keyframes spin4 { 100% { transform: rotateX(360deg) rotateY(0deg) rotateZ(180deg); } }
        @keyframes pulseLight { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.2); opacity: 1; } }

        .dark-magic-wrapper .scroll-container { position: relative; width: 100%; padding-bottom: 50vh; }
        .dark-magic-wrapper .section-panel {
            position: sticky; top: 0; left: 0; width: 100vw; height: 100vh;
            display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 20;
        }

        .dark-magic-wrapper .subtitle { font-family: 'Cinzel', serif; color: var(--gold); font-size: 0.95rem; font-weight: 600; margin-bottom: 35px; text-transform: uppercase; letter-spacing: 0.5em; text-shadow: 0 0 10px rgba(244, 208, 104, 0.3); opacity: 0; animation: fadeUp 2s 1s forwards; transition: text-shadow 0.4s ease, transform 0.4s ease; cursor: pointer; pointer-events: auto; }
        .dark-magic-wrapper .subtitle:hover { text-shadow: 0 0 25px rgba(244, 208, 104, 1); transform: scale(1.05); }
        .dark-magic-wrapper h1 { font-family: 'Cinzel Decorative', serif; font-size: 8.5rem; font-weight: 700; margin: 0; color: #FFF; line-height: 1.1; letter-spacing: 0.03em; text-shadow: 0 0 40px rgba(255,255,255,0.2), 0 0 80px var(--gold-glow); opacity: 0; animation: fadeUp 2s 1.5s forwards; transform-style: preserve-3d; }
        .dark-magic-wrapper .description { margin-top: 50px; font-family: 'Cormorant Garamond', serif; font-size: 1.85rem; color: #AAA; font-style: italic; line-height: 1.6; max-width: 650px; text-shadow: 0 0 10px rgba(0,0,0,0.8); opacity: 0; animation: fadeUp 2s 2s forwards; transform-style: preserve-3d; text-align: center; }

        .dark-magic-wrapper .section-title { font-family: 'Cinzel Decorative', serif; font-size: 4rem; color: #FFF; margin-bottom: 80px; text-shadow: 0 0 30px var(--gold-glow); text-align: center; }
        .dark-magic-wrapper .curriculum-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; max-width: 1200px; width: 100%; }
        .dark-magic-wrapper .grimoire-page { background: rgba(14, 14, 20, 0.85); border: 1px solid rgba(244, 208, 104, 0.2); padding: 50px 40px; border-radius: 10px; position: relative; overflow: hidden; transition: transform 0.4s ease, border-color 0.4s ease; pointer-events: auto; box-shadow: inset 0 0 50px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5); }
        .dark-magic-wrapper .grimoire-page:hover { transform: translateY(-10px); border-color: rgba(244, 208, 104, 0.8); }
        .dark-magic-wrapper .grimoire-page h3 { font-family: 'Cinzel', serif; color: var(--gold); font-size: 1.8rem; margin: 0 0 20px 0; position: relative; z-index: 2; }
        .dark-magic-wrapper .grimoire-page p { font-family: 'Inter', sans-serif; color: #AAA; font-size: 1.1rem; line-height: 1.6; position: relative; z-index: 2; }

        .dark-magic-wrapper .houses-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 50px; max-width: 1200px; width: 100%; perspective: 2000px; }
        .dark-magic-wrapper .tarot-card { width: 100%; height: 480px; perspective: 1500px; pointer-events: auto; }
        .dark-magic-wrapper .tarot-flip-container { position: relative; width: 100%; height: 100%; transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform-style: preserve-3d; }
        .dark-magic-wrapper .tarot-card:hover .tarot-flip-container { transform: rotateY(180deg) scale(1.05); }
        .dark-magic-wrapper .tarot-inner { position: absolute; width: 100%; height: 100%; transform-style: preserve-3d; }
        .dark-magic-wrapper .tarot-back, .dark-magic-wrapper .tarot-front { position: absolute; top: 0; left: 0; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; transform-style: preserve-3d; }

        .dark-magic-wrapper .tarot-back { background: #0f1115; display: flex; justify-content: center; align-items: center; box-shadow: inset 0 0 50px rgba(0,0,0,0.9), 0 20px 40px rgba(0,0,0,0.8); }
        .dark-magic-wrapper .tarot-back::after { content: ''; position: absolute; top: 15px; left: 15px; right: 15px; bottom: 15px; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; transition: border-color 0.5s; }
        .dark-magic-wrapper .seal { font-size: 6rem; font-family: 'Cinzel Decorative', serif; animation: pulseLight 4s infinite alternate; transition: color 0.5s, text-shadow 0.5s; }

        .dark-magic-wrapper .ruby .seal { color: rgba(239, 68, 68, 0.8); text-shadow: 0 0 40px rgba(239, 68, 68, 0.5); }
        .dark-magic-wrapper .ruby .tarot-back::after { border-color: rgba(239, 68, 68, 0.25); box-shadow: inset 0 0 20px rgba(239, 68, 68, 0.05); }

        .dark-magic-wrapper .sapphire .seal { color: rgba(59, 130, 246, 0.8); text-shadow: 0 0 40px rgba(59, 130, 246, 0.5); }
        .dark-magic-wrapper .sapphire .tarot-back::after { border-color: rgba(59, 130, 246, 0.25); box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.05); }

        .dark-magic-wrapper .emerald .seal { color: rgba(16, 185, 129, 0.8); text-shadow: 0 0 40px rgba(16, 185, 129, 0.5); }
        .dark-magic-wrapper .emerald .tarot-back::after { border-color: rgba(16, 185, 129, 0.25); box-shadow: inset 0 0 20px rgba(16, 185, 129, 0.05); }

        .dark-magic-wrapper .tarot-front { transform: rotateY(180deg); display: flex; flex-direction: column; justify-content: flex-end; padding: 40px; box-shadow: inset 0 0 80px rgba(0,0,0,1), 0 20px 40px rgba(0,0,0,0.8); }
        
        .dark-magic-wrapper .ruby .tarot-front { background: radial-gradient(circle at center, #3f0909 0%, #110000 100%); border-color: #EF4444; }
        .dark-magic-wrapper .sapphire .tarot-front { background: radial-gradient(circle at center, #0e1d42 0%, #020511 100%); border-color: #3B82F6; }
        .dark-magic-wrapper .emerald .tarot-front { background: radial-gradient(circle at center, #042e23 0%, #000c09 100%); border-color: #10B981; }

        .dark-magic-wrapper .infinite-portal { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform-style: preserve-3d; pointer-events: none; }

        .dark-magic-wrapper .wireframe-core { position: absolute; top: 40%; left: 50%; width: 220px; height: 220px; margin-top: -110px; margin-left: -110px; transform-style: preserve-3d; transform: translateZ(-150px); }
        
        .dark-magic-wrapper .wf-cube { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: spinWireframe 12s infinite linear; }
        .dark-magic-wrapper .cube-face { position: absolute; width: 100%; height: 100%; border: 1.5px solid rgba(239, 68, 68, 0.8); background: rgba(239, 68, 68, 0.08); box-shadow: inset 0 0 40px rgba(239, 68, 68, 0.4), 0 0 25px rgba(239, 68, 68, 0.6); }
        .dark-magic-wrapper .cube-face:nth-child(1) { transform: rotateY(0deg) translateZ(110px); } .dark-magic-wrapper .cube-face:nth-child(2) { transform: rotateY(90deg) translateZ(110px); }
        .dark-magic-wrapper .cube-face:nth-child(3) { transform: rotateY(180deg) translateZ(110px); } .dark-magic-wrapper .cube-face:nth-child(4) { transform: rotateY(-90deg) translateZ(110px); }
        .dark-magic-wrapper .cube-face:nth-child(5) { transform: rotateX(90deg) translateZ(110px); } .dark-magic-wrapper .cube-face:nth-child(6) { transform: rotateX(-90deg) translateZ(110px); }

        .dark-magic-wrapper .wf-rings { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: spinWireframe 16s infinite linear reverse; }
        .dark-magic-wrapper .wf-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 1.5px solid rgba(59, 130, 246, 0.8); box-shadow: inset 0 0 40px rgba(59, 130, 246, 0.4), 0 0 25px rgba(59, 130, 246, 0.6); }
        .dark-magic-wrapper .wf-ring:nth-child(1) { transform: rotateX(45deg); } .dark-magic-wrapper .wf-ring:nth-child(2) { transform: rotateY(45deg); } .dark-magic-wrapper .wf-ring:nth-child(3) { transform: rotateX(90deg); border-style: dotted; }

        .dark-magic-wrapper .wf-glitch { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: spinGlitch 6s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite; }
        .dark-magic-wrapper .wf-tri { position: absolute; width: 100%; height: 100%; border: 1.5px dotted rgba(16, 185, 129, 0.8); box-shadow: inset 0 0 40px rgba(16, 185, 129, 0.4), 0 0 25px rgba(16, 185, 129, 0.6); }
        .dark-magic-wrapper .wf-tri:nth-child(1) { transform: rotateZ(45deg); } .dark-magic-wrapper .wf-tri:nth-child(2) { transform: rotateX(60deg) rotateY(45deg); } .dark-magic-wrapper .wf-tri:nth-child(3) { transform: rotateX(-60deg) rotateY(45deg); }

        @keyframes spinWireframe { 0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); } 100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); } }
        @keyframes spinGlitch { 0% { transform: rotateX(0deg) rotateY(0deg) scale(1); } 50% { transform: rotateX(180deg) rotateY(90deg) scale(0.8); } 100% { transform: rotateX(360deg) rotateY(360deg) scale(1); } }

        .dark-magic-wrapper .code-rain {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 15; pointer-events: none; overflow: hidden;
        }
        .dark-magic-wrapper .code-rain::before {
            content: ''; position: absolute; top: -100%; left: 0; width: 100%; height: 200%;
            background-image: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 100%);
            background-size: 100% 50%; animation: matrixFall 2s linear infinite;
            will-change: transform;
        }
        @keyframes matrixFall { 0% { transform: translateY(0); } 100% { transform: translateY(50%); } }
        
        .dark-magic-wrapper .card-content { position: relative; z-index: 20; transform: translateZ(50px); transform-style: preserve-3d; background: rgba(0,0,0,0.8); padding: 15px; border-radius: 8px; }
        .dark-magic-wrapper .card-content h3 { font-family: 'Cinzel Decorative', serif; color: #FFF; font-size: 2.2rem; margin: 0 0 10px 0; }
        .dark-magic-wrapper .card-content p { font-family: 'Cormorant Garamond', serif; color: #DDD; font-size: 1.1rem; font-style: italic; margin: 0; }

        .dark-magic-wrapper .rune-glow { color: var(--gold); text-shadow: 0 0 15px var(--gold), 0 0 30px var(--gold); font-family: 'Inter', sans-serif; font-style: normal; }

        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes expandHole { to { width: 800px; height: 800px; } }
` }} />

    <canvas id="star-canvas"></canvas>
    <div className="magical-mist"></div>
    <div id="lumos-wrapper"><div id="lumos-mask"></div></div>

    <div className="nav">
        <a href="#panel-houses" onClick={(e) => handleScrollTo(e, 'panel-houses')}>The Houses</a>
        <a href="#panel-curriculum" onClick={(e) => handleScrollTo(e, 'panel-curriculum')}>Arcane Spells</a>
        <a href="#panel-potions" onClick={(e) => handleScrollTo(e, 'panel-potions')}>Potions</a>
        <Link href="/login">Enter Realm</Link>
    </div>

    <div id="centerpiece-wrapper">
        <div className="magical-centerpiece">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
            <div className="ring ring-4"></div>
            <div className="magic-core"></div>
        </div>
    </div>

    <div className="scroll-container">
        <div className="section-panel" id="panel-hero">
            <div className="subtitle" id="subtitle">Master the Arcane Arts</div>
            <h1 id="title">The Academy</h1>
            <div className="description" id="description">Where lines of code are incantations waiting to be cast, and logic reveals pure magic.</div>
            <div className="mt-12" style={{ opacity: 0, animation: 'fadeUp 2s 2.5s forwards', transformStyle: 'preserve-3d' }} id="cta-button">
                <a href="#panel-curriculum" onClick={(e) => handleScrollTo(e, 'panel-curriculum')}>
                    <GameButton variant="gold" size="lg" className="px-10 py-4 text-lg border-gold-400 cursor-pointer">
                        Begin Journey
                    </GameButton>
                </a>
            </div>
        </div>

        <div className="section-panel" id="panel-curriculum">
            <h2 className="section-title">The Arcane Curriculum</h2>
            <div className="curriculum-grid">
                <div className="grimoire-page">
                    <h3>Transfiguration</h3>
                    <p>Mastering HTML & CSS to reshape the visual realm at will. Build impossible layouts and stunning illusions.</p>
                </div>
                <div className="grimoire-page">
                    <h3>Charms</h3>
                    <p>Breathing life and interactivity into the DOM with JavaScript. Make your components react, float, and glow.</p>
                </div>
                <div className="grimoire-page">
                    <h3>The Dark Arts</h3>
                    <p>Delving deep into servers, databases, and backend architecture. Command immense power from the shadows.</p>
                </div>
            </div>
        </div>

        <div className="section-panel" id="panel-potions">
            <h2 className="section-title">Mystical Alchemy & Potions</h2>
            <div className="curriculum-grid">
                <div className="grimoire-page relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" style={{ transform: 'translate(10px, -10px)' }}>
                        <FlaskConical className="w-24 h-24 stroke-[1]" />
                    </div>
                    <div className="flex items-center gap-3 mb-4" style={{ position: 'relative', zIndex: 5 }}>
                        <FlaskConical className="w-8 h-8 text-gold-500 drop-shadow-[0_0_8px_rgba(244,208,104,0.6)] animate-pulse" />
                        <h3 style={{ marginBottom: 0 }}>Mana Elixir</h3>
                    </div>
                    <p style={{ position: 'relative', zIndex: 5 }}>Brew logic elixirs that double your XP gains. Speed run quests and power up your player ranks in the arena.</p>
                </div>

                <div className="grimoire-page relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" style={{ transform: 'translate(10px, -10px)' }}>
                        <Hourglass className="w-24 h-24 stroke-[1]" />
                    </div>
                    <div className="flex items-center gap-3 mb-4" style={{ position: 'relative', zIndex: 5 }}>
                        <Hourglass className="w-8 h-8 text-gold-500 drop-shadow-[0_0_8px_rgba(244,208,104,0.6)] animate-pulse" />
                        <h3 style={{ marginBottom: 0 }}>Chronos Hourglass</h3>
                    </div>
                    <p style={{ position: 'relative', zIndex: 5 }}>An alchemical artifact that grants bonus time for epic programming boss fights and difficult dungeon trials.</p>
                </div>

                <div className="grimoire-page relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" style={{ transform: 'translate(10px, -10px)' }}>
                        <Eye className="w-24 h-24 stroke-[1]" />
                    </div>
                    <div className="flex items-center gap-3 mb-4" style={{ position: 'relative', zIndex: 5 }}>
                        <Eye className="w-8 h-8 text-gold-500 drop-shadow-[0_0_8px_rgba(244,208,104,0.6)] animate-pulse" />
                        <h3 style={{ marginBottom: 0 }}>Algorithmic Brew</h3>
                    </div>
                    <p style={{ position: 'relative', zIndex: 5 }}>Reveal hidden paths and debugging solutions. Gain insight into complex memory and compiler errors.</p>
                </div>
            </div>
        </div>

        <div className="section-panel" id="panel-houses">
            <h2 className="section-title">Choose Your Path</h2>
            <div className="houses-grid">
                
                <a href="/login" onClick={(e) => handleHouseSelect(e, 'theme-algor', '#EF4444')} className="tarot-card ruby">
                    <div className="tarot-flip-container">
                        <div className="tarot-inner">
                            <div className="tarot-back"><div className="seal">✧</div></div>
                            <div className="tarot-front">
                                <div className="infinite-portal">
                                    <div className="wireframe-core">
                                        <div className="wf-cube">
                                            <div className="cube-face"></div><div className="cube-face"></div><div className="cube-face"></div>
                                            <div className="cube-face"></div><div className="cube-face"></div><div className="cube-face"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="code-rain"></div>
                                <div className="card-content">
                                    <h3>House Algor</h3>
                                    <p>Courage, logic, and computational power.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>

                <a href="/login" onClick={(e) => handleHouseSelect(e, 'theme-syntaxis', '#3B82F6')} className="tarot-card sapphire">
                    <div className="tarot-flip-container">
                        <div className="tarot-inner">
                            <div className="tarot-back"><div className="seal">⚚</div></div>
                            <div className="tarot-front">
                                <div className="infinite-portal">
                                    <div className="wireframe-core">
                                        <div className="wf-rings">
                                            <div className="wf-ring"></div><div className="wf-ring"></div><div className="wf-ring"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="code-rain"></div>
                                <div className="card-content">
                                    <h3>House Syntaxis</h3>
                                    <p>Wisdom, elegance, and pixel-perfect execution.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>

                <a href="/login" onClick={(e) => handleHouseSelect(e, 'theme-null', '#10B981')} className="tarot-card emerald">
                    <div className="tarot-flip-container">
                        <div className="tarot-inner">
                            <div className="tarot-back"><div className="seal">∿</div></div>
                            <div className="tarot-front">
                                <div className="infinite-portal">
                                    <div className="wireframe-core">
                                        <div className="wf-glitch">
                                            <div className="wf-tri"></div><div className="wf-tri"></div><div className="wf-tri"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="code-rain"></div>
                                <div className="card-content">
                                    <h3>House Null</h3>
                                    <p>Cunning, resourcefulness, and mastery of shadows.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>

            </div>
        </div>
    </div>

    </div>
  );
}

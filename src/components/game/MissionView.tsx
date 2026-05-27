"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText, Wand, Target, XCircle, AlertTriangle, CheckCircle, RotateCcw, Play, Zap, Sparkles, ArrowLeft, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";
import CodeEditor from "@/components/editor/CodeEditor";
import GameButton from "@/components/ui/GameButton";
import GameCard from "@/components/ui/GameCard";
import type { Mission } from "@/types/database";

interface MissionViewProps {
  mission: Omit<Mission, "id" | "region_id" | "created_at"> & {
    id?: string;
    region?: { slug: string } | null;
  };
  matchId?: string;
  opponentId?: string;
}

const renderStoryText = (text: string) => {
  if (!text) return "";
  // Split by bold markdown ** and inline code `
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="text-parchment font-bold font-display tracking-wide">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="bg-void/50 border border-energy/10 text-gold-400 px-1.5 py-0.5 rounded text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

export default function MissionView({ mission, matchId, opponentId }: MissionViewProps) {
  const router = useRouter();
  const [code, setCode] = useState(mission.starter_code);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewCode, setPreviewCode] = useState(mission.starter_code);
  const [testsPassed, setTestsPassed] = useState<boolean | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"story" | "hints">("story");
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [opponentProgress, setOpponentProgress] = useState<{ passed: number, total: number }>({ passed: 0, total: mission.test_cases?.length || 1 });
  const [opponentProfile, setOpponentProfile] = useState<any>(null);
  const [matchWinner, setMatchWinner] = useState<string | null>(null);
  const [compilerStatus, setCompilerStatus] = useState<"compiling" | "success" | "failure">("compiling");
  const getAnimalImage = () => {
    const slug = mission.region?.slug || "";
    if (slug.includes("loop")) return "/ethereal_serpent.png";
    if (slug.includes("choice") || slug.includes("conditional") || slug.includes("algor")) return "/ethereal_dragon.png";
    return "/ethereal_raven.png";
  };

  const supabase = createClient();

  // Multiplayer setup
  useEffect(() => {
    if (!matchId || !opponentId) return;

    const fetchOpponent = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", opponentId).single();
      if (data) setOpponentProfile(data);
    };
    fetchOpponent();

    const channel = supabase.channel(`match_${matchId}`)
      .on("broadcast", { event: "progress" }, (payload) => {
        if (payload.payload.userId === opponentId) {
          setOpponentProgress({ passed: payload.payload.passed, total: payload.payload.total });
        }
      })
      .on("broadcast", { event: "completed" }, (payload) => {
         if (payload.payload.userId === opponentId) {
            setMatchWinner(opponentId);
            alert("Opponent finished first!");
         }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, opponentId, supabase]);


  // Bot simulation logic
  useEffect(() => {
    if (!matchId || !opponentProfile || !opponentProfile.username.includes('[BOT]')) return;
    if (matchWinner) return;

    const totalTests = mission.test_cases?.length || 1;
    let currentPassed = 0;

    const interval = setInterval(() => {
      currentPassed += 1;
      setOpponentProgress({ passed: currentPassed, total: totalTests });

      if (currentPassed >= totalTests) {
        clearInterval(interval);
        setMatchWinner(opponentProfile.id);
        alert("The Bot finished first! You lose!");
        // We could also update the match in the DB here, but since the human user
        // will get this alert, the DB match status doesn't strictly matter for the MVP bot demo.
      }
    }, 5000); // Bot passes a test every 5 seconds

    return () => clearInterval(interval);
  }, [opponentProfile, matchId, matchWinner, mission]);

  // Initialize code from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`mission-${mission.slug}-code`);
    if (saved) {
      setCode(saved);
    }
  }, [mission.slug]);

  // Save code to localStorage on change
  useEffect(() => {
    if (code !== mission.starter_code) {
      localStorage.setItem(`mission-${mission.slug}-code`, code);
    }
  }, [code, mission.slug, mission.starter_code]);

  // Pre-load Pyodide (Python runtime in the browser)
  useEffect(() => {
    import("@/lib/pythonRunner").then(({ initPyodide }) => {
      initPyodide()
        .then(() => setPyodideReady(true))
        .catch((err) => console.error("Failed to load Python runtime:", err));
    });
  }, []);

  // Execute code using real Python (Pyodide / WebAssembly)
  const executeCode = useCallback(async (): Promise<{ stdout: string; stderr: string } | null> => {
    if (mission.language === 'html') return null;

    const { runPython } = await import("@/lib/pythonRunner");
    const result = await runPython(code);

    return { stdout: result.stdout, stderr: result.stderr };
  }, [code, mission.language]);

  // Run code (preview only — no test evaluation, no XP)
  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput("");
    setTestsPassed(null);

    try {
      if (mission.language === 'html') {
        setPreviewCode(code);
        setIsRunning(false);
        return;
      }
      
      const result = await executeCode();
      if (result) {
        if (result.stderr) {
          setOutput(`Error:\n${result.stderr}`);
        } else {
          setOutput(result.stdout);
        }
      }
      setIsRunning(false);
    } catch {
      setOutput("Failed to connect to execution service");
      setIsRunning(false);
    }
  }, [executeCode, code, mission.language]);

  // Submit code (run + evaluate tests + award XP)
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setOutput("");
    setTestsPassed(null);
    setCompilerStatus("compiling");

    try {
      let allPassed = false;
      let actualXp = Math.floor(mission.xp_reward * (1 - (hintsUsed * 0.1)));
      let executedResult: { stdout: string; stderr: string } | null = null;

      if (mission.language === 'html') {
        setPreviewCode(code);
        // HTML evaluation via string matching
        const normalizedCode = code.replace(/\s+/g, '');
        allPassed = mission.test_cases.every((tc: any) => {
          if (tc.input === "check_html_tag") return code.includes(`<${tc.expected_output}`);
          if (tc.input === "check_html_class") return code.includes(`class="${tc.expected_output}"`) || code.includes(`class='${tc.expected_output}'`);
          if (tc.input === "check_css_property") return normalizedCode.includes(tc.expected_output.replace(/\s+/g, ''));
          return code.includes(tc.expected_output);
        });
      } else {
        executedResult = await executeCode();
        if (executedResult && !executedResult.stderr) {
          const trimmedOutput = executedResult.stdout.trim();
          allPassed = mission.test_cases.every((tc: any) =>
            trimmedOutput.includes(tc.expected_output.trim())
          );
        } else {
          allPassed = false;
        }
      }

      // Transition the overlay color and status text at 1.7 seconds
      setTimeout(() => {
        setCompilerStatus(allPassed ? "success" : "failure");
      }, 1700);

      // Delay victory screen and logging until compile animation finishes
      setTimeout(async () => {
        if (executedResult) {
          if (executedResult.stderr) {
            setOutput(`Error:\n${executedResult.stderr}`);
          } else {
            setOutput(executedResult.stdout);
          }
        }

        setTestsPassed(allPassed);

        if (matchId && mission.id) {
          const supabaseClient = createClient();
          const { data: { user } } = await supabaseClient.auth.getUser();
          await supabaseClient.channel(`match_${matchId}`).send({
            type: "broadcast",
            event: "progress",
            payload: { userId: user?.id, passed: allPassed ? mission.test_cases.length : 0, total: mission.test_cases.length }
          });
          
          if (allPassed) {
             await supabaseClient.from("matches").update({ status: "completed", winner_id: user?.id }).eq("id", matchId);
             await supabaseClient.channel(`match_${matchId}`).send({
               type: "broadcast",
               event: "completed",
               payload: { userId: user?.id }
             });
          }
        }

        if (allPassed) {
          setShowSuccess(true);

          try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
              actualXp = Math.floor(mission.xp_reward * (1 - (hintsUsed * 0.1)));

              // 1. Insert mission completion
              const { error: insertError } = await supabase.from("mission_completions").insert({
                user_id: user.id,
                mission_id: mission.id as string,
                code_submitted: code,
                tests_passed: mission.test_cases.length,
                tests_total: mission.test_cases.length,
                xp_earned: actualXp,
                hints_used: hintsUsed,
              });

              // 2. Only award XP if this is their first time completing it (insert succeeds)
              if (!insertError) {
                setEarnedXp(actualXp);
                await supabase.rpc('award_xp', {
                  p_user_id: user.id,
                  p_amount: actualXp,
                  p_source: 'mission',
                  p_ref: mission.id as string
                });

                // 3. Evaluate Badges only on new completions
                const badgeRes = await fetch("/api/badges/evaluate", { method: "POST" });
                const badgeData = await badgeRes.json();
                if (badgeData.success && badgeData.newlyEarned?.length > 0) {
                  setNewBadges(badgeData.newlyEarned);
                  
                  // Fire confetti for Region Conquered!
                  const duration = 3 * 1000;
                  const end = Date.now() + duration;

                  const frame = () => {
                    confetti({
                      particleCount: 5,
                      angle: 60,
                      spread: 55,
                      origin: { x: 0 },
                      colors: ['#FBBF24', '#8B5CF6', '#3B82F6']
                    });
                    confetti({
                      particleCount: 5,
                      angle: 120,
                      spread: 55,
                      origin: { x: 1 },
                      colors: ['#FBBF24', '#8B5CF6', '#3B82F6']
                    });

                    if (Date.now() < end) {
                      requestAnimationFrame(frame);
                    }
                  };
                  frame();
                }
              } else {
                setEarnedXp(0);
              }

              // 4. Clear localStorage
              localStorage.removeItem(`mission-${mission.slug}-code`);
            }
          } catch (e) {
            console.error("Failed to save progress", e);
          }
        }
        setIsSubmitting(false);
      }, 2500);

    } catch {
      setOutput("Failed to connect to execution service");
      setTestsPassed(false);
      setCompilerStatus("failure");
      setIsSubmitting(false);
    }
  }, [executeCode, mission, hintsUsed, code, matchId]);

  // Ask The Wizard for a hint
  const handleAskWizard = useCallback(async () => {
    if (hintsUsed >= 3) return;

    const nextHintLevel = hintsUsed + 1;
    setIsLoadingHint(true);
    setActiveTab("hints");

    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionTitle: mission.title,
          learningObjective: mission.learning_objective,
          starterCode: mission.starter_code,
          userCode: code,
          language: mission.language || "python",
          hintLevel: nextHintLevel,
          errorMessage: output.includes("Error") ? output : undefined,
        }),
      });

      const data = await res.json();
      setCurrentHint(data.hint || "The Wizard remains silent...");
      setHintsUsed(nextHintLevel);
    } catch {
      setCurrentHint(
        "The Wizard's crystal ball is cloudy. Try again in a moment."
      );
    } finally {
      setIsLoadingHint(false);
    }
  }, [hintsUsed, code, output, mission]);

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-void font-body overflow-hidden">
      {/* Left Panel: Story + Hints */}
      <div className="w-full lg:w-[400px] xl:w-[440px] border-r border-energy/20 bg-glass/85 flex flex-col backdrop-blur-md shadow-card z-20">
        {/* Top Navigation */}
        <div className="px-5 pt-4 pb-2 flex justify-between items-center">
          {!matchId && (
            <button
              onClick={() => router.push('/map')}
              className="flex items-center gap-2 text-mist hover:text-energy text-xs font-display tracking-widest uppercase transition-all hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 text-energy" /> Back to Map
            </button>
          )}
        </div>

        {matchId && opponentProfile && (
          <div className="px-5 py-3 mx-4 mb-2 bg-void/60 border border-red-500/30 rounded-xl flex flex-col gap-2 relative overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex flex-shrink-0 items-center justify-center font-bold text-red-400 text-xs border border-red-500/30">
                 {(opponentProfile.username?.[0] || opponentProfile.display_name?.[0] || "?").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-parchment text-xs tracking-wider uppercase truncate">{opponentProfile.display_name || opponentProfile.username}</span>
                  <span className="text-[10px] text-red-400 font-mono font-bold">{opponentProgress.passed} / {opponentProgress.total}</span>
                </div>
              </div>
            </div>
            <div className="w-full h-1 bg-void rounded-full overflow-hidden relative z-10 border border-red-500/10">
              <motion.div 
                className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
                initial={{ width: 0 }}
                animate={{ width: `${(opponentProgress.passed / Math.max(opponentProgress.total, 1)) * 100}%` }}
              />
            </div>
            {matchWinner === opponentProfile.id && (
              <div className="absolute inset-0 bg-red-950/40 flex items-center justify-center z-20 backdrop-blur-[1.5px]">
                 <span className="text-red-400 font-display font-bold text-[10px] tracking-widest uppercase animate-pulse">Finished First</span>
              </div>
            )}
          </div>
        )}

        {/* Mission Header */}
        <div className="p-5 border-b border-energy/20 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold font-display tracking-wider border ${
                mission.difficulty === "novice"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : mission.difficulty === "apprentice"
                  ? "bg-gold-500/10 text-gold-400 border-gold-500/25"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {mission.difficulty}
            </span>
            <span className="text-energy text-[10px] font-mono tracking-widest font-bold uppercase ml-1.5">
              +{mission.xp_reward} XP
            </span>
          </div>
          <h1 className="font-display text-xl text-parchment font-bold tracking-wide mt-1">
            {mission.title}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-energy/20">
          {(["story", "hints"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3.5 text-[10px] tracking-widest font-bold font-display uppercase transition-colors cursor-pointer ${
                activeTab === tab
                  ? "text-energy border-b-2 border-energy bg-energy/5 rune-glow"
                  : "text-smoke hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "story" ? (
                <span className="flex items-center justify-center gap-2"><ScrollText className="w-4 h-4" /> Story</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><Wand className="w-4 h-4" /> Hints ({hintsUsed}/3)</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {activeTab === "story" ? (
            <div className="space-y-4">
              <p className="text-mist text-sm font-serif-cormorant leading-relaxed whitespace-pre-line">
                {renderStoryText(mission.story_intro)}
              </p>
              <div className="bg-gradient-to-br from-gold-300/10 via-amber-600/5 to-transparent border border-gold-500/20 p-4 rounded-lg shadow-inner">
                <h3 className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-display">
                  <Target className="w-4 h-4" /> Objective
                </h3>
                <p className="text-parchment text-xs font-serif-cormorant leading-relaxed italic">
                  {mission.learning_objective}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentHint ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <GameCard hover={false} glowColor="gold" className="text-sm border-gold-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Wand className="w-5 h-5 text-gold-400" />
                      <span className="font-display text-gold-400 text-xs uppercase tracking-widest font-bold">
                        The Wizard speaks...
                      </span>
                    </div>
                    <p className="text-mist font-serif-cormorant leading-relaxed italic whitespace-pre-line">
                      {currentHint}
                    </p>
                  </GameCard>
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4"><Wand className="w-10 h-10 text-mist" /></div>
                  <p className="text-mist text-sm font-serif-cormorant italic">
                    The Wizard awaits your call...
                  </p>
                  <p className="text-smoke text-[10px] font-display uppercase tracking-widest font-bold mt-2">
                    Click below to receive guidance
                  </p>
                </div>
              )}

              <GameButton
                variant="secondary"
                size="sm"
                className="w-full text-xs font-display tracking-widest uppercase font-bold"
                onClick={handleAskWizard}
                isLoading={isLoadingHint}
                disabled={hintsUsed >= 3}
              >
                {hintsUsed >= 3
                  ? "No more hints available"
                  : <span className="flex items-center justify-center gap-1.5"><Sparkles className="w-4 h-4" /> Ask The Wizard (Hint {hintsUsed + 1}/3)</span>}
              </GameButton>

              {hintsUsed > 0 && (
                <p className="text-smoke text-[10px] font-display font-semibold tracking-wider text-center uppercase">
                  Each hint reduces XP reward by 10%
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Editor + Output */}
      <div className="flex-1 flex flex-col min-w-0 bg-void/10 z-10 relative">
        {/* Editor Wrapper with Runic Corners */}
        <div className="flex-1 p-4 bg-void/30 relative flex flex-col" style={{ minHeight: "300px" }}>
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-energy pointer-events-none" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-energy pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-energy pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-energy pointer-events-none" />
          
          <div className="flex-1 border border-energy/15 rounded-lg overflow-hidden relative shadow-inner bg-black/60">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={mission.language || 'python'}
              height="calc(100vh - 18.5rem)"
            />

            {/* Holographic Sigil Compiler Overlay */}
            <AnimatePresence>
              {isSubmitting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-6 z-30 backdrop-blur-md"
                >
                  <div className={`strange-mandala-container scale-75 md:scale-100 ${compilerStatus}`}>
                    {/* Strange Sparkles Orbiting */}
                    <div className="strange-sparkle-dot spark-1"></div>
                    <div className="strange-sparkle-dot spark-2"></div>
                    <div className="strange-sparkle-dot spark-3"></div>

                    {/* Expanding Success Shockwave Burst */}
                    <div className="strange-success-burst"></div>

                    {/* Outer Runic Ring (Clockwise) */}
                    <svg className="strange-ring outer-runes" viewBox="0 0 300 300">
                      <defs>
                        <path id="reactCirclePath" d="M 150, 150 m -120, 0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0" />
                      </defs>
                      <circle cx="150" cy="150" r="135" stroke="var(--energy-color)" strokeWidth="1.5" fill="none" strokeDasharray="12 6 3 6" />
                      <circle cx="150" cy="150" r="122" stroke="var(--gold)" strokeWidth="1" fill="none" />
                      <text fill="var(--energy-color)" fontFamily="Cinzel" fontSize="9" letterSpacing="4px">
                        <textPath href="#reactCirclePath">ᚠ ᚢ ᚦ ᚨ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ ᚠ ᚢ ᚦ ᚨ ᚲ ᚷ ᚹ ᚺ ᚾ</textPath>
                      </text>
                    </svg>

                    {/* Middle Geometric Ring (Counter-Clockwise) */}
                    <svg className="strange-ring middle-geom" viewBox="0 0 300 300">
                      <g transform="translate(150, 150)">
                        <rect x="-75" y="-75" width="150" height="150" stroke="var(--energy-color)" strokeWidth="1.2" fill="none" strokeDasharray="6 4" />
                        <rect x="-75" y="-75" width="150" height="150" stroke="var(--energy-color)" strokeWidth="1.2" fill="none" strokeDasharray="6 4" transform="rotate(45)" />
                        <circle cx="0" cy="0" r="105" stroke="var(--gold)" strokeWidth="1.5" fill="none" strokeDasharray="30 8 4 8" />
                        <polygon points="0,-90 78,45 -78,45" stroke="var(--gold)" strokeWidth="1" fill="none" opacity="0.6" />
                        <polygon points="0,90 78,-45 -78,-45" stroke="var(--gold)" strokeWidth="1" fill="none" opacity="0.6" />
                      </g>
                    </svg>

                    {/* Inner Shield Ring (Clockwise) */}
                    <svg className="strange-ring inner-shield" viewBox="0 0 300 300">
                      <defs>
                        <path id="reactInnerCirclePath" d="M 150, 150 m -70, 0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0" />
                      </defs>
                      <circle cx="150" cy="150" r="82" stroke="var(--gold)" strokeWidth="1.2" fill="none" strokeDasharray="5 3" />
                      <polygon points="150,68 221,191 79,191" stroke="var(--energy-color)" strokeWidth="1.2" fill="none" opacity="0.8" />
                      <polygon points="150,232 221,109 79,109" stroke="var(--energy-color)" strokeWidth="1.2" fill="none" opacity="0.8" />
                      <text fill="var(--gold)" fontFamily="Cinzel" fontSize="8.5" letterSpacing="3.5px">
                        <textPath href="#reactInnerCirclePath">SYNTAXIS • ALGOR • NULL • IMPERIAL •</textPath>
                      </text>
                    </svg>

                    {/* Central Animal Sigil */}
                    {compilerStatus === "compiling" && !isSubmitting && (
                      <div className="magic-circle-animal-wrap">
                        <img src={getAnimalImage()} className="magic-circle-animal animate-pulse" alt="Active House Animal" />
                      </div>
                    )}

                    {/* Failure Cracks and Shards */}
                    {compilerStatus === "failure" && (
                      <>
                        <svg className="strange-failure-cracks" viewBox="0 0 300 300">
                          <path d="M150,150 L120,80 L110,40 M150,150 L180,60 L210,20 M150,150 L200,190 L240,220 M150,150 L90,180 L40,200 M150,150 L140,240 L130,280" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M120,80 L80,70 M180,60 L220,80 M200,190 L250,170 M90,180 L70,140" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="strange-shard shard-1"></div>
                        <div className="strange-shard shard-2"></div>
                        <div className="strange-shard shard-3"></div>
                        <div className="strange-shard shard-4"></div>
                        <div className="strange-shard shard-5"></div>
                      </>
                    )}
                  </div>
                  <span className={`font-display font-bold text-xs tracking-[0.22em] uppercase ${
                    compilerStatus === "failure"
                      ? "animate-shake strange-failure-text"
                      : compilerStatus === "success"
                      ? "strange-success-text"
                      : "text-energy animate-pulse"
                  }`}>
                    {compilerStatus === "success" 
                      ? "Incantation Mastered!" 
                      : compilerStatus === "failure" 
                      ? "Incantation Shattered!" 
                      : isSubmitting 
                      ? "Channelling Arcane Rewards" 
                      : "Compiling Incantation"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Output Panel */}
        <div className="border-t border-energy/20 bg-glass shadow-card z-20">
          {/* Controls */}
          <div className="flex items-center justify-between p-3.5 border-b border-energy/10 bg-glass/80">
            <div className="flex items-center gap-2">
              <span className="text-mist text-[10px] font-display font-bold uppercase tracking-widest">Output Logs</span>
              {testsPassed !== null && (
                <span
                  className={`text-[10px] font-display tracking-widest uppercase font-bold ${
                    testsPassed ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {testsPassed ? (
                    <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Tests passed!</span>
                  ) : (
                    <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Tests failed</span>
                  )}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <GameButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCode(mission.starter_code);
                  setOutput("");
                  setTestsPassed(null);
                }}
                className="text-[10px] font-display font-bold uppercase tracking-widest"
              >
                <span className="flex items-center gap-1.5"><RotateCcw className="w-4 h-4" /> Reset</span>
              </GameButton>
              <GameButton
                variant="secondary"
                size="sm"
                onClick={handleRun}
                isLoading={isRunning}
                disabled={isSubmitting}
                id="run-code-button"
                className="text-[10px] font-display font-bold uppercase tracking-widest px-4 py-2 border border-energy/20 hover:border-energy/40"
              >
                <span className="flex items-center gap-1.5"><Play className="w-4 h-4 fill-current" /> Run Code</span>
              </GameButton>
              <GameButton
                variant="gold"
                size="sm"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={isRunning}
                id="submit-code-button"
                className="text-[10px] font-display font-bold uppercase tracking-widest px-5 py-2 shadow-glow-gold text-void"
              >
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 fill-current" /> Submit</span>
              </GameButton>
            </div>
          </div>

          {/* Output area */}
          <div className="p-4 h-32 overflow-y-auto font-mono text-sm bg-void/90">
            {mission.language === 'html' ? (
              <div className="w-full h-full bg-white rounded overflow-hidden">
                <iframe
                  srcDoc={previewCode}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                  title="HTML Preview"
                />
              </div>
            ) : output ? (
              <pre
                className={`whitespace-pre-wrap ${
                  output.includes("Error:") || output.includes("Failed")
                    ? "text-red-400"
                    : "text-emerald-300"
                }`}
              >
                {output}
              </pre>
            ) : (
              <span className="text-smoke text-[10px] uppercase font-bold tracking-widest font-display animate-pulse">
                Click &ldquo;Run Code&rdquo; to initiate incantation trial...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-center w-full max-w-md px-4"
            >
              <GameCard
                hover={false}
                glowColor={newBadges.length > 0 ? "emerald" : "gold"}
                className={`max-w-md mx-auto ${newBadges.length > 0 ? "border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]" : "border-gold-500 shadow-[0_0_50px_rgba(244,208,104,0.3)]"}`}
              >
                {newBadges.length > 0 ? (
                  // REGION CONQUERED SCREEN
                  <>
                    <motion.div
                      className="text-6xl mb-6"
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Trophy className="w-20 h-20 mx-auto text-emerald-400 fill-current drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    </motion.div>
                    
                    <h2 className="font-display-dec text-3xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-gold-400 to-emerald-400 font-bold mb-2 tracking-wider animate-pulse">
                      REGION CONQUERED!
                    </h2>
                    
                    <p className="text-mist font-serif-cormorant italic text-lg mb-6">You have proven yourself worthy.</p>
                    
                    <div className="mb-8 p-4 bg-void/50 rounded-xl border border-emerald-500/30 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
                      <h3 className="text-[10px] font-bold text-emerald-400 font-display uppercase tracking-widest mb-4">
                        Skill Badge Unlocked
                      </h3>
                      <div className="flex justify-center gap-4">
                        {newBadges.map((b) => (
                          <div key={b.id} className="flex flex-col items-center">
                            <span className="text-5xl mb-3 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">{b.icon_url}</span>
                            <span className="text-sm font-bold text-parchment">{b.name}</span>
                            <span className="text-xs text-gold-400 font-mono mt-1">+{b.xp_bonus} Bonus XP</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  // STANDARD SPELL MASTERED SCREEN
                  <>
                    <motion.div
                      className="text-6xl mb-4"
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <Zap className="w-16 h-16 mx-auto text-gold-400 fill-current drop-shadow-[0_0_15px_rgba(244,208,104,0.5)]" />
                    </motion.div>
                    <h2 className="font-display-dec text-2xl text-gold-400 tracking-wider uppercase mb-2">
                      Spell Mastered!
                    </h2>
                    <p className="text-mist font-serif-cormorant italic mb-2">{mission.title} — Complete!</p>
                  </>
                )}

                {/* XP Summary (Shared) */}
                {earnedXp > 0 ? (
                  <>
                    <motion.div
                      className={`text-3xl font-display mb-4 font-bold ${newBadges.length > 0 ? "text-emerald-400" : "text-gold-400"}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                    >
                      +{earnedXp} XP
                    </motion.div>
                    {hintsUsed > 0 && (
                      <p className="text-smoke text-[10px] uppercase font-bold tracking-wider mb-4">
                        ({hintsUsed} hint{hintsUsed > 1 ? "s" : ""} used — {hintsUsed * 10}% XP
                        reduction)
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-smoke text-xs font-display uppercase tracking-widest font-bold mb-4">
                    You have already mastered this spell. No XP awarded.
                  </p>
                )}

                <GameButton
                  variant="gold"
                  size="md"
                  onClick={() => {
                    if (newBadges.length > 0) {
                      // Always go back to map when completing a region
                      router.push("/map");
                    } else if (mission.region?.slug) {
                      router.push(`/map/${mission.region.slug}`);
                    } else {
                      router.push("/map");
                    }
                  }}
                  className="w-full mt-4 text-xs font-display tracking-widest uppercase font-bold text-void"
                  id="continue-button"
                >
                  {newBadges.length > 0 ? "Return to the World Map →" : "Continue Your Quest →"}
                </GameButton>
              </GameCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

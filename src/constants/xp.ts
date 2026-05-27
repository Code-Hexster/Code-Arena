// ============================================================
// XP & Level Constants
// ============================================================

/**
 * Level formula: level = floor(totalXp / XP_PER_LEVEL) + 1
 *
 * Simple and predictable:
 *   Level 1 =   0–99  XP
 *   Level 2 = 100–199 XP
 *   Level 3 = 200–299 XP
 *   Level 4 = 300–399 XP
 *   ...and so on.
 *
 * Every 100 XP = 1 level up.
 */
export const XP_PER_LEVEL = 100;

/** Calculate level from total XP */
export function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

/** Calculate XP needed to reach the next level */
export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * XP_PER_LEVEL;
}

/** Calculate XP progress within the current level */
export function xpProgress(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  const level = calculateLevel(totalXp);
  const currentLevelStartXp = (level - 1) * XP_PER_LEVEL;
  const currentLevelXp = totalXp - currentLevelStartXp;
  const nextLevelXp = XP_PER_LEVEL;

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progressPercent: Math.min((currentLevelXp / nextLevelXp) * 100, 100),
  };
}

/** XP reward multipliers */
export const XP_MULTIPLIERS = {
  /** Streak bonus: +10% per streak day (max 7 days) */
  streakBonus: (streakDays: number) =>
    1 + Math.min(streakDays, 7) * 0.1,
  /** Difficulty multiplier */
  difficulty: {
    novice: 1.0,
    apprentice: 1.5,
    adept: 2.0,
  } as const,
  /** Penalty for using hints: -10% per hint */
  hintPenalty: (hintsUsed: number) =>
    Math.max(0.7, 1 - hintsUsed * 0.1),
} as const;

/** Level titles that change as you progress */
export const LEVEL_TITLES: Record<number, string> = {
  1: "Apprentice",
  3: "Initiate",
  5: "Scribe",
  8: "Acolyte",
  12: "Mage",
  16: "Sorcerer",
  20: "Archmage",
  25: "Grand Wizard",
  30: "Legendary Coder",
};

export function getLevelTitle(level: number): string {
  const thresholds = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);
  for (const threshold of thresholds) {
    if (level >= threshold) return LEVEL_TITLES[threshold];
  }
  return "Apprentice";
}

// ============================================================
// Badge Definitions
// ============================================================

export const BADGES = [
  // Skill badges
  {
    slug: "first-spell",
    name: "First Spell",
    description: "Complete your first mission",
    icon: "✨",
    category: "milestone" as const,
    requirement: { type: "missions_completed" as const, count: 1 },
    xpBonus: 25,
  },
  {
    slug: "variable-master",
    name: "Variable Master",
    description: "Complete all missions in The Valley of Names",
    icon: "🏔️",
    category: "skill" as const,
    requirement: { type: "region_complete" as const, region: "variables" },
    xpBonus: 100,
  },
  {
    slug: "loop-lord",
    name: "Loop Lord",
    description: "Complete all missions in The Eternal Forge",
    icon: "🔥",
    category: "skill" as const,
    requirement: { type: "region_complete" as const, region: "loops" },
    xpBonus: 150,
  },
  {
    slug: "function-wizard",
    name: "Function Wizard",
    description: "Complete all missions in The Tower of Abstractions",
    icon: "🗼",
    category: "skill" as const,
    requirement: { type: "region_complete" as const, region: "functions" },
    xpBonus: 200,
  },
  // Streak badges
  {
    slug: "3-day-streak",
    name: "Consistent Caster",
    description: "Maintain a 3-day coding streak",
    icon: "🔥",
    category: "streak" as const,
    requirement: { type: "streak_days" as const, count: 3 },
    xpBonus: 50,
  },
  {
    slug: "7-day-streak",
    name: "Dedicated Mage",
    description: "Maintain a 7-day coding streak",
    icon: "⚡",
    category: "streak" as const,
    requirement: { type: "streak_days" as const, count: 7 },
    xpBonus: 100,
  },
  // Milestone badges
  {
    slug: "level-5",
    name: "Rising Star",
    description: "Reach Level 5",
    icon: "⭐",
    category: "milestone" as const,
    requirement: { type: "xp_total" as const, count: 1600 },
    xpBonus: 75,
  },
  {
    slug: "level-10",
    name: "Arcane Prodigy",
    description: "Reach Level 10",
    icon: "💫",
    category: "milestone" as const,
    requirement: { type: "xp_total" as const, count: 8100 },
    xpBonus: 200,
  },
] as const;

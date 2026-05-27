// ============================================================
// Region Metadata — the 3 MVP regions
// ============================================================

export const REGIONS = [
  {
    slug: "variables",
    name: "The Valley of Names",
    description: "Where all things receive their true names. Learn to store and wield data.",
    storyIntro:
      "In the beginning, the world was formless — a vast void of unnamed things. The first spell a coder must learn is the art of Naming. For to name a thing is to hold power over it...",
    icon: "mountain",
    color: "arcane" as const,
    unlockLevel: 1,
    sortOrder: 1,
    missionCount: 5,
    realm: "code",
  },
  {
    slug: "loops",
    name: "The Eternal Forge",
    description: "Where patterns repeat and power multiplies. Master the art of repetition.",
    storyIntro:
      "Beyond the Valley lies the Eternal Forge — a place where the same spell can be cast a thousand times in the blink of an eye. Here, you will learn to bend time itself...",
    icon: "flame",
    color: "ember" as const,
    unlockLevel: 3,
    sortOrder: 2,
    missionCount: 5,
    realm: "code",
  },
  {
    slug: "functions",
    name: "The Tower of Abstractions",
    description: "Where spells are bottled and reused. Create your own magical incantations.",
    storyIntro:
      "The Tower of Abstractions rises above the clouds. Within its walls, wizards learn to package their spells into reusable incantations — functions that can be summoned at will...",
    icon: "castle",
    color: "mana" as const,
    unlockLevel: 5,
    sortOrder: 3,
    missionCount: 5,
    realm: "code",
  },
  {
    slug: "html-keep",
    name: "The HTML Keep",
    description: "Master the basics of CSS drawing by replicating simple shapes.",
    storyIntro:
      "Welcome to the artist's studio inside the Keep. Here, your spells do not build walls; they paint shapes. Replicate the target shapes exactly to prove your worth as a CSS Artisan.",
    icon: "layout",
    color: "ember" as const,
    unlockLevel: 1,
    sortOrder: 1,
    missionCount: 5,
    realm: "creation",
  },
  {
    slug: "css-ramparts",
    name: "The CSS Ramparts",
    description: "Where structures gain beauty, color, and precise placement.",
    storyIntro:
      "A structure is nothing without style and position. Here on the Ramparts, you must learn CSS to position your defenses perfectly. Beware, arrows fly fast!",
    icon: "paintbrush",
    color: "arcane" as const,
    unlockLevel: 3,
    sortOrder: 2,
    missionCount: 5,
    realm: "creation",
  },
  {
    slug: "layout-labyrinth",
    name: "The Layout Labyrinth",
    description: "Master the art of Grid and Flexbox to command armies of elements.",
    storyIntro:
      "Deep within the Labyrinth, elements must align perfectly. You will learn the advanced layout spells to organize your UI elements effortlessly.",
    icon: "layout",
    color: "mana" as const,
    unlockLevel: 5,
    sortOrder: 3,
    missionCount: 0,
    realm: "creation",
  },
] as const;

export type RegionSlug = (typeof REGIONS)[number]["slug"];

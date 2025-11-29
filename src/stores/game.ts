import { writable, derived } from "svelte/store";
// import { prestigeBoost } from "./research"; // Removed import as it is now local

export const codingPoints = writable(0);
export const clickPower = writable(1);
export const pointsPerSecond = writable(0);
export const activeUsers = writable(0);
export const clickCount = writable(0);

// Research related stores
export const costDiscountMultiplier = writable(1.0);
export const unlockedFeatures = writable<Set<string>>(new Set());
export const prestigeBoost = writable(0); // Moved from derived in research.ts to writable here
export const ppsMultiplier = writable(1.0);
export const clickMultiplier = writable(1.0);
export const prestigeExponent = writable(0.5); // Base prestige exponent, can be increased by research

// Achievement system stores (persistent through prestige)
export const achievementMultiplier = writable(1.0); // Global production multiplier from achievements
export const unlockedAchievements = writable<Set<string>>(new Set()); // Set of unlocked achievement IDs

// IPO system stores (persistent through prestige AND IPO)
export const capital = writable(0); // Capital from IPO - most permanent currency

// Marketing system stores (persistent through prestige, reset on IPO)
export const marketingPpsBonus = writable(0); // Additive PPS bonus from marketing
export const marketingClickBonus = writable(0); // Additive click bonus from marketing
export const marketingPrestigeBonus = writable(0); // Multiplier for prestige gain

// Multipliers (derived or writable depending on complexity, starting simple)
export const prestigeMultiplier = derived(
  [activeUsers, prestigeBoost],
  ([$users, $boost]) => 1 + $users * 0.1 * ($boost + 1)
);

// Capital multiplier: x10 per capital (extremely powerful)
export const capitalMultiplier = derived(
  capital,
  ($capital) => 1 + $capital * 9 // 1 capital = x10, 2 capital = x19, etc.
);

// techPpsMultiplier might need to be in research store or here. Let's keep it simple for now.
// For now, let's just manage the base values here.

export const addPoints = (amount: number) => {
  codingPoints.update((n) => n + amount);
};

export const incrementClickCount = () => {
  clickCount.update((n) => n + 1);
};

export const resetGameData = () => {
  codingPoints.set(0);
  clickPower.set(1);
  pointsPerSecond.set(0);
  activeUsers.set(0);
  clickCount.set(0);
  // prestigeBoost is derived from research, so it resets when research resets
};

export const prestige = (earnedUsers: number) => {
  activeUsers.update((n) => n + earnedUsers);
  codingPoints.set(0);
  clickPower.set(1);
  pointsPerSecond.set(0);
  // Upgrades and research will be reset in their respective stores
};

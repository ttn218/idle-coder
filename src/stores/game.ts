import { writable, derived } from "svelte/store";
import { prestigeBoost } from "./research";

export const codingPoints = writable(0);
export const clickPower = writable(1);
export const pointsPerSecond = writable(0);
export const activeUsers = writable(0);
export const clickCount = writable(0);

// Multipliers (derived or writable depending on complexity, starting simple)
export const prestigeMultiplier = derived(
  [activeUsers, prestigeBoost],
  ([$users, $boost]) => 1 + $users * 0.1 * ($boost + 1)
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

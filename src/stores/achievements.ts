import { writable, get } from "svelte/store";
import { achievements as initialAchievements } from "../data/achievements";
import type { Achievement, GameState } from "../types";
import { codingPoints, clickCount, pointsPerSecond, activeUsers } from "./game";
import { upgrades } from "./upgrades";
import { researchedTechs } from "./research";
import { AchievementManager } from "../core/AchievementManager";

export const achievements = writable<Achievement[]>(initialAchievements);
export const notificationQueue = writable<Achievement[]>([]);

export const checkAchievements = () => {
  // Construct GameState from stores
  const state: GameState = {
    codingPoints: get(codingPoints),
    clickCount: get(clickCount),
    pointsPerSecond: get(pointsPerSecond),
    upgrades: get(upgrades),
    activeUsers: get(activeUsers),
    researchedTechs: get(researchedTechs),
  };

  // Use AchievementManager to check and unlock achievements with rewards
  const newlyUnlocked = AchievementManager.checkAll(state);

  // Add to notification queue
  if (newlyUnlocked.length > 0) {
    notificationQueue.update((q) => [...q, ...newlyUnlocked]);
  }
};

export const resetAchievements = () => {
  achievements.set(initialAchievements);
};

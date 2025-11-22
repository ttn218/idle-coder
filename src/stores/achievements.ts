import { writable, get } from "svelte/store";
import { achievements as initialAchievements } from "../data/achievements";
import type { Achievement, GameState } from "../types";
import { codingPoints, clickCount, pointsPerSecond, activeUsers } from "./game";
import { upgrades } from "./upgrades";
import { researchedTechs } from "./research";

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

  achievements.update((achs) => {
    return achs.map((ach) => {
      if (!ach.unlocked && ach.condition(state)) {
        notificationQueue.update((q) => [...q, ach]);
        return { ...ach, unlocked: true };
      }
      return ach;
    });
  });
};

export const resetAchievements = () => {
  achievements.set(initialAchievements);
};

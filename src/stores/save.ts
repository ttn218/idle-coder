import { get } from "svelte/store";
import {
  codingPoints,
  clickPower,
  pointsPerSecond,
  activeUsers,
  clickCount,
  resetGameData,
} from "./game";
import { upgrades, resetUpgrades } from "./upgrades";
import { researchedTechs, resetResearch } from "./research";
import { achievements, resetAchievements } from "./achievements";
import { shopItems } from "../data/shopItems";
import { achievements as initialAchievements } from "../data/achievements";

const SAVE_KEY = "idleCoderSave";

export const saveGame = () => {
  const saveData = {
    codingPoints: get(codingPoints),
    clickPower: get(clickPower),
    pointsPerSecond: get(pointsPerSecond),
    activeUsers: get(activeUsers),
    clickCount: get(clickCount),
    upgrades: get(upgrades),
    researchedTechs: get(researchedTechs),
    achievements: get(achievements).map((a) => ({
      id: a.id,
      unlocked: a.unlocked,
    })),
    lastSaveTime: Date.now(),
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  return true;
};

export const loadGame = () => {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);

      codingPoints.set(data.codingPoints || 0);
      clickPower.set(data.clickPower || 1);
      pointsPerSecond.set(data.pointsPerSecond || 0);
      activeUsers.set(data.activeUsers || 0);
      clickCount.set(data.clickCount || 0);

      if (data.researchedTechs) {
        researchedTechs.set(data.researchedTechs);
      }

      if (data.upgrades) {
        // Merge with initial to keep structure
        const mergedUpgrades = shopItems.map((initUpgrade) => {
          const savedUpgrade = data.upgrades.find(
            (u: any) => u.id === initUpgrade.id
          );
          return savedUpgrade
            ? { ...initUpgrade, level: savedUpgrade.level }
            : initUpgrade;
        });
        upgrades.set(mergedUpgrades);
      }

      if (data.achievements) {
        const mergedAchievements = initialAchievements.map((initAch) => {
          const savedAch = data.achievements.find(
            (a: any) => a.id === initAch.id
          );
          return savedAch
            ? { ...initAch, unlocked: savedAch.unlocked }
            : initAch;
        });
        achievements.set(mergedAchievements);
      }

      return data.lastSaveTime;
    } catch (e) {
      console.error("Failed to load save data", e);
    }
  }
  return null;
};

export const resetAllData = () => {
  localStorage.removeItem(SAVE_KEY);
  resetGameData();
  resetUpgrades();
  resetResearch();
  resetAchievements();
  location.reload();
};

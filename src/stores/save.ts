import { get } from "svelte/store";
import {
  codingPoints,
  clickPower,
  pointsPerSecond,
  activeUsers,
  clickCount,
  costDiscountMultiplier,
  unlockedFeatures,
  prestigeBoost,
  ppsMultiplier,
  clickMultiplier,
  prestigeExponent,
  achievementMultiplier,
  unlockedAchievements,
  capital,
  marketingPpsBonus,
  marketingClickBonus,
  marketingPrestigeBonus,
  resetGameData,
} from "./game";
import { upgrades, resetUpgrades } from "./upgrades";
import { marketingUpgrades } from "./marketing";
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
    costDiscountMultiplier: get(costDiscountMultiplier),
    unlockedFeatures: Array.from(get(unlockedFeatures)),
    prestigeBoost: get(prestigeBoost),
    ppsMultiplier: get(ppsMultiplier),
    clickMultiplier: get(clickMultiplier),
    prestigeExponent: get(prestigeExponent),
    achievementMultiplier: get(achievementMultiplier),
    unlockedAchievements: Array.from(get(unlockedAchievements)),
    capital: get(capital),
    marketingPpsBonus: get(marketingPpsBonus),
    marketingClickBonus: get(marketingClickBonus),
    marketingPrestigeBonus: get(marketingPrestigeBonus),
    marketingUpgrades: get(marketingUpgrades),
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

      // Load new research stores
      if (data.costDiscountMultiplier)
        costDiscountMultiplier.set(data.costDiscountMultiplier);
      if (data.unlockedFeatures)
        unlockedFeatures.set(new Set(data.unlockedFeatures));
      if (data.prestigeBoost) prestigeBoost.set(data.prestigeBoost);
      if (data.ppsMultiplier) ppsMultiplier.set(data.ppsMultiplier);
      if (data.clickMultiplier) clickMultiplier.set(data.clickMultiplier);
      if (data.prestigeExponent) prestigeExponent.set(data.prestigeExponent);

      // Load achievement stores (persistent through prestige)
      if (data.achievementMultiplier)
        achievementMultiplier.set(data.achievementMultiplier);
      if (data.unlockedAchievements)
        unlockedAchievements.set(new Set(data.unlockedAchievements));

      // Load capital and marketing stores
      if (data.capital !== undefined) capital.set(data.capital);
      if (data.marketingPpsBonus !== undefined)
        marketingPpsBonus.set(data.marketingPpsBonus);
      if (data.marketingClickBonus !== undefined)
        marketingClickBonus.set(data.marketingClickBonus);
      if (data.marketingPrestigeBonus !== undefined)
        marketingPrestigeBonus.set(data.marketingPrestigeBonus);

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

      if (data.marketingUpgrades) {
        marketingUpgrades.set(data.marketingUpgrades);
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

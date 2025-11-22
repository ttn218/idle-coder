import { get } from "svelte/store";
import {
  codingPoints,
  clickPower,
  pointsPerSecond,
  activeUsers,
  clickCount,
  prestigeMultiplier,
  prestigeBoost,
  costDiscountMultiplier,
  unlockedFeatures,
  ppsMultiplier,
  clickMultiplier,
} from "../stores/game";
import { researchedTechs, addTech, resetResearch } from "../stores/research";
import { upgrades, resetUpgrades, buyUpgrade } from "../stores/upgrades";
import {
  achievements,
  checkAchievements,
  resetAchievements,
} from "../stores/achievements";
import { saveGame, loadGame, resetAllData } from "../stores/save";
import { SoundManager } from "../lib/audio";
import { researchItems } from "../data/researchItems";
import { ResearchManager } from "./ResearchManager";
import { formatNumber } from "../lib/utils";
// Wait, addPoints was in game.ts?
// Let's check game.ts exports.
// game.ts exports: codingPoints, clickPower, pointsPerSecond, activeUsers, clickCount, costDiscountMultiplier, unlockedFeatures, prestigeBoost, ppsMultiplier, clickMultiplier, prestigeMultiplier.
// It does NOT export addPoints.
// I should implement addPoints helper or just update store.

export class GameController {
  private static autoClickInterval: number;
  private static saveInterval: number;

  static handleUserCodeInput() {
    // clickPower in store is the base power.
    // clickMultiplier is the global multiplier.
    // We should multiply them.
    const power = get(clickPower) * get(clickMultiplier);

    codingPoints.update((n) => n + power);
    clickCount.update((n) => n + 1);
    SoundManager.getInstance().playTypingSound();
    checkAchievements();
  }

  static purchaseItem(itemId: string, quantity: number = 1) {
    buyUpgrade(itemId, quantity);
    checkAchievements();
  }

  static purchaseResearch(techId: string) {
    const tech = researchItems.find((t) => t.id === techId);
    if (!tech) return;

    const currentResearched = get(researchedTechs);
    if (currentResearched.includes(techId)) return;

    const currentPoints = get(codingPoints);
    const currentUsers = get(activeUsers);

    // Calculate costs with discount
    const discount = get(costDiscountMultiplier);
    const pointCost = (tech.costs.points || 0) * discount;
    const userCost = tech.costs.users || 0;

    if (currentPoints >= pointCost && currentUsers >= userCost) {
      if (pointCost > 0) codingPoints.update((n) => n - pointCost);
      if (userCost > 0) activeUsers.update((n) => n - userCost);

      addTech(techId);

      // Apply effects via ResearchManager
      ResearchManager.purchase(tech);

      checkAchievements();
    }
  }

  static triggerPrestige() {
    const currentPoints = get(codingPoints);
    if (currentPoints < 10000) return null;

    // Calculate pending users based on current logic
    const techs = get(researchedTechs);
    const prestigeExponent = techs.includes("viral_marketing") ? 0.6 : 0.5;
    const pendingUsers = Math.floor(
      Math.pow(currentPoints / 1000, prestigeExponent)
    );

    if (
      confirm(
        `서비스를 오픈하시겠습니까?\n현재 데이터를 초기화하고 ${formatNumber(
          pendingUsers
        )}명의 유저를 확보합니다.`
      )
    ) {
      // Apply prestige
      // We need to reset game data but keep activeUsers + pendingUsers
      // And reset upgrades, research, achievements.

      // Reset stores
      codingPoints.set(0);
      clickPower.set(1);
      pointsPerSecond.set(0);
      clickCount.set(0);

      // Update users
      activeUsers.update((n) => n + pendingUsers);

      // Reset others
      // Reset others
      resetUpgrades();
      resetResearch();
      resetAchievements();

      // Reset multipliers
      costDiscountMultiplier.set(1.0);
      unlockedFeatures.set(new Set());
      prestigeBoost.set(0);
      ppsMultiplier.set(1.0);
      clickMultiplier.set(1.0);

      saveGame();
      checkAchievements();
      return pendingUsers;
    }
    return null;
  }

  static startGameLoop() {
    // Load game data
    loadGame();

    // Auto-click / PPS loop
    this.autoClickInterval = setInterval(() => {
      const pps = get(pointsPerSecond); // This is base PPS from upgrades?
      // Wait, in upgrades.ts: pointsPerSecond.update(n => n + value).
      // So pointsPerSecond IS the total PPS from upgrades.
      // We need to apply ppsMultiplier.

      const multiplier = get(ppsMultiplier);
      const prestigeMult = get(prestigeMultiplier);

      const finalPPS = pps * multiplier * prestigeMult;

      if (finalPPS > 0) {
        codingPoints.update((n) => n + finalPPS / 10);
        checkAchievements();
      }
    }, 100);

    // Auto-save loop
    this.saveInterval = setInterval(() => {
      saveGame();
    }, 10000);
  }

  static stopGameLoop() {
    if (this.autoClickInterval) clearInterval(this.autoClickInterval);
    if (this.saveInterval) clearInterval(this.saveInterval);
  }

  static handleSave() {
    return saveGame();
  }

  static handleReset() {
    if (confirm("정말 초기화 하시겠습니까? 모든 진행 상황이 사라집니다.")) {
      resetAllData();
    }
  }
}

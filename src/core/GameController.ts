import { get } from "svelte/store";
import {
  codingPoints,
  clickPower,
  pointsPerSecond,
  activeUsers,
  prestigeMultiplier,
  addPoints,
  incrementClickCount,
  prestige,
} from "../stores/game";
import { upgrades, buyUpgrade, resetUpgrades } from "../stores/upgrades";
import {
  researchedTechs,
  addTech,
  resetResearch,
  costMultiplier,
  techPpsMultiplier,
  clickMultiplier,
} from "../stores/research";
import {
  achievements,
  checkAchievements,
  resetAchievements,
} from "../stores/achievements";
import { saveGame, loadGame, resetAllData } from "../stores/save";
import { SoundManager } from "../lib/audio";
import {
  getPrice,
  getSumPrice,
  getMaxBuyable,
  formatNumber,
} from "../lib/utils";
import { researchItems } from "../data/researchItems";
import type { Upgrade, Tech } from "../types";

export class GameController {
  private static autoClickInterval: number;
  private static saveInterval: number;

  static handleUserCodeInput() {
    const currentClickPower = get(clickPower);
    const currentPrestigeMultiplier = get(prestigeMultiplier);
    const currentClickMultiplier = get(clickMultiplier);

    const points =
      currentClickPower * currentPrestigeMultiplier * currentClickMultiplier;

    addPoints(points);
    incrementClickCount();
    checkAchievements();

    SoundManager.getInstance().playTypingSound();
  }

  static purchaseItem(
    upgrade: Upgrade & { buyCount: number; currentCost: number }
  ) {
    if (upgrade.buyCount > 0 && get(codingPoints) >= upgrade.currentCost) {
      buyUpgrade(upgrade.id, upgrade.buyCount);
      checkAchievements();
    }
  }

  static purchaseResearch(techId: string) {
    const tech = researchItems.find((t) => t.id === techId);
    if (!tech) return;

    const currentResearched = get(researchedTechs);
    if (currentResearched.includes(techId)) return;

    // Check costs
    const currentPoints = get(codingPoints);
    const currentUsers = get(activeUsers);

    if (tech.costs.points && currentPoints < tech.costs.points) return;
    if (tech.costs.users && currentUsers < tech.costs.users) return;

    // Deduct costs
    if (tech.costs.points) {
      addPoints(-tech.costs.points);
    }
    if (tech.costs.users) {
      activeUsers.update((n) => n - (tech.costs.users || 0));
    }

    // Unlock tech
    addTech(techId);

    // Apply immediate effects - prestigeBoost is now derived automatically

    checkAchievements();
  }

  static triggerPrestige() {
    const currentPoints = get(codingPoints);
    if (currentPoints < 10000) return null;

    // Calculate pending users based on current logic (simplified here, ideally should be shared or in store)
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
      prestige(pendingUsers);

      resetUpgrades();
      resetResearch();
      resetAchievements();

      saveGame();
      checkAchievements();
      return pendingUsers; // Return for UI message
    }
    return null;
  }

  static startGameLoop() {
    // Load game data
    loadGame();

    // Auto-click / PPS loop
    this.autoClickInterval = setInterval(() => {
      const pps = get(pointsPerSecond);
      if (pps > 0) {
        const currentPrestigeMultiplier = get(prestigeMultiplier);
        const currentTechPpsMultiplier = get(techPpsMultiplier);

        const points =
          pps * currentPrestigeMultiplier * currentTechPpsMultiplier;
        addPoints(points);
        checkAchievements();
      }
    }, 1000);

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
      // Reload window to reflect clean state is often safest, but we can also just reset stores
      // For now, let's rely on store resets.
    }
  }
}

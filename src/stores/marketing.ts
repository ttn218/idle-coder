import { writable, get } from "svelte/store";
import { marketingUpgrades as initialMarketing } from "../data/marketingUpgrades";
import {
  activeUsers,
  marketingPpsBonus,
  marketingClickBonus,
  marketingPrestigeBonus,
  costDiscountMultiplier,
} from "./game";
import { getPrice } from "../lib/utils";
import type { Upgrade } from "../types";

export const marketingUpgrades = writable<Upgrade[]>(initialMarketing);

export const buyMarketing = (upgradeId: string, quantity: number = 1) => {
  const allUpgrades = get(marketingUpgrades);
  const upgradeIndex = allUpgrades.findIndex((u) => u.id === upgradeId);
  const upgrade = allUpgrades[upgradeIndex];

  if (!upgrade || quantity <= 0) return;

  // Calculate total cost for the quantity (paid in activeUsers)
  let totalCost = 0;
  for (let i = 0; i < quantity; i++) {
    totalCost += getPrice(upgrade.basePrice, upgrade.level + i);
  }

  if (get(activeUsers) >= totalCost) {
    // Deduct from activeUsers instead of codingPoints
    activeUsers.update((n) => n - totalCost);

    // Increase level
    marketingUpgrades.update((items) => {
      const newItems = [...items];
      newItems[upgradeIndex].level += quantity;
      return newItems;
    });

    // Apply effect for each purchase
    const totalEffect = upgrade.effectValue * quantity;

    switch (upgrade.id) {
      case "online_ads":
      case "tv_commercial":
        // PPS bonus (additive)
        marketingPpsBonus.update((n) => n + totalEffect);
        break;
      case "influencer_collab":
        // Click bonus (additive)
        marketingClickBonus.update((n) => n + totalEffect);
        break;
      case "brand_ambassador":
        // Prestige bonus (additive multiplier)
        marketingPrestigeBonus.update((n) => n + totalEffect);
        break;
      case "growth_hacking":
        // Cost discount (multiplicative, capped at 0.9)
        costDiscountMultiplier.update((current) => {
          const newDiscount = current * (1 - upgrade.effectValue);
          return Math.max(newDiscount, 0.1); // Cap at 90% discount (0.1 = 10% of original cost)
        });
        break;
    }
  }
};

export const resetMarketing = () => {
  marketingUpgrades.set(initialMarketing.map((u) => ({ ...u, level: 0 })));
  marketingPpsBonus.set(0);
  marketingClickBonus.set(0);
  marketingPrestigeBonus.set(0);
  // Note: costDiscountMultiplier is reset in GameController prestige logic
};

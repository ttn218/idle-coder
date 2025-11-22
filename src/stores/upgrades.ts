import { writable, get } from "svelte/store";
import { shopItems } from "../data/shopItems";
import { codingPoints, clickPower, pointsPerSecond } from "./game";
import type { Upgrade } from "../types";

export const upgrades = writable<Upgrade[]>(shopItems);

import { costMultiplier } from "./research";

// Helper functions for price calculation
function getSumPrice(
  basePrice: number,
  level: number,
  count: number,
  multiplier: number
): number {
  const currentBasePrice = basePrice * Math.pow(1.5, level) * multiplier;
  if (count === 1) return currentBasePrice;
  return (currentBasePrice * (Math.pow(1.5, count) - 1)) / (1.5 - 1);
}

export const buyUpgrade = (upgradeId: string, amount: number) => {
  const currentUpgrades = get(upgrades);
  const index = currentUpgrades.findIndex((u) => u.id === upgradeId);

  if (index === -1) return;

  const upgrade = currentUpgrades[index];
  const currentMultiplier = get(costMultiplier);

  // Calculate cost
  const cost = Math.floor(
    getSumPrice(upgrade.basePrice, upgrade.level, amount, currentMultiplier)
  );

  // Check affordability
  const currentPoints = get(codingPoints);
  if (currentPoints < cost) return;

  // Deduct points
  codingPoints.update((n) => n - cost);

  // Update upgrade level
  upgrades.update((items) => {
    const item = items[index];
    item.level += amount;
    return [...items];
  });

  // Apply effects
  if (upgrade.type === "click") {
    clickPower.update((n) => n + upgrade.effectValue * amount);
  } else if (upgrade.type === "auto") {
    pointsPerSecond.update((n) => n + upgrade.effectValue * amount);
  }
};

export const resetUpgrades = () => {
  upgrades.set(shopItems.map((u) => ({ ...u, level: 0 })));
};

import { writable, get } from "svelte/store";
import { shopItems } from "../data/shopItems";
import {
  codingPoints,
  clickPower,
  pointsPerSecond,
  costDiscountMultiplier,
} from "./game";
import { getPrice } from "../lib/utils";
import type { Upgrade } from "../types";

export const upgrades = writable<Upgrade[]>(shopItems);

export const buyUpgrade = (upgradeId: string, quantity: number = 1) => {
  const allUpgrades = get(upgrades);
  const upgradeIndex = allUpgrades.findIndex((u) => u.id === upgradeId);
  const upgrade = allUpgrades[upgradeIndex];

  if (!upgrade || quantity <= 0) return;

  const discount = get(costDiscountMultiplier);

  // Calculate total cost for the quantity
  let totalCost = 0;
  for (let i = 0; i < quantity; i++) {
    totalCost += getPrice(upgrade.basePrice, upgrade.level + i) * discount;
  }

  if (get(codingPoints) >= totalCost) {
    codingPoints.update((n) => n - totalCost);
    upgrades.update((items) => {
      const newItems = [...items];
      newItems[upgradeIndex].level += quantity;
      return newItems;
    });

    // Apply effect for each purchase
    const totalEffect = upgrade.effectValue * quantity;
    if (upgrade.type === "click") {
      clickPower.update((n) => n + totalEffect);
    } else if (upgrade.type === "auto") {
      pointsPerSecond.update((n) => n + totalEffect);
    }
  }
};

export const resetUpgrades = () => {
  upgrades.set(shopItems.map((u) => ({ ...u, level: 0 })));
};

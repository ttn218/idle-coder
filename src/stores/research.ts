import { writable, get } from "svelte/store";
import { researchItems } from "../data/researchItems";
import { codingPoints, activeUsers, prestigeMultiplier } from "./game";
import type { Tech } from "../types";

export const researchedTechs = writable<string[]>([]);

// Derived store for checking if a tech is unlocked could be useful,
// but for now let's keep it simple.

export const research = (techId: string) => {
  const tech = researchItems.find((t) => t.id === techId);
  if (!tech) return;

  const currentPoints = get(codingPoints);
  const currentUsers = get(activeUsers);
  const currentResearched = get(researchedTechs);

  if (currentResearched.includes(techId)) return;

  // Check cost
  if (tech.currency === "users") {
    if (currentUsers < tech.cost) return;
    activeUsers.update((n) => n - tech.cost);
  } else {
    if (currentPoints < tech.cost) return;
    codingPoints.update((n) => n - tech.cost);
  }

  researchedTechs.update((t) => [...t, techId]);

  // Apply effects
  // Note: Some effects like 'loop' (auto click) or 'function' (discount)
  // might need to be handled by derived stores or subscriptions in other stores.
  // 'prestige' effect needs to update the multiplier.

  if (tech.effect.type === "prestige" && tech.effect.value) {
    // This is tricky because prestigeMultiplier is derived in game.ts
    // We might need to move prestigeMultiplier to be writable or
    // have a separate 'prestigeBonus' store.
    // For now, let's assume game.ts handles the base multiplier
    // and we might need another store for research bonuses.
  }
};

export const resetResearch = () => {
  researchedTechs.set([]);
};

// Derived stores for tech effects
import { derived } from "svelte/store";

export const techEffects = derived(researchedTechs, ($researchedTechs) => {
  return $researchedTechs.reduce(
    (acc, techId) => {
      const tech = researchItems.find((t) => t.id === techId);
      if (tech && tech.effect) {
        switch (tech.effect.type) {
          case "loop":
            acc.autoClick = true;
            break;
          case "function":
            acc.costDiscount *= 1 - (tech.effect.value || 0);
            break;
          case "oop":
            acc.ppsMultiplier *= tech.effect.value ? 1 + tech.effect.value : 2;
            break;
        }
      }
      return acc;
    },
    { clickMultiplier: 1, ppsMultiplier: 1, costDiscount: 1, autoClick: false }
  );
});

export const costMultiplier = derived(
  techEffects,
  ($effects) => $effects.costDiscount
);
export const techPpsMultiplier = derived(
  techEffects,
  ($effects) => $effects.ppsMultiplier
);
export const clickMultiplier = derived(
  techEffects,
  ($effects) => $effects.clickMultiplier
);

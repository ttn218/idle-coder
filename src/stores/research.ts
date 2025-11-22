import { writable, derived } from "svelte/store";
import { researchItems } from "../data/researchItems";
import type { Tech } from "../types";

export const researchedTechs = writable<string[]>([]);

// Derived store for checking if a tech is unlocked could be useful,
// but for now let's keep it simple.

export const addTech = (techId: string) => {
  researchedTechs.update((t) => {
    if (t.includes(techId)) return t;
    return [...t, techId];
  });
};

export const resetResearch = () => {
  researchedTechs.set([]);
};

// Derived stores for tech effects
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
          case "prestigeBoost":
            acc.prestigeBoost += tech.effect.value || 0;
            break;
        }
      }
      return acc;
    },
    {
      clickMultiplier: 1,
      ppsMultiplier: 1,
      costDiscount: 1,
      autoClick: false,
      prestigeBoost: 0,
    }
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
export const prestigeBoost = derived(
  techEffects,
  ($effects) => $effects.prestigeBoost
);

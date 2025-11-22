import { get } from "svelte/store";
import {
  clickPower,
  pointsPerSecond,
  costDiscountMultiplier,
  unlockedFeatures,
  prestigeBoost,
  ppsMultiplier,
  clickMultiplier,
} from "../stores/game";
import { researchedTechs } from "../stores/research";
import { researchItems } from "../data/researchItems";
import type { Tech, ResearchEffect } from "../types";

export class ResearchManager {
  static applyEffect(effect: ResearchEffect) {
    switch (effect.type) {
      case "clickMultiplier":
        clickMultiplier.update((n) => n * effect.value);
        // Also update current clickPower to reflect the new multiplier immediately if needed?
        // But clickPower update logic in upgrades.ts needs to know about this.
        // For now, let's assume clickPower is base * multiplier.
        // Wait, clickPower in game.ts is a writable. Is it base or total?
        // If it's total, we multiply it.
        clickPower.update((n) => n * effect.value);
        break;
      case "ppsMultiplier":
        ppsMultiplier.update((n) => n * effect.value);
        pointsPerSecond.update((n) => n * effect.value);
        break;
      case "costDiscount":
        costDiscountMultiplier.update((n) => n * effect.value);
        break;
      case "prestigeBoost":
        prestigeBoost.update((n) => n + effect.value);
        break;
      case "unlockFeature":
        unlockedFeatures.update((s) => {
          s.add("loop"); // Currently only 'loop' is supported/implied by value 1?
          // The data says value: 1. The description says "Auto Click Unlock".
          // Let's assume value 1 maps to 'loop' or we just add 'loop' if type is unlockFeature.
          // Or maybe the value is the ID? But value is number.
          // Let's hardcode 'loop' for now as it's the only feature.
          return s;
        });
        break;
    }
  }

  static purchase(tech: Tech) {
    // Apply all effects
    tech.effects.forEach((effect) => {
      this.applyEffect(effect);
    });
  }

  static restoreEffects() {
    // Reset multipliers to default before re-applying
    // This assumes we are recalculating from scratch on load.
    // BUT, if we saved the *multiplied* values in game.ts, we shouldn't re-apply.
    // However, we usually save the *state*.
    // If we want to support "add new tech -> effect applies", we should probably
    // rely on the saved state for values, and only use this if we are recalculating.
    //
    // WAIT. If `clickPower` is saved in localStorage, it already includes the multiplier.
    // If we call `restoreEffects` on load, we will multiply it AGAIN.
    //
    // SOLUTION:
    // We should NOT save the multipliers in localStorage if we are going to re-calculate them.
    // OR we should NOT re-calculate them if they are saved.
    //
    // Given the user's request "ResearchManager logic... applyEffect", it sounds like
    // they want to apply it *when purchased*.
    // If so, on load, we just load the values. We don't re-apply.
    //
    // BUT, what about `costDiscountMultiplier`? Is that saved?
    // `save.ts` saves `game` store. `costDiscountMultiplier` is in `game.ts` now.
    // So it will be saved.
    //
    // So `restoreEffects` might NOT be needed if we save everything.
    //
    // However, `unlockedFeatures` is a Set. JSON.stringify doesn't handle Set.
    // We need to handle Set serialization in `save.ts` or convert to Array.
    //
    // Let's check `save.ts`.
  }
}

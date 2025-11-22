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

// Derived stores for tech effects - REMOVED in favor of ResearchManager
// Logic is now handled imperatively in ResearchManager.ts
// We keep researchedTechs as the source of truth.

export const resetResearch = () => {
  researchedTechs.set([]);
};

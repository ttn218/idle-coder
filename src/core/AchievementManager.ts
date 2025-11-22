import { get } from "svelte/store";
import { achievements } from "../data/achievements";
import { achievements as achievementsStore } from "../stores/achievements";
import { achievementMultiplier, unlockedAchievements } from "../stores/game";
import type { Achievement, GameState } from "../types";

export class AchievementManager {
  /**
   * Apply reward from an achievement
   */
  static applyReward(achievement: Achievement) {
    if (!achievement.reward) return;

    switch (achievement.reward.type) {
      case "globalMultiplier":
        // Stack multiplicatively: new = old * (1 + bonus)
        achievementMultiplier.update(
          (current) => current * (1 + achievement.reward!.value)
        );
        break;
    }

    // Add to unlocked set
    unlockedAchievements.update((set) => {
      set.add(achievement.id);
      return set;
    });
  }

  /**
   * Check achievement conditions and unlock if met
   * Returns newly unlocked achievement for notification
   */
  static checkAndUnlock(state: GameState): Achievement | null {
    const unlocked = get(unlockedAchievements);
    const allAchievements = get(achievementsStore);

    for (const achievement of allAchievements) {
      // Skip already unlocked or already marked as unlocked in store
      if (achievement.unlocked || unlocked.has(achievement.id)) continue;

      // Check condition
      if (achievement.condition(state)) {
        // Update achievement store to mark as unlocked
        achievementsStore.update((list) =>
          list.map((a) =>
            a.id === achievement.id ? { ...a, unlocked: true } : a
          )
        );

        // Apply reward
        this.applyReward(achievement);

        // Return for notification
        return achievement;
      }
    }

    return null;
  }

  /**
   * Check all achievements and unlock any that meet conditions
   * Can unlock multiple achievements at once
   */
  static checkAll(state: GameState): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    let achievement: Achievement | null;

    // Keep checking until no more achievements unlock
    while ((achievement = this.checkAndUnlock(state)) !== null) {
      newlyUnlocked.push(achievement);
    }

    return newlyUnlocked;
  }
}

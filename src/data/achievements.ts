import type { Achievement, GameState } from "../types";

export const achievements: Achievement[] = [
  {
    id: "hello_world",
    name: "Hello World",
    description: "Reach 100 Coding Points",
    condition: (state: GameState) => state.codingPoints >= 100,
    unlocked: false,
  },
  {
    id: "script_kiddie",
    name: "Script Kiddie",
    description: "Reach 1,000 Coding Points",
    condition: (state: GameState) => state.codingPoints >= 1000,
    unlocked: false,
  },
  {
    id: "keyboard_warrior",
    name: "Keyboard Warrior",
    description: "Click 100 times manually",
    condition: (state: GameState) => state.clickCount >= 100,
    unlocked: false,
  },
  {
    id: "automation_era",
    name: "Automation Era",
    description: "Reach 10 Points Per Second (PPS)",
    condition: (state: GameState) => state.pointsPerSecond >= 10,
    unlocked: false,
  },
  {
    id: "first_hire",
    name: "First Hire",
    description: "Buy your first upgrade",
    condition: (state: GameState) => state.upgrades.some((u) => u.level > 0),
    unlocked: false,
  },
  {
    id: "startup_founder",
    name: "Startup Founder",
    description: "Perform your first Service Release (Prestige)",
    condition: (state: GameState) => state.activeUsers > 0,
    unlocked: false,
  },
];

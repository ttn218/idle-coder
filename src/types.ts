export interface Upgrade {
  id: string;
  name: string;
  type: "click" | "auto";
  category: "Hardware" | "Software" | "Personnel" | "Buff";
  basePrice: number;
  level: number;
  effectValue: number;
  description: string;
}

export interface Tech {
  id: string;
  name: string;
  description: string;
  req?: string; // Prerequisite tech ID
  effect: {
    type: "loop" | "function" | "oop" | "prestige" | "prestigeBoost";
    value?: number;
  };
  x: number;
  y: number;
  costs: {
    points?: number;
    users?: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (state: GameState) => boolean;
  unlocked: boolean;
}

export interface GameState {
  codingPoints: number;
  clickCount: number;
  pointsPerSecond: number;
  upgrades: Upgrade[];
  activeUsers: number;
  researchedTechs: string[];
}

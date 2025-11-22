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
  cost: number;
  description: string;
  req?: string; // Prerequisite tech ID
  effect: {
    type: "loop" | "function" | "oop" | "prestige";
    value?: number;
  };
  x: number;
  y: number;
  currency?: "points" | "users"; // Default is 'points'
}

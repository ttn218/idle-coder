import type { Achievement, GameState } from "../types";

export const achievements: Achievement[] = [
  // =================================================================
  // [Points] 코딩 포인트
  // =================================================================
  {
    id: "hello_world",
    name: "헬로 월드 (Hello World)",
    description: "코딩 포인트 100점 달성",
    condition: (state: GameState) => state.codingPoints >= 100,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.01, text: "모든 생산량 +1%" },
  },
  {
    id: "script_kiddie",
    name: "스크립트 키디 (Script Kiddie)",
    description: "코딩 포인트 1,000점 달성",
    condition: (state: GameState) => state.codingPoints >= 1000,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.02, text: "모든 생산량 +2%" },
  },
  {
    id: "freelancer",
    name: "프리랜서 (Freelancer)",
    description: "코딩 포인트 50,000점 달성",
    condition: (state: GameState) => state.codingPoints >= 50000,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.05, text: "모든 생산량 +5%" },
  },
  {
    id: "millionaire",
    name: "IT 백만장자 (IT Millionaire)",
    description: "코딩 포인트 1M 달성",
    condition: (state: GameState) => state.codingPoints >= 1000000,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.1, text: "모든 생산량 +10%" },
  },
  {
    id: "unicorn",
    name: "유니콘 기업 (Unicorn Startup)",
    description: "코딩 포인트 1B 달성",
    condition: (state: GameState) => state.codingPoints >= 1000000000,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.2, text: "모든 생산량 +20%" },
  },
  {
    id: "big_tech",
    name: "빅테크 기업 (Big Tech Giant)",
    description: "코딩 포인트 1T 달성",
    condition: (state: GameState) => state.codingPoints >= 1000000000000,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.5, text: "모든 생산량 +50%" },
  },

  // =================================================================
  // [Clicks] 수동 입력
  // =================================================================
  {
    id: "finger_warmup",
    name: "손가락 풀기",
    description: "직접 타이핑 100회 달성",
    condition: (state: GameState) => state.clickCount >= 100,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.01, text: "모든 생산량 +1%" },
  },
  {
    id: "keyboard_warrior",
    name: "키보드 워리어 (Keyboard Warrior)",
    description: "직접 타이핑 1,000회 달성",
    condition: (state: GameState) => state.clickCount >= 1000,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.03, text: "모든 생산량 +3%" },
  },
  {
    id: "carpal_tunnel",
    name: "손목 터널 증후군 (Carpal Tunnel)",
    description: "직접 타이핑 10,000회 달성",
    condition: (state: GameState) => state.clickCount >= 10000,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.05, text: "모든 생산량 +5%" },
  },

  // =================================================================
  // [PPS] 자동화 생산성
  // =================================================================
  {
    id: "automation_era",
    name: "자동화의 시대 (Automation Era)",
    description: "초당 포인트(PPS) 10 달성",
    condition: (state: GameState) => state.pointsPerSecond >= 10,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.02, text: "모든 생산량 +2%" },
  },
  {
    id: "traffic_spike",
    name: "트래픽 폭주 (Traffic Spike)",
    description: "초당 포인트(PPS) 500 달성",
    condition: (state: GameState) => state.pointsPerSecond >= 500,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.05, text: "모든 생산량 +5%" },
  },
  {
    id: "web_scale",
    name: "웹 스케일 (Web Scale)",
    description: "초당 포인트(PPS) 10k 달성",
    condition: (state: GameState) => state.pointsPerSecond >= 10000,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.1, text: "모든 생산량 +10%" },
  },
  {
    id: "singularity",
    name: "특이점 (Singularity)",
    description: "초당 포인트(PPS) 1M 달성",
    condition: (state: GameState) => state.pointsPerSecond >= 1000000,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.25, text: "모든 생산량 +25%" },
  },

  // =================================================================
  // [Progress] 게임 진행
  // =================================================================
  {
    id: "first_hire",
    name: "첫 채용 (First Hire)",
    description: "상점에서 첫 업그레이드 구매",
    condition: (state: GameState) => state.upgrades.some((u) => u.level > 0),
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.01, text: "모든 생산량 +1%" },
  },
  {
    id: "researcher",
    name: "연구원 (Researcher)",
    description: "첫 기술 연구 완료",
    condition: (state: GameState) => state.researchedTechs.length > 0,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.02, text: "모든 생산량 +2%" },
  },
  {
    id: "full_stack_master",
    name: "풀스택 마스터 (Full Stack Master)",
    description: "'Full Stack Development' 연구 완료",
    condition: (state: GameState) =>
      state.researchedTechs.includes("fullstack"),
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.1, text: "모든 생산량 +10%" },
  },
  {
    id: "startup_founder",
    name: "스타트업 창업 (Startup Founder)",
    description: "첫 서비스 릴리즈(환생) 수행",
    condition: (state: GameState) => state.activeUsers > 0,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.1, text: "모든 생산량 +10%" },
  },
  {
    id: "viral_sensation",
    name: "바이럴 센세이션 (Viral Sensation)",
    description: "활성 유저 100명 확보",
    condition: (state: GameState) => state.activeUsers >= 100,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.15, text: "모든 생산량 +15%" },
  },
  {
    id: "global_platform",
    name: "글로벌 플랫폼 (Global Platform)",
    description: "활성 유저 10,000명 확보",
    condition: (state: GameState) => state.activeUsers >= 10000,
    unlocked: false,
    reward: { type: "globalMultiplier", value: 0.3, text: "모든 생산량 +30%" },
  },
];

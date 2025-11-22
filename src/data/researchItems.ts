import type { Tech } from "../types";

export const researchItems: Tech[] = [
  // =================================================================
  // [Tier 0] Root: 시작점
  // =================================================================
  {
    id: "syntax",
    name: "기초 문법 (Basic Syntax)",
    description: "모든 위대한 소프트웨어는 'Hello World'에서 시작됩니다.",
    effects: [{ type: "clickMultiplier", value: 1.5 }], // 클릭 효율 1.5배
    x: 400,
    y: 50,
    costs: { points: 50 },
  },

  // =================================================================
  // [Tier 1] 제어문 & 로직 (좌: 자동화 / 우: 효율)
  // =================================================================
  {
    id: "loop",
    name: "무한 루프 (Infinite Loop)",
    description:
      "키를 누르고 있으면 자동으로 코드가 작성됩니다. (오토 클릭 해금)",
    req: "syntax",
    effects: [{ type: "unlockFeature", value: 1 }], // value 1 = Auto Click Unlock
    x: 250,
    y: 150,
    costs: { points: 300 },
  },
  {
    id: "conditional",
    name: "조건문 (If/Else)",
    description: "상황에 맞는 코드를 작성하여 효율을 높입니다.",
    req: "syntax",
    effects: [{ type: "ppsMultiplier", value: 1.2 }], // PPS 20% 증가
    x: 550,
    y: 150,
    costs: { points: 300 },
  },

  // =================================================================
  // [Tier 2] 구조화 & 함수 (좌: 비용절감 / 우: 화력증가)
  // =================================================================
  {
    id: "function",
    name: "모듈화 함수 (Modular Functions)",
    description: "코드 재사용성을 높여 업그레이드 비용을 절감합니다.",
    req: "loop",
    effects: [{ type: "costDiscount", value: 0.9 }], // 비용 10% 할인
    x: 250,
    y: 300,
    costs: { points: 1500 },
  },
  {
    id: "data_structure",
    name: "자료구조 (Data Structures)",
    description: "데이터를 효율적으로 관리하여 클릭 효율을 극대화합니다.",
    req: "conditional",
    effects: [{ type: "clickMultiplier", value: 2.0 }], // 클릭 효율 2배
    x: 550,
    y: 300,
    costs: { points: 2000 },
  },

  // =================================================================
  // [Tier 3] 패러다임 (중앙 집중형 강력한 버프)
  // =================================================================
  {
    id: "oop",
    name: "객체 지향 프로그래밍 (OOP)",
    description: "객체 간의 상호작용을 설계합니다. 모든 생산성이 2배가 됩니다.",
    req: "function", // 선행 조건 (좌측 트리에서 옴)
    effects: [{ type: "ppsMultiplier", value: 2.0 }], // PPS 2배
    x: 400,
    y: 450,
    costs: { points: 10000 },
  },

  // =================================================================
  // [Tier 4] 고급 기술 & 아키텍처
  // =================================================================
  {
    id: "async",
    name: "비동기 처리 (Async/Await)",
    description: "논블로킹 I/O를 통해 더 많은 작업을 동시에 처리합니다.",
    req: "oop",
    effects: [{ type: "ppsMultiplier", value: 1.5 }], // PPS 50% 증가
    x: 200,
    y: 600,
    costs: { points: 50000 },
  },
  {
    id: "design_patterns",
    name: "디자인 패턴 (Design Patterns)",
    description: "검증된 설계 방식을 도입하여 코드를 최적화합니다.",
    req: "oop",
    effects: [{ type: "clickMultiplier", value: 3.0 }], // 클릭 3배
    x: 600,
    y: 600,
    costs: { points: 75000 },
  },

  // =================================================================
  // [Tier 5] 마스터리 (엔드 게임 진입)
  // =================================================================
  {
    id: "fullstack",
    name: "풀스택 개발 (Full Stack)",
    description: "프론트엔드와 백엔드를 아우르는 마스터가 됩니다.",
    req: "async",
    effects: [
      { type: "ppsMultiplier", value: 1.5 },
      { type: "clickMultiplier", value: 1.5 },
    ], // 복합 효과
    x: 300,
    y: 750,
    costs: { points: 500000 },
  },
  {
    id: "microservices",
    name: "마이크로서비스 (MSA)",
    description: "거대한 모놀리식을 쪼개어 확장성을 극대화합니다.",
    req: "design_patterns",
    effects: [{ type: "costDiscount", value: 0.8 }], // 비용 20% 할인
    x: 500,
    y: 750,
    costs: { points: 800000 },
  },

  // =================================================================
  // [Prestige Tier] 프레스티지 전용 연구 (Active Users 소모)
  // =================================================================
  {
    id: "agile",
    name: "애자일 방법론 (Agile Methodology)",
    description: "빠른 피드백 루프를 통해 성장 속도를 가속화합니다.",
    req: "fullstack",
    effects: [{ type: "prestigeBoost", value: 0.2 }], // 부스트 +0.2 (20%)
    x: 250,
    y: 950,
    costs: { users: 3 }, // 유저 3명 소모
  },
  {
    id: "viral_marketing",
    name: "바이럴 마케팅 (Viral Marketing)",
    description: "입소문을 통해 서비스 오픈 시 더 많은 유저를 모읍니다.",
    req: "microservices",
    effects: [{ type: "prestigeExponent", value: 0.6 }], // 프레스티지 지수 0.5 → 0.6 증가
    x: 550,
    y: 950,
    costs: { users: 10 }, // 유저 10명 소모
  },
  {
    id: "ipo",
    name: "기업 공개 (IPO)",
    description: "주식 시장에 상장하여 막대한 자본과 명성을 얻습니다.",
    req: "viral_marketing", // 바이럴 마케팅 다음
    effects: [
      { type: "prestigeBoost", value: 1.0 },
      { type: "ppsMultiplier", value: 5.0 },
    ], // 부스트 +100%, PPS 5배
    x: 400,
    y: 1100, // 가장 깊은 곳
    costs: { users: 50 }, // 유저 50명 소모 (매우 비쌈)
  },
];

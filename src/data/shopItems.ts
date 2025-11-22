import type { Upgrade } from "../types";

export const shopItems: Upgrade[] = [
  // =================================================================
  // [Click Upgrades] 키보드, 신체 개조, 초능력
  // =================================================================
  {
    id: "membrane_kb",
    name: "멤브레인 키보드 (Membrane Keyboard)",
    type: "click",
    category: "Hardware",
    basePrice: 10,
    level: 0,
    effectValue: 1,
    description: "+1 CPC (기본적인 키감)",
  },
  {
    id: "rubber_duck",
    name: "고무 오리 (Rubber Duck Debugging)",
    type: "click",
    category: "Buff",
    basePrice: 150, // 10 -> 500 사이 갭 채우기
    level: 0,
    effectValue: 3,
    description: "+3 CPC (오리에게 설명하니 코드가 잘 짜진다)",
  },
  {
    id: "mechanical_kb_blue",
    name: "체리 청축 키보드 (Cherry Blue Switch)",
    type: "click",
    category: "Hardware",
    basePrice: 500,
    level: 0,
    effectValue: 5,
    description: "+5 CPC (찰칵거리는 소음이 생산성)",
  },
  {
    id: "mechanical_kb_red",
    name: "체리 적축 키보드 (Cherry Red Switch)",
    type: "click",
    category: "Hardware",
    basePrice: 2000,
    level: 0,
    effectValue: 15,
    description: "+15 CPC (구름 위를 걷는 타건감)",
  },
  {
    id: "topre_kb",
    name: "리얼포스 무접점 (Realforce Topre)",
    type: "click",
    category: "Hardware",
    basePrice: 10000,
    level: 0,
    effectValue: 50,
    description: "+50 CPC (보글보글 초콜릿 부러뜨리는 소리)",
  },
  {
    id: "ergonomic_kb",
    name: "인체공학 키보드 (Ergonomic Split)",
    type: "click",
    category: "Hardware",
    basePrice: 50000,
    level: 0,
    effectValue: 200,
    description: "+200 CPC (손목 터널 증후군 예방)",
  },
  {
    id: "custom_kb",
    name: "커스텀 알루미늄 키보드 (Custom Aluminum)",
    type: "click",
    category: "Hardware",
    basePrice: 250000,
    level: 0,
    effectValue: 1000,
    description: "+1,000 CPC (윤활 처리된 스테빌라이저)",
  },
  {
    id: "hhkb_pro",
    name: "해피해킹 프로 (HHKB Professional)",
    type: "click",
    category: "Hardware",
    basePrice: 1500000, // 25만 -> 1000만 사이 브릿지
    level: 0,
    effectValue: 5000,
    description: "+5,000 CPC (극강의 미니멀리즘)",
  },
  {
    id: "neural_link",
    name: "뉴럴 링크 인터페이스 (Neural Link)",
    type: "click",
    category: "Hardware",
    basePrice: 10000000,
    level: 0,
    effectValue: 50000,
    description: "+50k CPC (뇌파로 코딩합니다)",
  },
  {
    id: "cybernetic_arm",
    name: "사이버네틱 암 (Cybernetic Arm)",
    type: "click",
    category: "Hardware",
    basePrice: 500000000, // 5억
    level: 0,
    effectValue: 2000000, // 2M
    description: "+2M CPC (나노초 단위의 반응속도)",
  },
  {
    id: "time_warp",
    name: "타임 워프 타이핑 (Time Warp)",
    type: "click",
    category: "Buff",
    basePrice: 25000000000, // 250억
    level: 0,
    effectValue: 100000000, // 100M
    description: "+100M CPC (생각하기도 전에 코드가 작성됩니다)",
  },

  // =================================================================
  // [Auto Upgrades] 인력, 소프트웨어, 인프라, 초월적 존재
  // =================================================================
  {
    id: "intern",
    name: "인턴 개발자 (Intern Developer)",
    type: "auto",
    category: "Personnel",
    basePrice: 50,
    level: 0,
    effectValue: 1,
    description: "+1 PPS (열정은 넘칩니다)",
  },
  {
    id: "junior_dev",
    name: "주니어 개발자 (Junior Developer)",
    type: "auto",
    category: "Personnel",
    basePrice: 1000,
    level: 0,
    effectValue: 10,
    description: "+10 PPS (이제 1인분은 합니다)",
  },
  {
    id: "caffeine_iv",
    name: "카페인 링거 (Caffeine IV Drip)",
    type: "auto",
    category: "Buff",
    basePrice: 5000,
    level: 0,
    effectValue: 40,
    description: "+40 PPS (잠은 죽어서 자는 것)",
  },
  {
    id: "senior_dev",
    name: "시니어 개발자 (Senior Developer)",
    type: "auto",
    category: "Personnel",
    basePrice: 20000,
    level: 0,
    effectValue: 150,
    description: "+150 PPS (그가 키보드를 잡으면 버그가 사라집니다)",
  },
  {
    id: "stackoverflow_premium",
    name: "스택오버플로우 프리미엄 (StackOverflow Premium)",
    type: "auto",
    category: "Buff",
    basePrice: 100000,
    level: 0,
    effectValue: 500,
    description: "+500 PPS (복사 붙여넣기 속도 2배)",
  },
  {
    id: "fullstack_dev",
    name: "풀스택 개발자 (Full-Stack Developer)",
    type: "auto",
    category: "Personnel",
    basePrice: 350000, // 시니어(2만) -> 코파일럿(50만) 사이
    level: 0,
    effectValue: 1200,
    description: "+1.2k PPS (프론트엔드부터 백엔드까지 혼자 다 함)",
  },
  {
    id: "copilot",
    name: "AI 코파일럿 (AI Copilot)",
    type: "auto",
    category: "Software",
    basePrice: 1000000, // 1M
    level: 0,
    effectValue: 3000,
    description: "+3k PPS (당신의 마음을 읽는 자동완성)",
  },
  {
    id: "devops_team",
    name: "DevOps 팀 (DevOps Team)",
    type: "auto",
    category: "Personnel",
    basePrice: 5000000, // 5M
    level: 0,
    effectValue: 15000,
    description: "+15k PPS (CI/CD 파이프라인 자동화)",
  },
  {
    id: "cloud_server",
    name: "클라우드 서버 클러스터 (Cloud Cluster)",
    type: "auto",
    category: "Hardware",
    basePrice: 25000000, // 25M
    level: 0,
    effectValue: 80000,
    description: "+80k PPS (무한히 확장되는 컴퓨팅 파워)",
  },
  {
    id: "quantum_computer",
    name: "양자 컴퓨터 (Quantum Computer)",
    type: "auto",
    category: "Hardware",
    basePrice: 500000000, // 500M
    level: 0,
    effectValue: 1500000, // 1.5M
    description: "+1.5M PPS (슈뢰딩거의 코딩)",
  },
  {
    id: "agi_model",
    name: "범용 인공지능 (AGI Model)",
    type: "auto",
    category: "Software",
    basePrice: 10000000000, // 10B (100억)
    level: 0,
    effectValue: 25000000, // 25M
    description: "+25M PPS (스스로 생각하고 코딩하는 AI)",
  },
  {
    id: "dyson_sphere",
    name: "다이슨 스피어 서버 (Dyson Sphere Server)",
    type: "auto",
    category: "Hardware",
    basePrice: 1000000000000, // 1T (1조)
    level: 0,
    effectValue: 2000000000, // 2B
    description: "+2B PPS (항성의 에너지를 연산에 사용)",
  },
  {
    id: "reality_simulator",
    name: "현실 시뮬레이터 (Reality Simulator)",
    type: "auto",
    category: "Software",
    basePrice: 500000000000000, // 500T
    level: 0,
    effectValue: 1000000000000, // 1T
    description: "+1T PPS (우주 전체를 시뮬레이션하는 코드)",
  },
];

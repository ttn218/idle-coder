import type { Upgrade } from "../types";

// 마케팅 업그레이드는 '활성 유저'를 소모하며, 레벨 제한이 없거나 매우 높습니다.
export const marketingUpgrades: Upgrade[] = [
  {
    id: "online_ads",
    name: "온라인 배너 광고 (Online Ads)",
    type: "marketing",
    category: "Reach",
    basePrice: 10, // 유저 10명 소모
    level: 0,
    effectValue: 1.5, // PPS 배율 증가 (복리 아님, 합연산 추천)
    description: "PPS 생산량 +50% (Active Users 소모)",
  },
  {
    id: "influencer_collab",
    name: "인플루언서 협업 (Influencer Collab)",
    type: "marketing",
    category: "Reach",
    basePrice: 50,
    level: 0,
    effectValue: 2, // 클릭 효율 증가
    description: "클릭 효율 +100% (Active Users 소모)",
  },
  {
    id: "brand_ambassador",
    name: "브랜드 앰버서더 (Brand Ambassador)",
    type: "marketing",
    category: "Retention",
    basePrice: 500,
    level: 0,
    effectValue: 0.1, // 프레스티지 획득량 증가
    description: "서비스 릴리즈 시 획득 유저 +10%",
  },
  {
    id: "growth_hacking",
    name: "그로스 해킹 (Growth Hacking)",
    type: "marketing",
    category: "Efficiency",
    basePrice: 1000,
    level: 0,
    effectValue: 0.05, // 업그레이드 비용 할인 (최대치 제한 필요)
    description: "모든 상점 비용 -5% (최대 90%까지)",
  },
  {
    id: "tv_commercial",
    name: "슈퍼볼 TV 광고 (TV Commercial)",
    type: "marketing",
    category: "Reach",
    basePrice: 10000,
    level: 0,
    effectValue: 5, // PPS 대폭 증가
    description: "PPS 생산량 +500%",
  },
];
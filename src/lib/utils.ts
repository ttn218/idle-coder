export function formatNumber(value: number): string {
  // 0이나 음수 처리
  if (value < 0) return "0";
  if (value < 1000) return value.toFixed(1);

  // 접미사 목록 (필요에 따라 더 추가 가능)
  const suffixes = [
    "",
    "k",
    "M",
    "B",
    "T",
    "Qa",
    "Qi",
    "Sx",
    "Sp",
    "Oc",
    "No",
    "Dc",
  ];
  let suffixIndex = 0;

  // 값이 1000 이상이고, 아직 마지막 접미사가 아니라면 계속 1000으로 나눔
  while (value >= 1000 && suffixIndex < suffixes.length - 1) {
    value /= 1000;
    suffixIndex++;
  }

  // 소수점 처리 로직
  // 1. 기본적으로 소수점 2자리까지 표시 (toFixed(2))
  // 2. 만약 소수점이 .00 이면 제거 (예: 100.00k -> 100k)
  // 3. 만약 소수점이 .50 처럼 끝이 0이면 제거 (예: 1.50M -> 1.5M)
  // 4. 숫자가 100 이상(예: 520k)이면 소수점 없이 표시하는 것이 깔끔함 (선택사항, 여기서는 2자리 유지하되 0 제거로 통일)

  let formatted = value.toFixed(2);

  if (formatted.endsWith(".00")) {
    formatted = formatted.slice(0, -3);
  } else if (formatted.endsWith("0")) {
    // 소수점이 있는데 끝이 0인 경우만 (예: 1.50 -> 1.5)
    // 주의: 정수일 때(100)를 위에서 걸렀으므로 안전함
    formatted = formatted.slice(0, -1);
  }

  return `${formatted}${suffixes[suffixIndex]}`;
}

// Geometric series formulas for price calculations
export function getPrice(
  basePrice: number,
  level: number,
  costMultiplier: number = 1
): number {
  return basePrice * Math.pow(1.5, level) * costMultiplier;
}

export function getSumPrice(
  basePrice: number,
  level: number,
  count: number,
  costMultiplier: number = 1
): number {
  const currentBasePrice = basePrice * Math.pow(1.5, level) * costMultiplier;
  if (count === 1) return currentBasePrice;
  return (currentBasePrice * (Math.pow(1.5, count) - 1)) / (1.5 - 1);
}

export function getMaxBuyable(
  basePrice: number,
  level: number,
  currentPoints: number,
  costMultiplier: number = 1
): number {
  const currentBasePrice = basePrice * Math.pow(1.5, level) * costMultiplier;

  if (currentPoints < currentBasePrice) return 0;

  return Math.floor(
    Math.log(1 + (currentPoints * (1.5 - 1)) / currentBasePrice) / Math.log(1.5)
  );
}

export function formatNumber(value: number): string {
  if (value < 1000) {
    return Math.floor(value).toString();
  }

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
  const suffixNum = Math.floor(("" + Math.floor(value)).length / 3);

  let shortValue: number | string = parseFloat(
    (suffixNum !== 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(3)
  );
  if (shortValue % 1 !== 0) {
    shortValue = shortValue.toFixed(2);
  }

  return shortValue + suffixes[suffixNum];
}

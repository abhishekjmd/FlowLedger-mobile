export const formatINR = (value: number, maximumFractionDigits = 2) => {
  const safeMax = Math.max(0, maximumFractionDigits);
  const safeMin = Math.min(2, safeMax);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "symbol",
    minimumFractionDigits: safeMin,
    maximumFractionDigits: safeMax,
  }).format(Number.isFinite(value) ? value : 0);
};

export const formatINRCompact = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "symbol",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0);

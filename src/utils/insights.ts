export const normalizeInsightCurrency = (insight: string) =>
  insight
    .replace(/\bUSD\s*(?=\d)/gi, "\u20B9")
    .replace(/\$(?=\s?\d)/g, "\u20B9");

export const normalizeInsights = (insights: string[]) =>
  insights.map(normalizeInsightCurrency);

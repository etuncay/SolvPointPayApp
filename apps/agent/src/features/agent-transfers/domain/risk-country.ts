/** 6.4 — riskli ülke mock listesi. */
const RISK_BLOCKED = new Set(['IR', 'KP', 'SY']);
const RISK_REVIEW = new Set(['AF', 'YE']);

export function assessCountryRisk(countryCode: string): 'ok' | 'review' | 'blocked' {
  const cc = countryCode.toUpperCase();
  if (RISK_BLOCKED.has(cc)) return 'blocked';
  if (RISK_REVIEW.has(cc)) return 'review';
  return 'ok';
}

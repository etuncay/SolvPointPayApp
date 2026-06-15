/** Risk sınıfı — spec §0.11 / §8 */

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export const RISK_LEVELS: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];

export function classifyRiskLevel(score: number): RiskLevel {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  if (s <= 30) return 'Low';
  if (s <= 60) return 'Medium';
  if (s <= 90) return 'High';
  return 'Critical';
}

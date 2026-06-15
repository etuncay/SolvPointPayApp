import type { RiskLevel } from '../../shared/risk-classification';
import { classifyRiskLevel } from '../../shared/risk-classification';

/** Geçmiş satırı CSS sınıfı — spec §5 renk kodları */
export function historyRowClassForLevel(level: RiskLevel): string {
  switch (level) {
    case 'Low':
      return 'score-history-row--low';
    case 'Medium':
      return 'score-history-row--medium';
    case 'High':
      return 'score-history-row--high';
    case 'Critical':
      return 'score-history-row--critical';
    default:
      return '';
  }
}

export function historyRowClassForScore(score: number): string {
  return historyRowClassForLevel(classifyRiskLevel(score));
}

/** Bar genişliği — 0–100 */
export function historyBarWidthPercent(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

import type { RiskLevel } from '../../shared/risk-classification';
import { RISK_LEVELS } from '../../shared/risk-classification';
import type { EntityTypeCore, RiskBasedLimitRow } from './types';
import { ENTITY_TYPES } from './types';

const LEVEL_ORDER: (RiskLevel | null)[] = [null, ...RISK_LEVELS];

function levelIndex(riskLevel: RiskLevel | null): number {
  const idx = LEVEL_ORDER.indexOf(riskLevel);
  return idx < 0 ? 999 : idx;
}

export function sortLimitRows(rows: RiskBasedLimitRow[]): RiskBasedLimitRow[] {
  return [...rows].sort((a, b) => {
    const et = ENTITY_TYPES.indexOf(a.entityType) - ENTITY_TYPES.indexOf(b.entityType);
    if (et !== 0) return et;
    return levelIndex(a.riskLevel) - levelIndex(b.riskLevel);
  });
}

export function rowKey(entityType: EntityTypeCore, riskLevel: RiskLevel | null): string {
  return `${entityType}|${riskLevel ?? 'global'}`;
}

import { getCatalogEntry } from './parameter-catalog';
import type { ParameterStatus } from './types';

export type ParameterSnapshot = {
  value: string;
  status: ParameterStatus;
};

/**
 * 12.4 — kritik parametre değişiklikleri Onay Havuzu'na (8.1) düşer.
 * `approvalOnChange` katalog bayrağı veya `criticalZeroConfirm` ile 0 değeri.
 */
export function requiresParameterApproval(
  parameterKey: string,
  before: ParameterSnapshot,
  after: ParameterSnapshot,
): boolean {
  const entry = getCatalogEntry(parameterKey);
  if (!entry) return false;

  const valueChanged = after.value !== before.value;
  const statusChanged = after.status !== before.status;
  if (!valueChanged && !statusChanged) return false;

  if (entry.approvalOnChange) return true;

  if (
    entry.criticalZeroConfirm &&
    valueChanged &&
    after.value.trim() === '0' &&
    before.value.trim() !== '0'
  ) {
    return true;
  }

  return false;
}

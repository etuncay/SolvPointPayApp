import type { BackOfficeRole } from '@epay/ui';
import type {
  FxManagementSnapshot,
  FxMarginDraft,
  FxRateFilters,
  FxRefreshResult,
  FxSubmitMarginsResult,
} from '../domain/types';

export type FxService = {
  getSnapshot(role: BackOfficeRole, rateFilters?: FxRateFilters): FxManagementSnapshot;
  refreshRates(role: BackOfficeRole): FxRefreshResult;
  submitMargins(draft: FxMarginDraft, role: BackOfficeRole): FxSubmitMarginsResult;
  resetForTests(): void;
};

import { useCallback, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { kycReviewsService } from '../api';
import type { KycReviewListRow } from '../domain/types';

export function useKycReviews(role: BackOfficeRole) {
  const [tick, setTick] = useState(0);

  const rows = useMemo(() => {
    void tick;
    return kycReviewsService.list(role);
  }, [role, tick]);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  return { rows, refresh };
}

export type { KycReviewListRow };

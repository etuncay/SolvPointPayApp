import { useCallback, useMemo, useState } from 'react';
import { customerCampaignsService } from '../api';
import {
  DEFAULT_CAMPAIGN_FILTERS,
  type CampaignFilters,
  type CampaignInput,
  type CampaignUpdateInput,
} from '../domain/types';

export function useCustomerCampaigns() {
  const [filters, setFilters] = useState<CampaignFilters>(DEFAULT_CAMPAIGN_FILTERS);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const rows = useMemo(
    () => customerCampaignsService.list(filters),
    [filters, version],
  );

  const updateFilters = useCallback((patch: Partial<CampaignFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const create = useCallback(
    (input: CampaignInput) => {
      const result = customerCampaignsService.create(input);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  const update = useCallback(
    (id: number, input: CampaignUpdateInput) => {
      const result = customerCampaignsService.update(id, input);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  return { filters, updateFilters, rows, create, update, refresh };
}

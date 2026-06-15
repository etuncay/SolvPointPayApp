import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { walletsService } from '../api';
import { createWalletLimitApprovalRequest } from '../api/wallet-approval-bridge';
import { resolveWalletLimitRequiredApprovals } from '../domain/resolve-wallet-limit-approval-tier';
import { getWalletDetailPermissions } from '../domain/detail-permissions';
import type {
  AddNoteInput,
  BalanceBlockInput,
  LimitHistoryEntry,
  WalletDetail,
  WalletLimitSet,
} from '../domain/detail-types';
import { useRole } from '@/domain/role-context';

export function useWalletDetail() {
  const { walletId } = useParams();
  const id = Number(walletId);
  const { role } = useRole();
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const permissions = useMemo(() => getWalletDetailPermissions(role), [role]);

  const detail = useMemo((): WalletDetail | null => {
    if (!Number.isFinite(id)) return null;
    return walletsService.getDetail(id, role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, role, version]);

  const limitHistory = useMemo((): LimitHistoryEntry[] => {
    if (!Number.isFinite(id)) return [];
    return walletsService.getLimitHistory(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, version]);

  const updateLimits = useCallback(
    (limits: WalletLimitSet) => {
      if (!Number.isFinite(id)) return { ok: false as const, error: 'wd_not_found' };
      const result = walletsService.updateLimits(id, limits, role);
      if (result.ok) refresh();
      return result;
    },
    [id, role, refresh],
  );

  const persistLimits = useCallback(
    (
      newLimits: WalletLimitSet,
      oldLimits: WalletLimitSet,
    ): { ok: boolean; error?: string; approvalId?: number; direct?: boolean } => {
      if (!Number.isFinite(id)) return { ok: false, error: 'wd_not_found' };

      const tier = resolveWalletLimitRequiredApprovals(oldLimits, newLimits);
      if (tier === 0) {
        const result = walletsService.updateLimits(id, newLimits, role);
        if (result.ok) refresh();
        return { ...result, direct: true };
      }

      const requiredApprovals = (tier >= 2 ? 2 : 1) as 1 | 2;
      return createWalletLimitApprovalRequest({
        walletId: id,
        newLimits,
        oldLimits,
        role,
        requiredApprovals,
      });
    },
    [id, role, refresh],
  );

  const applyBalanceBlock = useCallback(
    (input: BalanceBlockInput) => {
      if (!Number.isFinite(id)) return { ok: false as const, error: 'wd_not_found' };
      const result = walletsService.applyBalanceBlock(id, input, role);
      if (result.ok) refresh();
      return result;
    },
    [id, role, refresh],
  );

  const addNote = useCallback(
    (input: AddNoteInput) => {
      if (!Number.isFinite(id)) return { ok: false as const, error: 'wd_not_found' };
      const result = walletsService.addNote(id, input, role);
      if (result.ok) refresh();
      return result;
    },
    [id, role, refresh],
  );

  return {
    id,
    detail,
    permissions,
    limitHistory,
    notFound: Number.isFinite(id) && detail == null,
    updateLimits,
    persistLimits,
    applyBalanceBlock,
    addNote,
    refresh,
  };
}

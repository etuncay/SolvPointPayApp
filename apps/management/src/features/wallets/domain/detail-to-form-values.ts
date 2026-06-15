import { fmtNumber } from '@/lib/format';
import type { WalletDetail, WalletLimitSet } from './detail-types';

function getLimit(limits: WalletLimitSet, group: keyof WalletLimitSet, type: keyof WalletLimitSet[keyof WalletLimitSet]): number {
  return Number(limits[group][type]);
}

/** WalletDetail → DynamicForm initialValues (flat). */
export function walletDetailToFormValues(
  detail: WalletDetail,
  lang: string,
  t: (key: string, fb?: string) => string,
  canEditLimits: boolean,
): Record<string, unknown> {
  const limits = detail.limits;
  return {
    _cat: detail.cat,
    _canEditLimits: canEditLimits,
    ownerNo: detail.cat !== 'system' ? `#${detail.ownerNo}` : '',
    ownerName: detail.ownerName ?? '',
    phone: detail.phone ?? '—',
    idNo: detail.idNo ?? '—',
    walletNo: detail.walletNo,
    balance: fmtNumber(detail.balance, lang),
    ccy: detail.ccy,
    blocked: detail.blocked === -1 ? t('wl_full_blocked') : fmtNumber(detail.blocked, lang),
    available: fmtNumber(detail.available, lang),
    createdAt: detail.createdAt,
    blockEndDate: detail.blockEndDate ?? '',
    lastTxAt: detail.lastTxAt ?? '—',
    lastTxAmount: detail.lastTxAmount != null ? fmtNumber(detail.lastTxAmount, lang) : '—',
    txToday: String(detail.txToday),
    txAmtToday: fmtNumber(detail.txAmtToday, lang),
    w_Single: getLimit(limits, 'Withdrawal', 'Single'),
    w_DailyCount: getLimit(limits, 'Withdrawal', 'DailyCount'),
    w_DailyAmount: getLimit(limits, 'Withdrawal', 'DailyAmount'),
    w_MonthlyCount: getLimit(limits, 'Withdrawal', 'MonthlyCount'),
    w_MonthlyAmount: getLimit(limits, 'Withdrawal', 'MonthlyAmount'),
    t_Single: getLimit(limits, 'Transfer', 'Single'),
    t_DailyCount: getLimit(limits, 'Transfer', 'DailyCount'),
    t_DailyAmount: getLimit(limits, 'Transfer', 'DailyAmount'),
    t_MonthlyCount: getLimit(limits, 'Transfer', 'MonthlyCount'),
    t_MonthlyAmount: getLimit(limits, 'Transfer', 'MonthlyAmount'),
    i_Single: getLimit(limits, 'International', 'Single'),
    i_DailyCount: getLimit(limits, 'International', 'DailyCount'),
    i_DailyAmount: getLimit(limits, 'International', 'DailyAmount'),
    i_MonthlyCount: getLimit(limits, 'International', 'MonthlyCount'),
    i_MonthlyAmount: getLimit(limits, 'International', 'MonthlyAmount'),
  };
}


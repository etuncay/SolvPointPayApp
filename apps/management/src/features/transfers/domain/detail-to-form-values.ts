import { fmtNumber } from '@/lib/format';
import type { TransactionDetail } from './detail-types';

export function detailToFormValues(
  detail: TransactionDetail,
  lang: string,
  t: (key: string, fb?: string) => string,
  agentRoleLabel: string,
): Record<string, unknown> {
  const isFx = detail.sourceCurrency !== detail.targetCurrency;
  const total = detail.principalAmount + detail.feeFixed + detail.feeVariable;

  const partyId = (idKind: string | null, idNo: string | null) =>
    idNo ? `${idKind ?? ''} ${idNo}`.trim() : '—';

  return {
    sender_customerNo: detail.sender.customerNo != null ? String(detail.sender.customerNo) : '—',
    sender_walletNo: detail.sender.walletNo ?? '—',
    sender_name: detail.sender.name,
    sender_phone: detail.sender.phone ?? '—',
    sender_id: partyId(detail.sender.idKind, detail.sender.idNo),
    sender_city: detail.sender.city ?? '—',
    sender_iban: detail.sender.iban ?? '—',
    receiver_customerNo: detail.receiver.customerNo != null ? String(detail.receiver.customerNo) : '—',
    receiver_walletNo: detail.receiver.walletNo ?? '—',
    receiver_name: detail.receiver.name,
    receiver_phone: detail.receiver.phone ?? '—',
    receiver_id: partyId(detail.receiver.idKind, detail.receiver.idNo),
    receiver_city: detail.receiver.city ?? '—',
    receiver_iban: detail.receiver.iban ?? '—',
    referenceNo: detail.referenceNo,
    foreignReferenceNo: detail.foreignReferenceNo ?? '—',
    principalAmount: `${fmtNumber(detail.principalAmount, lang)} ${detail.sourceCurrency}`,
    targetAmount:
      detail.targetAmount != null ? `${fmtNumber(detail.targetAmount, lang)} ${detail.targetCurrency}` : '—',
    fxRate: detail.fxRate != null ? String(detail.fxRate) : '—',
    feeFixed: fmtNumber(detail.feeFixed, lang),
    feeVariable: fmtNumber(detail.feeVariable, lang),
    totalPaid: `${fmtNumber(total, lang)} ${detail.sourceCurrency}`,
    createdAt: detail.createdAt,
    withdrawalDate: detail.withdrawalDate ?? '—',
    transactionType: t(`wa_tx_${detail.transactionType}`, String(detail.transactionType)),
    paymentPurpose: detail.paymentPurpose ?? '—',
    status: t(`tx_status_${detail.status}`, String(detail.status)),
    description: detail.description ?? '—',
    senderAuth_name: detail.senderAuthorized?.name ?? '—',
    senderAuth_title: detail.senderAuthorized?.title ?? '—',
    senderAuth_phone: detail.senderAuthorized?.phone ?? '—',
    receiverAuth_name: detail.receiverAuthorized?.name ?? '—',
    receiverAuth_title: detail.receiverAuthorized?.title ?? '—',
    receiverAuth_phone: detail.receiverAuthorized?.phone ?? '—',
    agentRole: agentRoleLabel,
    agentName: (detail.senderAgent ?? detail.receiverAgent)?.name ?? '—',
    documents: detail.documents,
    _showSenderIban: !!detail.sender.iban,
    _showReceiverIban: !!detail.receiver.iban,
    _showFx: isFx,
    _hasSenderAuth: !!detail.senderAuthorized,
    _hasReceiverAuth: !!detail.receiverAuthorized,
    _hasAgents: !!(detail.senderAgent || detail.receiverAgent),
  };
}


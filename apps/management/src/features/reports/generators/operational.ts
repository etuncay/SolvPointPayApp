import { AGENTS } from '@/mocks/agents';
import { OPEN_RISK_CASES } from '@/mocks/risk-cases';
import type { ReportGenerator } from '../domain/types';
import { baseResult, filterTransactions, mapTxRow } from './shared';

export const financialTransactions: ReportGenerator = async (params) => {
  const rows = filterTransactions(params, (tx) => tx.status === 'Completed')
    .map(mapTxRow)
    .filter((r) => !params.currency || r.currency === params.currency);
  const totalTry = rows.reduce((s, r) => s + Number(r.amountTry), 0);
  return baseResult(
    [
      { key: 'txNo', labelKey: 'rpt_col_tx_no' },
      { key: 'type', labelKey: 'rpt_col_type' },
      { key: 'currency', labelKey: 'rpt_col_currency' },
      { key: 'amount', labelKey: 'rpt_col_amount' },
      { key: 'amountTry', labelKey: 'rpt_col_amount_try' },
      { key: 'status', labelKey: 'rpt_col_status' },
      { key: 'createdAt', labelKey: 'rpt_col_date' },
    ],
    rows,
    { totalTry },
  );
};

export const errorTransactions: ReportGenerator = async (params) => {
  const rows = filterTransactions(
    params,
    (tx) => tx.status === 'ErrorComplete' || tx.status === 'ErrorSend' || tx.status === 'ErrorReceive',
  ).map(mapTxRow);
  return baseResult(
    [
      { key: 'txNo', labelKey: 'rpt_col_tx_no' },
      { key: 'status', labelKey: 'rpt_col_status' },
      { key: 'amountTry', labelKey: 'rpt_col_amount_try' },
      { key: 'createdAt', labelKey: 'rpt_col_date' },
    ],
    rows,
  );
};

export const riskComplianceSummary: ReportGenerator = async (params) => {
  const rows = OPEN_RISK_CASES.filter((c) => {
    if (!params.dateFrom || !params.dateTo) return true;
    return c.openedAt >= params.dateFrom && c.openedAt <= `${params.dateTo}T23:59:59`;
  }).map((c) => ({
    caseId: c.id,
    ruleName: c.ruleName ?? '—',
    status: c.status,
    assignedStaff: c.assignedStaff ?? '—',
    openedAt: c.openedAt,
  }));
  return baseResult(
    [
      { key: 'caseId', labelKey: 'rpt_col_case_id' },
      { key: 'ruleName', labelKey: 'col_rule' },
      { key: 'status', labelKey: 'rpt_col_status' },
      { key: 'assignedStaff', labelKey: 'rpt_col_staff' },
    ],
    rows,
    { openCount: rows.length },
  );
};

export const agentAccounts: ReportGenerator = async () => {
  const rows = AGENTS.filter((a) => a.recordStatus === 1 && a.status === 'active').map((a) => ({
    agentNo: `AG-${a.id}`,
    name: a.name,
    balanceTry: a.balance.TRY,
    balanceUsd: a.balance.USD,
    city: a.city,
  }));
  return baseResult(
    [
      { key: 'agentNo', labelKey: 'rpt_col_agent' },
      { key: 'name', labelKey: 'rpt_col_name' },
      { key: 'balanceTry', labelKey: 'rpt_col_balance_try' },
      { key: 'city', labelKey: 'rpt_col_city' },
    ],
    rows,
  );
};

export const rejectedCanceledCorrections: ReportGenerator = async (params) => {
  const rows = filterTransactions(
    params,
    (tx) => tx.status === 'Canceled' || tx.status === 'ErrorComplete',
  ).map(mapTxRow);
  return baseResult(
    [
      { key: 'txNo', labelKey: 'rpt_col_tx_no' },
      { key: 'status', labelKey: 'rpt_col_status' },
      { key: 'amountTry', labelKey: 'rpt_col_amount_try' },
    ],
    rows,
  );
};

export const systemErrors: ReportGenerator = async (params) => {
  const rows = [
    {
      source: 'BTRANS',
      message: 'Timeout — EPAY_DAILY_TX',
      at: '2026-05-23T08:12:00Z',
    },
    {
      source: 'Accounting',
      message: 'GL mapping missing — fee account',
      at: '2026-05-22T14:00:00Z',
    },
    {
      source: 'Bank ingest',
      message: 'Duplicate reference REF-INGEST-DUP',
      at: '2026-05-19T09:15:00Z',
    },
  ].filter((r) => {
    if (!params.dateFrom || !params.dateTo) return true;
    return r.at >= params.dateFrom && r.at <= `${params.dateTo}T23:59:59`;
  });
  return baseResult(
    [
      { key: 'source', labelKey: 'rpt_col_source' },
      { key: 'message', labelKey: 'rpt_col_message' },
      { key: 'at', labelKey: 'rpt_col_date' },
    ],
    rows,
  );
};

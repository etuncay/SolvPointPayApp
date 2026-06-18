import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, Clock, Download, ListChecks, Wallet } from 'lucide-react';
import { DynamicTable, KpiCard, KpiStrip, PageHead, type TableCustomFunctions } from '@epay/ui';
import { fmtNumber } from '@/lib/format';
import { PartyCell } from './components/party-cell';
import { TransactionDetailDrawer } from './components/transaction-detail-drawer';
import { TransactionStatusBadge } from './components/transaction-status-badge';
import { TransactionTypeBadge } from './components/transaction-type-badge';
import {
  buildTransactionHistoryTableConfig,
  type TransactionHistorySummary,
} from './transaction-history-table-config';
import {
  getTransactionHistoryDateScope,
  setTransactionHistoryDateScope,
  type TransactionHistoryDateScope,
} from './domain/transaction-history-scope';
import type { AgentTransactionRow } from './domain/types';
import type { TransactionType } from '@/features/transaction-confirmation/domain/transaction-types';
import { useAgentUiPermissions } from '@/hooks/use-agent-ui-permissions';

function fmtTry(n: number, lang: string): string {
  return new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDateCell(iso: string, lang: string): string {
  const normalized = iso.includes('T') ? iso : iso.replace(' ', 'T');
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtAmountCell(amount: number, currency: string, lang: string): string {
  const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
  return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ${currency}`;
}

/** Agent İşlem Hareketleri — referans EPayAgent txn-history-page + DynamicTable. */
export function TransactionHistoryPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const [dateScope, setDateScope] = useState<TransactionHistoryDateScope>(() =>
    getTransactionHistoryDateScope(),
  );
  const [tableKey, setTableKey] = useState(0);
  const [summary, setSummary] = useState<TransactionHistorySummary>({
    count: 0,
    totalRevenueTry: 0,
    volumeTry: 0,
    pendingCount: 0,
  });
  const [detailRow, setDetailRow] = useState<AgentTransactionRow | null>(null);
  const ui = useAgentUiPermissions();

  const handleSummary = useCallback((next: TransactionHistorySummary) => setSummary(next), []);

  const config = useMemo(
    () => buildTransactionHistoryTableConfig(translate, { onSummary: handleSummary }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, tableKey, handleSummary],
  );

  const setScope = (scope: TransactionHistoryDateScope) => {
    setTransactionHistoryDateScope(scope);
    setDateScope(scope);
    setTableKey((k) => k + 1);
  };

  const customFunctions: TableCustomFunctions = useMemo(
    () => ({
      renderDate: (val: unknown): ReactNode => (
        <span className="mono fs-12 t-soft" style={{ whiteSpace: 'nowrap' }}>
          {fmtDateCell(String(val ?? ''), lang)}
        </span>
      ),
      renderSender: (val: unknown): ReactNode => <PartyCell name={String(val ?? '—')} />,
      renderReceiver: (val: unknown): ReactNode => <PartyCell name={String(val ?? '—')} />,
      renderIban: (val: unknown): ReactNode =>
        val ? (
          <span className="mono fs-11 t-mute">{String(val)}</span>
        ) : (
          <span className="t-mute fs-12">{t('ag_tx_hist_no_iban')}</span>
        ),
      renderTxType: (val: unknown): ReactNode => (
        <TransactionTypeBadge type={val as TransactionType} />
      ),
      renderAmount: (_val: unknown, row: Record<string, unknown>): ReactNode => (
        <span className="amount r">{fmtAmountCell(Number(row.amount ?? 0), String(row.currency ?? 'TRY'), lang)}</span>
      ),
      renderStatus: (val: unknown): ReactNode => (
        <TransactionStatusBadge status={val as AgentTransactionRow['status']} />
      ),
      renderAgentRole: (val: unknown): ReactNode => {
        const isSender = val === 'SenderAgent';
        return (
          <span className={`badge ${isSender ? 'info' : 'muted'}`} style={{ fontFamily: 'var(--font-ui)' }}>
            {t(isSender ? 'ag_tx_hist_role_sender_short' : 'ag_tx_hist_role_receiver_short')}
          </span>
        );
      },
      renderRevenue: (val: unknown): ReactNode => {
        const n = val == null ? null : Number(val);
        if (n == null || Number.isNaN(n)) {
          return <span className="t-mute fs-12">—</span>;
        }
        return (
          <span className="amount r" style={{ color: n > 0 ? 'var(--ok-fg)' : 'var(--fg-faint)' }}>
            {fmtTry(n, lang)}
          </span>
        );
      },
    }),
    [t, lang],
  );

  const dateScopeLabel = dateScope === 'today' ? t('ag_tx_hist_today_only') : t('ag_tx_hist_all_dates');

  return (
    <>
      <PageHead
        title={t('ag_nav_transactions')}
        subtitle={t('ag_tx_hist_subtitle')}
        actions={
          <div className="head-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="seg">
              <button
                type="button"
                className={dateScope === 'today' ? 'on' : ''}
                onClick={() => setScope('today')}
              >
                {t('ag_tx_hist_today_only')}
              </button>
              <button
                type="button"
                className={dateScope === 'all' ? 'on' : ''}
                onClick={() => setScope('all')}
              >
                {t('ag_tx_hist_all_dates')}
              </button>
            </div>
            <button type="button" className="btn" onClick={() => undefined}>
              <Download size={13} /> {t('ag_tx_hist_export')}
            </button>
          </div>
        }
      />

      <KpiStrip className="tx-hist-kpi-strip">
        <KpiCard
          icon={<ListChecks size={12} />}
          label={t('ag_tx_hist_stat_count')}
          value={fmtNumber(summary.count, lang)}
          sub={dateScopeLabel}
        />
        <KpiCard
          icon={<ArrowLeftRight size={12} />}
          label={t('ag_tx_hist_stat_volume')}
          value={fmtTry(summary.volumeTry, lang)}
          sub="≈ TRY"
        />
        <KpiCard
          icon={<Wallet size={12} />}
          label={t('ag_tx_hist_stat_income')}
          value={fmtTry(summary.totalRevenueTry, lang)}
          sub={t('ag_tx_hist_stat_income_sub')}
          className="val-ok"
        />
        <KpiCard
          icon={<Clock size={12} />}
          label={t('ag_tx_hist_stat_pending')}
          value={fmtNumber(summary.pendingCount, lang)}
          sub={t('ag_tx_hist_stat_pending_sub')}
        />
      </KpiStrip>

      <div className="grid-card">
        <DynamicTable
          key={tableKey}
          config={config}
          permissions={ui.table.transactions}
          customFunctions={customFunctions}
          locale={lang}
          t={translate}
          onRowClick={(row) => setDetailRow(row as unknown as AgentTransactionRow)}
        />
      </div>

      <TransactionDetailDrawer row={detailRow} onClose={() => setDetailRow(null)} />
    </>
  );
}

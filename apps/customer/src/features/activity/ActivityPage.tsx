import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerPortalApi, type CustomerTransaction, type CustomerWallet } from '@epay/data';
import { useTranslation } from 'react-i18next';
import { WalletCard } from '@/components/money/WalletCard';
import { DirBadge } from '@/components/ui/DirBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/icons/Icon';
import { fmtMoney } from '@/lib/format';
import { TxDetailModal } from './TxDetailModal';

function counterpartyAccount(tx: CustomerTransaction): string {
  if (tx.iban && tx.iban !== '—') return tx.iban;
  return tx.account ?? '—';
}

export function ActivityPage() {
  const { t } = useTranslation();
  const [dir, setDir] = useState<'all' | 'in' | 'out'>('all');
  const [search, setSearch] = useState('');
  const [walletId, setWalletId] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selTx, setSelTx] = useState<CustomerTransaction | null>(null);

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => customerPortalApi.listWallets(),
  });

  const { data: typeOptions = [] } = useQuery({
    queryKey: ['transaction-types'],
    queryFn: async () => {
      const all = await customerPortalApi.listTransactions({ page: 1, pageSize: 500 });
      return Array.from(new Set(all.items.map((t) => t.type)));
    },
  });

  const editableWallets = useMemo(() => wallets.filter((w) => w.editable), [wallets]);

  const query = useMemo(
    () => ({
      direction: dir,
      search,
      walletId,
      type: typeFilter,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      amountMin: amountMin ? Number(amountMin) : undefined,
      amountMax: amountMax ? Number(amountMax) : undefined,
      page,
      pageSize: 10,
      sortBy: 'date' as const,
      sortDir: 'desc' as const,
    }),
    [dir, search, walletId, typeFilter, dateFrom, dateTo, amountMin, amountMax, page],
  );

  function resetFilters() {
    setTypeFilter('all');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
    setWalletId('all');
    setPage(1);
  }

  const { data: list } = useQuery({
    queryKey: ['transactions', query],
    queryFn: () => customerPortalApi.listTransactions(query),
  });

  const totalPages = list ? Math.max(1, Math.ceil(list.total / list.pageSize)) : 1;
  const rows = list?.items ?? [];

  function walletFeatured(w: CustomerWallet, index: number): boolean {
    if (walletId === 'all') return index === 0;
    return walletId === w.id;
  }

  function onWalletClick(w: CustomerWallet) {
    setWalletId((prev) => (prev === w.id ? 'all' : w.id));
    setPage(1);
  }

  const dirOptions: { key: typeof dir; labelKey: string }[] = [
    { key: 'all', labelKey: 'activity_dir_all' },
    { key: 'in', labelKey: 'activity_dir_in' },
    { key: 'out', labelKey: 'activity_dir_out' },
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <div>
            <div className="eyebrow">{t('activity_eyebrow')}</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>
              {t('activity_title')}
            </h1>
            <p className="page-sub">{t('activity_subtitle')}</p>
          </div>
        </div>

        <div className="activity-wallets">
          {editableWallets.map((w, i) => {
            const selected = walletId === w.id;
            return (
              <div
                key={w.id}
                className={selected ? 'activity-wallet-selected' : undefined}
                style={{ borderRadius: 'var(--r-lg)' }}
              >
                <WalletCard
                  wallet={w}
                  featured={walletFeatured(w, i)}
                  onClick={() => onWalletClick(w)}
                />
              </div>
            );
          })}
        </div>

        <div className="card card-pad activity-filter-card">
          <div className="activity-filter-row">
            <div className="input-affix activity-search">
              <span className="pre">
                <Icon name="search" style={{ width: 17, height: 17 }} />
              </span>
              <input
                className="input"
                placeholder={t('activity_search_placeholder')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="activity-seg" role="group" aria-label={t('activity_dir_group')}>
              {dirOptions.map(({ key, labelKey }) => (
                <button
                  key={key}
                  type="button"
                  className={`activity-seg-btn${dir === key ? ' active' : ''}`}
                  onClick={() => {
                    setDir(key);
                    setPage(1);
                  }}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`btn btn-ghost${advancedOpen ? ' active' : ''}`}
              onClick={() => setAdvancedOpen((v) => !v)}
              aria-expanded={advancedOpen}
            >
              <Icon name="filter" /> {t('activity_advanced_filter')}
            </button>
          </div>

          {advancedOpen && (
            <>
              <div className="activity-advanced form-grid" style={{ marginTop: 14 }}>
                <Field label={t('activity_wallet_label')}>
                  <select
                    className="select"
                    value={walletId}
                    onChange={(e) => {
                      setWalletId(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">{t('activity_dir_all')}</option>
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.label} ({w.currency})
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t('activity_type_label')}>
                  <select
                    className="select"
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">{t('activity_type_all')}</option>
                    {typeOptions.map((ty) => (
                      <option key={ty} value={ty}>
                        {ty}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t('activity_date_from')}>
                  <input
                    type="date"
                    className="input"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                    }}
                  />
                </Field>
                <Field label={t('activity_date_to')}>
                  <input
                    type="date"
                    className="input"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                    }}
                  />
                </Field>
                <Field label={t('activity_amount_min')}>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="input tnum"
                    value={amountMin}
                    onChange={(e) => {
                      setAmountMin(e.target.value);
                      setPage(1);
                    }}
                  />
                </Field>
                <Field label={t('activity_amount_max')}>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="input tnum"
                    value={amountMax}
                    onChange={(e) => {
                      setAmountMax(e.target.value);
                      setPage(1);
                    }}
                  />
                </Field>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" className="btn btn-quiet" onClick={resetFilters}>
                  <Icon name="close" style={{ width: 15, height: 15 }} /> {t('activity_filter_clear')}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="table-wrap activity-tx-table">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 44 }} aria-hidden />
                <th>{t('activity_col_type')}</th>
                <th>{t('activity_col_counterparty')}</th>
                <th>{t('activity_col_account')}</th>
                <th>{t('activity_col_date')}</th>
                <th>{t('activity_col_status')}</th>
                <th style={{ textAlign: 'right' }}>{t('activity_col_amount')}</th>
                <th style={{ textAlign: 'right' }}>{t('activity_col_balance_after')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((tx) => (
                <tr key={tx.id} onClick={() => setSelTx(tx)}>
                  <td>
                    <DirBadge dir={tx.direction} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{tx.type}</div>
                    <div className="tnum" style={{ fontSize: 12, color: 'var(--faint)' }}>
                      {tx.id}
                    </div>
                  </td>
                  <td>
                    {tx.counterparty}
                    {tx.counterpartyNo && (
                      <div className="tnum" style={{ fontSize: 12, color: 'var(--faint)' }}>
                        {tx.counterpartyNo}
                      </div>
                    )}
                  </td>
                  <td className="tnum" style={{ fontSize: 13 }}>
                    {counterpartyAccount(tx)}
                  </td>
                  <td className="tnum" style={{ whiteSpace: 'nowrap' }}>
                    {tx.date}
                  </td>
                  <td>
                    <StatusPill status={tx.status} />
                  </td>
                  <td className="tnum" style={{ textAlign: 'right' }}>
                    <span className={tx.direction === 'in' ? 'amt-in' : 'amt-out'}>
                      {tx.direction === 'in' ? '+' : '−'}
                      {fmtMoney(tx.amount, tx.symbol)}
                    </span>
                  </td>
                  <td
                    className="tnum"
                    style={{ textAlign: 'right', color: 'var(--muted)' }}
                  >
                    {fmtMoney(tx.balanceAfter, tx.symbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="empty">{t('activity_empty')}</div>
          )}
        </div>

        {rows.length > 0 && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t('activity_prev')}
            </button>
            <span style={{ alignSelf: 'center', color: 'var(--muted)' }}>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('activity_next')}
            </button>
          </div>
        )}
      </div>
      {selTx && <TxDetailModal tx={selTx} onClose={() => setSelTx(null)} />}
    </div>
  );
}

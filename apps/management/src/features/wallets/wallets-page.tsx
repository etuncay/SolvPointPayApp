import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { BarChart3, Lock, RefreshCw, Shield, Wallet } from 'lucide-react';
import {
  Button,
  DynamicTable,
  KpiCard,
  KpiStrip,
  RoleHint,
  WalletBlockedCell,
  WalletCatBadge,
  WalletMoneyCell,
  WalletTypeCell,
  type WalletTypeCode,
} from '@epay/ui';
import type { WalletListItem } from './domain/types';
import { DEFAULT_WALLET_FILTERS, type WalletFilters } from './domain/types';
import { fmtMoney, fmtNumber } from '@/lib/format';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import { useWallets } from './hooks/use-wallets';
import { walletsService } from './api';
import { buildWalletsTableConfig } from './wallets-table-config';

export function WalletsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language;

  const { role, permissions, stats, refresh } = useWallets();
  const [version, setVersion] = useState(0);
  const lastFilters = useRef<WalletFilters>(DEFAULT_WALLET_FILTERS);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const tableConfig = useMemo(
    () =>
      buildWalletsTableConfig(role, translate, (f) => {
        lastFilters.current = f;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role, i18n.language, version],
  );

  const customFunctions = useMemo(
    () => ({
      renderMono: (value: unknown) => <span className="mono fs-12">{String(value ?? '')}</span>,
      renderSoftMono: (value: unknown) => <span className="mono fs-12 t-soft">{String(value ?? '')}</span>,
      renderOwnerNo: (_v: unknown, row: Record<string, unknown>) =>
        (row as WalletListItem).cat === 'system' ? (
          <span className="dash">—</span>
        ) : (
          <span className="cust-no">#{(row as WalletListItem).ownerNo}</span>
        ),
      renderWalletNo: (_v: unknown, row: Record<string, unknown>) => {
        const w = row as WalletListItem;
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span className="mono fs-12">{w.walletNo}</span>
            <WalletCatBadge cat={w.cat} label={t(`wl_owner_${w.cat}`)} />
          </span>
        );
      },
      renderType: (value: unknown) => (
        <WalletTypeCell type={value as WalletTypeCode} label={t(`wt_${String(value)}`, String(value))} />
      ),
      renderOwnerName: (value: unknown, row: Record<string, unknown>) =>
        (row as WalletListItem).cat === 'system' ? (
          <span className="dash">—</span>
        ) : (
          <span
            className="fs-12"
            style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}
          >
            {String(value ?? '')}
          </span>
        ),
      renderPhone: (value: unknown, row: Record<string, unknown>) =>
        (row as WalletListItem).cat === 'system' ? (
          <span className="dash">—</span>
        ) : (
          <span className="mono fs-12 t-soft">{String(value ?? '')}</span>
        ),
      renderIdNo: (_v: unknown, row: Record<string, unknown>) => {
        const w = row as WalletListItem;
        return w.cat === 'system' ? (
          <span className="dash">—</span>
        ) : (
          <span className="idno">
            <span className="kind">{w.idKind}</span>
            {w.idNo}
          </span>
        );
      },
      renderAvailable: (value: unknown) => <WalletMoneyCell amount={Number(value ?? 0)} lang={lang} big />,
      renderBlocked: (value: unknown, row: Record<string, unknown>) => {
        const w = row as WalletListItem;
        return (
          <WalletBlockedCell
            blocked={Number(value ?? 0)}
            currency={w.ccy}
            lang={lang}
            fullBlockLabel={t('wl_full_blocked')}
          />
        );
      },
      renderTxToday: (value: unknown) => (
        <span className="mono fs-12">{Number(value ?? 0) || <span className="dash">0</span>}</span>
      ),
      renderTxAmt: (value: unknown) => (
        <span className="mono fs-12">
          {Number(value ?? 0) ? fmtNumber(Number(value), lang) : <span className="dash">—</span>}
        </span>
      ),
    }),
    [t, lang],
  );

  const csvColumns: CsvColumn<WalletListItem>[] = [
    { header: t('wl_c_owner_no'), value: (r) => r.ownerNo },
    { header: t('cba_col_account'), value: (r) => r.walletNo },
    { header: t('wl_c_type'), value: (r) => r.type },
    { header: t('wl_c_name'), value: (r) => r.ownerName },
    { header: t('wl_c_available'), value: (r) => r.available },
    { header: t('fcd_blocked'), value: (r) => r.blocked },
    { header: t('wl_c_ccy'), value: (r) => r.ccy },
    { header: t('sc_col_created'), value: (r) => r.createdAt },
  ];

  const handleExport = () => {
    if (!permissions.export) return;
    const data = walletsService.exportRows(lastFilters.current, role);
    exportCsv('wallets-export', data, csvColumns);
    toast.success(t('wl_export_ok'));
  };

  const handleRefresh = () => {
    refresh();
    setVersion((v) => v + 1);
  };

  return (
    <>
      <RoleHint>{t(`wl_role_info_${role}`)}</RoleHint>

      <KpiStrip>
        <KpiCard
          icon={<Wallet size={12} />}
          label={t('wl_stat_count')}
          value={fmtNumber(stats.totalCount, lang)}
          sub={`${stats.customerCount} M · ${stats.agentCount} T · ${stats.systemCount} S`}
        />
        <KpiCard
          icon={<BarChart3 size={12} />}
          label={`${t('wl_stat_total')} · TRY`}
          value={fmtMoney(stats.totalsByCcy.TRY ?? 0, lang)}
          sub={[stats.totalsByCcy.USD && `$${fmtNumber(stats.totalsByCcy.USD, lang)}`, stats.totalsByCcy.EUR && `€${fmtNumber(stats.totalsByCcy.EUR, lang)}`, stats.totalsByCcy.GBP && `£${fmtNumber(stats.totalsByCcy.GBP, lang)}`]
            .filter(Boolean)
            .join('  ')}
        />
        <KpiCard
          icon={<Lock size={12} />}
          label={t('wl_stat_blocked')}
          value={
            <span style={{ color: stats.blockedFullCount > 0 ? 'var(--danger-fg)' : undefined }}>
              {stats.blockedFullCount}
              <span className="t-mute fs-12">
                {' '}
                · {stats.blockedPartialCount} {lang === 'tr' ? 'kısmi' : 'partial'}
              </span>
            </span>
          }
          sub={lang === 'tr' ? 'İncele →' : 'Review →'}
        />
        <KpiCard
          icon={<Shield size={12} />}
          label={t('wl_stat_tx_today')}
          value={fmtNumber(stats.txTodayTotal, lang)}
          sub={<span className="up">↑ 9% {lang === 'tr' ? 'düne göre' : 'vs yesterday'}</span>}
        />
      </KpiStrip>

      <DynamicTable
        config={tableConfig}
        header={{
          title: t('nav_wallets'),
          subtitle: t('wl_subtitle'),
          trailing: (
            <Button type="button" variant="ghost" onClick={handleRefresh}>
              <RefreshCw size={13} /> {t('refresh_all')}
            </Button>
          ),
        }}
        permissions={{ new: false, edit: false, delete: false, view: true, export: permissions.export }}
        customFunctions={customFunctions}
        locale={i18n.language}
        t={translate}
        onExport={handleExport}
        onRowClick={(row) => navigate(`/wallets/${row.id}`)}
      />
    </>
  );
}

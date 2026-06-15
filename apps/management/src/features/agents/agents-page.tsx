import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Ban,
  Building2,
  Info,
  Plus,
  ArrowLeftRight,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import {
  AgentBalanceCell,
  AgentGroupPill,
  AgentNameCell,
  AgentStatusPill,
  agentInitials,
  Button,
  DynamicTable,
  KpiCard,
  KpiStrip,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SettlementFreqLabel,
  type SettlementFrequency,
} from '@epay/ui';
import { fmtMoney, fmtNumber } from '@/lib/format';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import { useRole } from '@/domain/role-context';
import { getAgentPermissions } from './domain/permissions';
import {
  DEFAULT_AGENT_FILTERS,
  type AgentFilters,
  type AgentListItem,
} from './domain/types';
import { agentsService } from './api';
import { buildAgentsTableConfig } from './agents-table-config';

export function AgentsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const permissions = getAgentPermissions(role);
  const lang = i18n.language;
  const tr = lang === 'tr';

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const [hqPopoverOpen, setHqPopoverOpen] = useState(false);
  const lastFilters = useRef<AgentFilters>(DEFAULT_AGENT_FILTERS);

  const { stats } = useMemo(() => agentsService.list(DEFAULT_AGENT_FILTERS), []);

  const tableConfig = useMemo(
    () =>
      buildAgentsTableConfig(translate, (f) => {
        lastFilters.current = f;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const fmtDate = (iso: string | 'today') => {
    if (iso === 'today') return t('today');
    return new Date(iso).toLocaleDateString(tr ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  const settlementLabel = (f: SettlementFrequency) => {
    const map: Record<SettlementFrequency, string> = {
      realtime: t('set_realtime'),
      daily: t('rpt_schedule_daily'),
      weekly: t('set_weekly'),
      monthly: t('set_monthly'),
    };
    return map[f];
  };

  const statusLabel = (s: AgentListItem['status']) =>
    ({
      active: t('ib_status_Active'),
      inactive: t('ib_status_Inactive'),
      blocked: t('fcd_blocked'),
      closed: t('rl_closed'),
    })[s];

  const csvColumns: CsvColumn<AgentListItem>[] = [
    { header: t('fcd_agent_id'), value: (a) => a.id },
    { header: t('ag_c_name'), value: (a) => a.name },
    { header: t('fcd_customer_email'), value: (a) => a.email },
    { header: t('fcd_customer_phone'), value: (a) => a.phone },
    { header: t('ag_c_vkn'), value: (a) => a.vkn },
    { header: t('fcd_agent_group'), value: (a) => a.group.label },
    {
      header: t('ag_c_balance'),
      value: (a) => `TRY:${a.balance.TRY} USD:${a.balance.USD} EUR:${a.balance.EUR}`,
    },
    { header: t('ag_c_settlement'), value: (a) => settlementLabel(a.settlement) },
    { header: t('sc_col_created'), value: (a) => a.createdAt },
    { header: t('ag_c_lasttx'), value: (a) => String(a.lastTxAt) },
    {
      header: t('scf_col_status'),
      value: (a) => {
        const reason = a.blockReason ?? a.closeReason;
        return reason ? `${statusLabel(a.status)} – ${reason}` : statusLabel(a.status);
      },
    },
  ];

  const customFunctions = useMemo(
    () => ({
      renderId: (_v: unknown, row: Record<string, unknown>) => (
        <span className="cust-no">#{(row as AgentListItem).id}</span>
      ),
      renderName: (_v: unknown, row: Record<string, unknown>) => {
        const a = row as AgentListItem;
        return (
          <AgentNameCell
            name={a.name}
            subtitle={`${a.city} · ${a.branches} ${t('ag_branches').toLowerCase()}`}
            initials={agentInitials(a.name)}
          />
        );
      },
      renderContact: (_v: unknown, row: Record<string, unknown>) => {
        const a = row as AgentListItem;
        return (
          <span className="contact-cell">
            <span className="fs-12">{a.email}</span>
            <span className="mono fs-11 t-soft">{a.phone}</span>
          </span>
        );
      },
      renderMono: (value: unknown) => <span className="mono fs-12">{String(value ?? '')}</span>,
      renderGroup: (_v: unknown, row: Record<string, unknown>) => (
        <AgentGroupPill group={(row as AgentListItem).group as never} />
      ),
      renderBalance: (_v: unknown, row: Record<string, unknown>) => (
        <AgentBalanceCell balance={(row as AgentListItem).balance} lang={lang} />
      ),
      renderSettlement: (value: unknown) => (
        <SettlementFreqLabel
          frequency={value as SettlementFrequency}
          label={settlementLabel(value as SettlementFrequency)}
        />
      ),
      renderDateSoft: (value: unknown) => (
        <span className="mono fs-12 t-soft">{fmtDate(String(value ?? ''))}</span>
      ),
      renderLastTx: (value: unknown) =>
        String(value) === 'today' ? (
          <span className="mono fs-12" style={{ color: 'var(--ok-fg)' }}>
            {t('today')}
          </span>
        ) : (
          <span className="mono fs-12 t-soft">{fmtDate(String(value ?? ''))}</span>
        ),
      renderStatus: (value: unknown, row: Record<string, unknown>) => {
        const a = row as AgentListItem;
        return (
          <AgentStatusPill
            status={value as AgentListItem['status']}
            label={statusLabel(a.status)}
            reason={a.blockReason ?? a.closeReason}
          />
        );
      },
    }),
    [t, lang],
  );

  const handleRowClick = (row: Record<string, unknown>) => {
    if (!permissions.view) return;
    const a = row as AgentListItem;
    const path = permissions.update ? `/agents/${a.id}` : `/agents/${a.id}?mode=view`;
    navigate(path);
  };

  const handleExport = () => {
    exportCsv('temsilciler', agentsService.exportRows(lastFilters.current), csvColumns);
  };

  const newAgentAction =
    permissions.insert ? (
      <Popover open={hqPopoverOpen} onOpenChange={setHqPopoverOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="primary" size="sm">
            <Plus size={13} /> {t('ag_new')}
          </Button>
        </PopoverTrigger>
        <PopoverContent style={{ width: 280, padding: 14 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'var(--warn-soft)',
                color: 'var(--warn-fg)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Info size={14} />
            </div>
            <div style={{ fontSize: 12.5 }}>
              <b style={{ display: 'block', marginBottom: 4 }}>{t('tp_corp_t')}</b>
              <span className="t-mute">{t('ag_only_hq')}</span>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button type="button" variant="ghost" onClick={() => setHqPopoverOpen(false)}>
                  {t('lf_cancel_back')}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    setHqPopoverOpen(false);
                    navigate('/agents/new');
                  }}
                >
                  {t('ag_new')}
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    ) : null;

  return (
    <>
      <KpiStrip>
        <KpiCard
          icon={<Building2 size={12} />}
          label={t('ag_stat_total')}
          value={
            <>
              {fmtNumber(stats.active, lang)}{' '}
              <span className="t-mute fs-12">/ {stats.visibleTotal}</span>
            </>
          }
          sub={<span className="up">↑ 2 {tr ? 'bu hafta' : 'this week'}</span>}
        />
        <KpiCard
          icon={<Wallet size={12} />}
          label={t('ag_stat_advance')}
          value={fmtMoney(stats.totalTRY, lang)}
          sub={tr ? 'USD/EUR hariç' : 'USD/EUR excl.'}
        />
        <KpiCard
          icon={<TriangleAlert size={12} />}
          label={t('ag_stat_low')}
          value={
            <>
              {fmtNumber(stats.lowBal, lang)}
              {stats.negBal > 0 && (
                <span className="t-mute fs-12" style={{ color: 'var(--danger-fg)' }}>
                  {' '}
                  · {stats.negBal} {t('ag_balance_neg').toLowerCase()}
                </span>
              )}
            </>
          }
          sub={t('ag_low_thresh')}
        />
        <KpiCard
          icon={<Ban size={12} />}
          label={t('ag_stat_blocked')}
          value={
            <span style={{ color: stats.blocked > 0 ? 'var(--danger-fg)' : undefined }}>
              {fmtNumber(stats.blocked, lang)}
            </span>
          }
          sub={tr ? 'İncele →' : 'Review →'}
        />
        <KpiCard
          icon={<ArrowLeftRight size={12} />}
          label={t('ag_stat_tx_today')}
          value={fmtNumber(stats.txToday, lang)}
          sub={<span className="up">↑ 12% {tr ? 'düne göre' : 'vs yesterday'}</span>}
        />
      </KpiStrip>

      <DynamicTable
        config={tableConfig}
        header={{ title: t('nav_agents'), subtitle: t('ag_subtitle'), trailing: newAgentAction }}
        permissions={{
          new: false,
          edit: permissions.update,
          delete: permissions.delete,
          view: permissions.view,
          export: permissions.export,
        }}
        customFunctions={customFunctions}
        locale={i18n.language}
        t={translate}
        onExport={handleExport}
        onRowClick={handleRowClick}
      />
    </>
  );
}

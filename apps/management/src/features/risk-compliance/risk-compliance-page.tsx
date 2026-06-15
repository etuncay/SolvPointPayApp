import { useState } from 'react';
import { Building2, RefreshCw, UserCircle, Users, Gauge, BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, PageHead, useThemeSettings } from '@epay/ui';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { canSeeRiskDashboard } from './domain/report-permissions';
import { FullscreenOverlay } from '@/features/dashboard/components/fullscreen-overlay';
import type { WidgetDef } from '@/features/dashboard/widget-registry';
import { CaseAgePanel } from './components/case-age-panel';
import {
  ReportTablePanel,
  partyColumns,
  rulePerformanceColumns,
  staffPerformanceColumns,
  highRiskColumns,
} from './components/report-table-panel';
import { useRiskDashboard } from './hooks/use-risk-dashboard';
import type { ReportCode } from './domain/types';

const FS_WIDGET: WidgetDef = {
  id: 'risk_fs',
  col: 12,
  roles: ['compliance', 'management'],
  comp: () => null,
};

const PANEL_META: Record<
  Exclude<ReportCode, 'case_age'>,
  { icon: typeof Users; iconTone: 'accent' | 'warn' | 'danger' | 'ok' | 'info'; col: 6 | 12; titleKey: string }
> = {
  customers: { icon: Users, iconTone: 'accent', col: 6, titleKey: 'nav_customers' },
  agents: { icon: Building2, iconTone: 'info', col: 6, titleKey: 'nav_agents' },
  rule_performance: { icon: Gauge, iconTone: 'warn', col: 6, titleKey: 'rp_rule_performance' },
  staff_performance: { icon: UserCircle, iconTone: 'ok', col: 6, titleKey: 'rp_staff_performance' },
  high_risk_approved: { icon: BadgeCheck, iconTone: 'danger', col: 12, titleKey: 'rp_high_risk_approved' },
};

function RiskDashboardContent() {
  const { t, i18n } = useTranslation();
  const { lang } = useThemeSettings();
  const { panels, refresh, visibleCodes } = useRiskDashboard();
  const [fsCode, setFsCode] = useState<ReportCode | null>(null);

  const langKey = lang ?? i18n.language;

  return (
    <>
      <PageHead
        title={t('m_risk')}
        subtitle={t('rc_page_subtitle')}
        actions={
          <Button variant="ghost" size="sm" onClick={() => void refresh()}>
            <RefreshCw size={14} /> {t('refresh_all')}
          </Button>
        }
      />

      <div className="grid" style={{ marginTop: 16 }}>
        {visibleCodes.includes('case_age') && (
        <div className="col-12">
          <CaseAgePanel
            state={
              panels.case_age?.status === 'ready'
                ? panels.case_age
                : panels.case_age?.status === 'error'
                  ? panels.case_age
                  : { status: 'loading' }
            }
            onRetry={() => void refresh()}
          />
        </div>
        )}

        {(Object.keys(PANEL_META) as (keyof typeof PANEL_META)[])
          .filter((code) => visibleCodes.includes(code))
          .map((code) => {
          const meta = PANEL_META[code];
          const Icon = meta.icon;
          const panelState = panels[code];
          const cols =
            code === 'customers' || code === 'agents'
              ? partyColumns(langKey, code === 'customers' ? 'Customer' : code === 'agents' ? 'Agent' : undefined)
              : code === 'rule_performance'
                ? rulePerformanceColumns(langKey)
                : code === 'staff_performance'
                  ? staffPerformanceColumns(langKey)
                  : highRiskColumns(langKey);

          return (
            <div key={code} className={`col-${meta.col}`}>
              <ReportTablePanel
                reportCode={code}
                icon={Icon}
                iconTone={meta.iconTone}
                titleKey={meta.titleKey}
                columns={cols}
                state={
                  panelState?.status === 'ready'
                    ? { ...panelState, data: panelState.data as Record<string, unknown>[] }
                    : panelState?.status === 'error'
                      ? panelState
                      : { status: 'loading' }
                }
                onRetry={() => void refresh()}
                onFullscreen={() => setFsCode(code)}
              />
            </div>
          );
        })}
      </div>

      {fsCode && fsCode !== 'case_age' && (
        <FullscreenOverlay
          widget={{ ...FS_WIDGET, id: fsCode }}
          titleKey={`rp_${fsCode}`}
          onClose={() => setFsCode(null)}
          onRefresh={() => void refresh()}
        >
          {(filterText) => {
            const meta = PANEL_META[fsCode as keyof typeof PANEL_META];
            const Icon = meta.icon;
            const panelState = panels[fsCode];
            const cols =
              fsCode === 'customers' || fsCode === 'agents'
                ? partyColumns(
                    langKey,
                    fsCode === 'customers' ? 'Customer' : fsCode === 'agents' ? 'Agent' : undefined,
                  )
                : fsCode === 'rule_performance'
                  ? rulePerformanceColumns(langKey)
                  : fsCode === 'staff_performance'
                    ? staffPerformanceColumns(langKey)
                    : highRiskColumns(langKey);

            return (
              <ReportTablePanel
                reportCode={fsCode}
                icon={Icon}
                iconTone={meta.iconTone}
                titleKey={meta.titleKey}
                columns={cols}
                state={
                  panelState?.status === 'ready'
                    ? { ...panelState, data: panelState.data as Record<string, unknown>[] }
                    : panelState?.status === 'error'
                      ? panelState
                      : { status: 'loading' }
                }
                onRetry={() => void refresh()}
                mode="scr_fullscreen"
                filterText={filterText}
              />
            );
          }}
        </FullscreenOverlay>
      )}
    </>
  );
}

export function RiskCompliancePage() {
  const { role } = useRole();
  if (!canSeeRiskDashboard(role)) {
    return <Navigate to="/" replace />;
  }
  return <RiskDashboardContent />;
}

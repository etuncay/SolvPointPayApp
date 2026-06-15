import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Building2, RefreshCw, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, PageHead } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { FullscreenOverlay } from '@/features/dashboard/components/fullscreen-overlay';
import type { WidgetDef } from '@/features/dashboard/widget-registry';
import { ComplaintTypePanel } from './components/panels/complaint-type-panel';
import { SupportCaseAgePanel } from './components/panels/case-age-panel';
import { EntityCasesTablePanel } from './components/panels/entity-cases-table';
import { getSupportReportPermissions } from './domain/permissions';
import { useSupportReports } from './hooks/use-support-reports';
import type {
  CaseAgeSummary,
  ComplaintTypeCountRow,
  EntityCaseReportRow,
  PanelState,
  ReportCode,
} from './domain/types';

const FS_WIDGET: WidgetDef = {
  id: 'support_fs',
  col: 12,
  roles: ['management'],
  comp: () => null,
};

const FS_TITLE: Record<'customers-by-cases' | 'agents-by-cases', string> = {
  'customers-by-cases': 'scr_panel_customers',
  'agents-by-cases': 'scr_panel_agents',
};

function SupportReportsContent() {
  const { t } = useTranslation();
  const { panels, refresh } = useSupportReports();
  const [fsCode, setFsCode] = useState<ReportCode | null>(null);

  const complaintState = panels['by-complaint-type'] as PanelState<ComplaintTypeCountRow[]> | undefined;
  const ageState = panels['by-case-age'] as PanelState<CaseAgeSummary> | undefined;
  const customerState = panels['customers-by-cases'] as PanelState<EntityCaseReportRow[]> | undefined;
  const agentState = panels['agents-by-cases'] as PanelState<EntityCaseReportRow[]> | undefined;

  return (
    <>
      <PageHead
        title={t('scr_page_title')}
        subtitle={t('scr_page_subtitle')}
        actions={
          <Button variant="ghost" size="sm" onClick={() => void refresh()}>
            <RefreshCw size={14} /> {t('refresh_all')}
          </Button>
        }
      />

      <div
        className="grid"
        style={{ marginTop: 16, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}
      >
        <div style={{ gridColumn: '1 / -1' }}>
          <ComplaintTypePanel state={complaintState} onRetry={() => void refresh()} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <SupportCaseAgePanel state={ageState} onRetry={() => void refresh()} />
        </div>
        <EntityCasesTablePanel
          icon={Users}
          iconTone="accent"
          titleKey="scr_panel_customers"
          entityLabelKey="scr_col_customer_no"
          state={customerState}
          onRetry={() => void refresh()}
          onFullscreen={() => setFsCode('customers-by-cases')}
        />
        <EntityCasesTablePanel
          icon={Building2}
          iconTone="info"
          titleKey="scr_panel_agents"
          entityLabelKey="scr_col_agent_no"
          state={agentState}
          onRetry={() => void refresh()}
          onFullscreen={() => setFsCode('agents-by-cases')}
        />
      </div>

      {fsCode && (fsCode === 'customers-by-cases' || fsCode === 'agents-by-cases') && (
        <FullscreenOverlay
          widget={{ ...FS_WIDGET, id: fsCode }}
          titleKey={FS_TITLE[fsCode]}
          onClose={() => setFsCode(null)}
          onRefresh={() => void refresh()}
        >
          {(filterText) =>
            fsCode === 'customers-by-cases' ? (
              <EntityCasesTablePanel
                icon={Users}
                iconTone="accent"
                titleKey="scr_panel_customers"
                entityLabelKey="scr_col_customer_no"
                state={customerState}
                onRetry={() => void refresh()}
                mode="scr_fullscreen"
                filterText={filterText}
              />
            ) : (
              <EntityCasesTablePanel
                icon={Building2}
                iconTone="info"
                titleKey="scr_panel_agents"
                entityLabelKey="scr_col_agent_no"
                state={agentState}
                onRetry={() => void refresh()}
                mode="scr_fullscreen"
                filterText={filterText}
              />
            )
          }
        </FullscreenOverlay>
      )}
    </>
  );
}

export function SupportReportsPage() {
  const { role } = useRole();
  const canView = getSupportReportPermissions(role).canView;

  if (!canView) {
    return <Navigate to="/" replace />;
  }

  return <SupportReportsContent />;
}

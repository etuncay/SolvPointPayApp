import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, Cable, ClipboardList, Save, Settings2, Shield } from 'lucide-react';
import { Button, FormLayout, FormPrimaryActions, PageHead, SectionRail } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { integrationsService } from './api/mock-integrations-adapter';
import { EntityStatusPill } from './components/entity-status-pill';
import { IntegrationTypeBadge } from './components/integration-type-badge';
import { ConfigurationTab } from './components/tabs/configuration-tab';
import { ConnectionSecurityTab } from './components/tabs/connection-security-tab';
import { GeneralTab } from './components/tabs/general-tab';
import { LogMonitoringTab } from './components/tabs/log-monitoring-tab';
import { canAccessIntegrations, canMutateIntegrations } from './domain/permissions';
import { useIntegrationDetail } from './hooks/use-integration-detail';

export function IntegrationDetailPage() {
  const { t } = useTranslation();
  const { integrationId } = useParams<{ integrationId: string }>();
  const navigate = useNavigate();
  const { role } = useRole();
  const user = getCurrentUser(role);
  const canEdit = canMutateIntegrations(role);
  const vm = useIntegrationDetail(role, integrationId);
  const [activeSec, setActiveSec] = useState('general');

  const sections = useMemo(
    () => [
      { id: 'general', no: '1', label: t('int_tab_general') },
      { id: 'connection', no: '2', label: t('int_tab_connection') },
      { id: 'config', no: '3', label: t('int_tab_config') },
      { id: 'log', no: '4', label: t('int_tab_log') },
    ],
    [t],
  );

  if (!canAccessIntegrations(role)) return <Navigate to="/" replace />;
  if (!vm.integration) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('finrec_not_found')}</h3>
        <Button type="button" variant="ghost" onClick={() => navigate('/system/integrations')}>
          <ArrowLeft size={14} /> {t('fr_back_list')}
        </Button>
      </div>
    );
  }

  const save = () => {
    const result = integrationsService.update(role, user.id, vm.integration!.id, vm.draft);
    if (!result.ok) {
      toast.error(t(result.errorCode, result.errorCode));
      return;
    }
    toast.success(t('int_saved_ok'));
    vm.bump();
  };

  const rotate = () => {
    const result = integrationsService.rotateCredential(role, user.id, vm.integration!.id);
    if (!result.ok) toast.error(t(result.errorCode, result.errorCode));
    else toast.success(t('int_rotated_ok'));
  };

  return (
    <>
      <PageHead
        title={vm.integration.name}
        subtitle={vm.integration.systemName}
        status={
          <div style={{ display: 'flex', gap: 6 }}>
            <IntegrationTypeBadge type={vm.integration.integrationType} />
            <EntityStatusPill status={vm.integration.status} />
          </div>
        }
        actions={
          <FormPrimaryActions
            showSave={canEdit}
            onSave={save}
            saveLabel={
              <>
                <Save size={14} /> {t('ib_save')}
              </>
            }
            saveDisabled={!vm.dirty}
            showCancel
            onCancel={() => navigate('/system/integrations')}
            cancelLabel={
              <>
                <ArrowLeft size={14} /> {t('fr_back_list')}
              </>
            }
          />
        }
      />
      {(vm.integration.integrationType === 'Accounting' ||
        vm.integration.integrationType === 'Btrans') && (
        <p className="fs-12" style={{ marginBottom: 12 }}>
          <Link to={vm.integration.integrationType === 'Accounting' ? '/ops/accounting' : '/ops/btrans'}>
            {t('int_runtime_link')}
          </Link>
        </p>
      )}
      <FormLayout
        rail={
          <SectionRail
            sections={sections}
            activeId={activeSec}
            title={t('int_detail_title')}
            onNavigate={setActiveSec}
          />
        }
      >
        {activeSec === 'general' ? <GeneralTab integration={vm.integration} /> : null}
        {activeSec === 'connection' ? (
          <ConnectionSecurityTab
            draft={vm.draft}
            integration={vm.integration}
            canEdit={canEdit}
            onPatch={vm.patchDraft}
            onRotate={rotate}
          />
        ) : null}
        {activeSec === 'config' ? (
          <ConfigurationTab
            draft={vm.draft}
            integration={vm.integration}
            canEdit={canEdit}
            onPatch={vm.patchDraft}
          />
        ) : null}
        {activeSec === 'log' ? (
          <LogMonitoringTab
            logs={vm.logs}
            correlationFilter={vm.correlationFilter}
            onCorrelationChange={vm.setCorrelationFilter}
          />
        ) : null}
      </FormLayout>
    </>
  );
}

import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, X } from 'lucide-react';
import { Button, FormPrimaryActions, PageHead, RoleHint } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { getRiskLimitsPermissions } from './domain/permissions';
import { useRiskLimits } from './hooks/use-risk-limits';
import { VersionHistoryBar } from './components/version-history-bar';
import { LimitsMatrixPanel } from './components/limits-matrix-panel';
import './risk-limits.css';

export function RiskLimitsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const permissions = getRiskLimitsPermissions(role);
  const vm = useRiskLimits();

  if (!permissions.canView) {
    return <Navigate to="/" replace />;
  }

  const readOnly = !permissions.canSave || vm.isHistorical;

  const handleSave = () => {
    if (!window.confirm(t('rl_save_confirm'))) return;
    const result = vm.saveVersion();
    if (!result.ok) return;
    if (!result.direct) {
      toast.success(t('if_sent_to_approval'));
      navigate('/approvals');
    }
  };

  const handleCancel = () => {
    if (vm.dirty && !window.confirm(t('rs_discard_confirm'))) return;
    vm.discard();
    toast.info(t('rl_discarded'));
  };

  return (
    <>
      <PageHead
        title={t('s_rk_limits')}
        subtitle={t('rl_page_subtitle')}
        status={<span className="mono fs-11 t-mute">7.2</span>}
        actions={
          !readOnly ? (
            <FormPrimaryActions
              showSave
              onSave={handleSave}
              saveLabel={
                <>
                  <Save size={14} /> {t('rl_save_version')}
                </>
              }
              saveDisabled={!vm.dirty}
              showCancel
              onCancel={handleCancel}
              cancelLabel={
                <>
                  <X size={14} /> {t('ib_cancel')}
                </>
              }
            />
          ) : undefined
        }
      />

      {!permissions.canSave && permissions.canView && (
        <RoleHint>{t('rl_readonly_hint')}</RoleHint>
      )}

      <div className="rl-info-banner">
        <p style={{ margin: 0 }}>
          <strong>{t('rl_monotonic_info')}</strong>
        </p>
        <p style={{ margin: 0 }}>{t('rl_limit_legend')}</p>
      </div>

      {vm.payload && (
        <VersionHistoryBar
          lastUpdatedAt={vm.payload.lastUpdatedAt}
          lastUpdatedBy={vm.payload.lastUpdatedBy}
          versionId={vm.payload.versionId}
          asOf={vm.asOf}
          onAsOfChange={vm.setAsOf}
          onClearAsOf={() => vm.setAsOf('')}
          isHistorical={vm.isHistorical}
        />
      )}

      {vm.loading ? (
        <p className="t-mute">{t('loading')}</p>
      ) : (
        <LimitsMatrixPanel rows={vm.rows} readOnly={readOnly} onUpdateRow={vm.updateRow} />
      )}
    </>
  );
}

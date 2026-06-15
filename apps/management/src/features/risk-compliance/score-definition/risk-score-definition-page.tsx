import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button, PageHead, RoleHint } from '@epay/ui';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { getRiskScoreDefinitionPermissions } from './domain/permissions';
import { useRiskScoreDefinition } from './hooks/use-risk-score-definition';
import { ScopeTabs } from './components/scope-tabs';
import { ScoreItemsPanel } from './components/score-items-panel';
import { RiskActionsPanel } from './components/risk-actions-panel';
import { AddScoreItemModal } from './components/add-score-item-modal';
import { SimulationModal } from './components/simulation-modal';
import type { RiskScoreRule } from './domain/types';
import './score-definition.css';

export function RiskScoreDefinitionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const permissions = getRiskScoreDefinitionPermissions(role);
  const vm = useRiskScoreDefinition();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingRule, setEditingRule] = useState<RiskScoreRule | null>(null);
  const [simOpen, setSimOpen] = useState(false);

  if (!permissions.canView) {
    return <Navigate to="/" replace />;
  }

  const readOnly = !permissions.canEdit;

  const openCreate = () => {
    setModalMode('create');
    setEditingRule(null);
    setModalOpen(true);
  };

  const openEdit = (rule: RiskScoreRule) => {
    setModalMode('edit');
    setEditingRule(rule);
    setModalOpen(true);
  };

  const handleCancel = () => {
    if (vm.anyDirty && !window.confirm(t('rs_discard_confirm'))) return;
    navigate('/risk');
  };

  const handleSaveContinue = () => {
    if (!vm.saveScope()) return;
    if (vm.nextScope) vm.switchScope(vm.nextScope);
    else toast.info(t('rs_last_scope'));
  };

  const handleSaveFinish = () => {
    if (vm.saveAllDirty()) navigate('/risk');
  };

  return (
    <>
      <PageHead
        title={t('s_rk_score')}
        subtitle={t('rs_page_subtitle')}
        status={<span className="mono fs-11 t-mute">7.1</span>}
        actions={
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
            {permissions.canSimulate && (
              <Button variant="ghost" size="sm" onClick={() => setSimOpen(true)}>
                {t('rs_simulation_btn')}
              </Button>
            )}
            {!readOnly && (
              <>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  {t('ib_cancel')}
                </Button>
                {permissions.canToggle && (
                  <Button variant="ghost" size="sm" onClick={vm.toggleSelected} disabled={!vm.selectedRuleId}>
                    {vm.selectedRule?.status === 'Passive' ? t('rs_activate') : t('rs_deactivate')}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleSaveContinue}>
                  {t('rs_save_continue')}
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveFinish}>
                  {t('rs_save_finish')}
                </Button>
              </>
            )}
          </div>
        }
      />

      {!permissions.canEdit && <RoleHint>{t('rs_readonly_hint')}</RoleHint>}

      <ScopeTabs scope={vm.scope} onChange={vm.switchScope} />

      {vm.loading ? (
        <p className="t-mute">{t('loading')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ScoreItemsPanel
            rules={vm.rules}
            selectedId={vm.selectedRuleId}
            onSelect={vm.setSelectedRuleId}
            onAdd={openCreate}
            onEdit={openEdit}
            readOnly={readOnly}
          />
          <RiskActionsPanel
            actionSets={vm.actionSets}
            onChange={vm.updateActionSet}
            readOnly={readOnly}
          />
        </div>
      )}

      <AddScoreItemModal
        open={modalOpen}
        mode={modalMode}
        scope={vm.scope}
        rule={editingRule}
        onClose={() => setModalOpen(false)}
        onValidate={vm.validateDsl}
        onSaveCreate={vm.createRule}
        onSaveUpdate={(id, input) => vm.updateRule(id, input)}
      />

      <SimulationModal open={simOpen} onClose={() => setSimOpen(false)} onRun={() => vm.simulate()} />
    </>
  );
}

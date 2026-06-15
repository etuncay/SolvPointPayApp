import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { Button, DynamicForm, FormMode, type CustomFunctions } from '@epay/ui';
import { useRiskManagement } from './hooks/use-risk-management';
import { ReferenceListsPanel } from './components/reference-lists-panel';
import { CaseGroupsPanel } from './components/case-groups-panel';
import { RoutingRulesPanel } from './components/routing-rules-panel';
import { EngineParamsPanel } from './components/engine-params-panel';
import { buildRiskManagementFormConfig } from './risk-management-form-config';
import './risk-management.css';

export function RiskManagementPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const translate: (key: string, fb?: string) => string = (k, fb) =>
    t(k, { defaultValue: fb ?? k });
  const vm = useRiskManagement();

  const formConfig = useMemo(
    () => buildRiskManagementFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      components: {
        ReferenceListsPanel: () => (
          <ReferenceListsPanel
            listCodes={vm.referenceListCodes}
            selectedList={vm.selectedList}
            onSelectList={vm.setSelectedList}
            activeValues={vm.activeValues}
            onAdd={vm.addValue}
            onRemove={vm.removeValue}
            historyItems={vm.historyItems}
            occupationRows={vm.occupationRows}
            onOccupationChange={vm.setOccupationRows}
            canEdit={vm.permissions.update}
          />
        ),
        CaseGroupsPanel: () => (
          <CaseGroupsPanel groups={vm.groups} onChange={vm.setGroups} canEdit={vm.permissions.update} />
        ),
        RoutingRulesPanel: () => (
          <RoutingRulesPanel
            rules={vm.rules}
            groups={vm.groups}
            onChange={vm.setRules}
            canEdit={vm.permissions.update}
          />
        ),
        EngineParamsPanel: () => (
          <EngineParamsPanel params={vm.params} onChange={vm.setParams} canEdit={vm.permissions.update} />
        ),
      },
    }),
    [vm],
  );

  if (!vm.permissions.view) {
    return <Navigate to="/" replace />;
  }

  const handleSave = () => {
    const result = vm.saveAll();
    if (!result.ok) {
      toast.error(t(result.error ?? 'frd_save_failed'));
      return;
    }
    toast.success(t('if_sent_to_approval'));
    navigate('/approvals');
  };

  return (
    <DynamicForm
      config={formConfig}
      mode={vm.permissions.update ? FormMode.Update : FormMode.View}
      permissions={{ update: vm.permissions.update, view: vm.permissions.view }}
      customFunctions={customFunctions}
      t={translate}
      header={{
        title: t('s_rk_admin'),
        subtitle: t('rm_page_subtitle'),
        saveLabel: (
          <>
            <Save size={14} /> {t('ib_save')}
          </>
        ),
      }}
      onSubmit={handleSave}
    />
  );
}

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button, DynamicForm, FormMode, type CustomFunctions } from '@epay/ui';
import { useFxManagement } from './hooks/use-fx-management';
import { MarginSettingsPanel } from './components/margin-settings-panel';
import { RateInfoPanel } from './components/rate-info-panel';
import { MarginHistoryPanel } from './components/margin-history-panel';
import { RateHistoryPanel } from './components/rate-history-panel';
import { buildFxFormConfig } from './fx-form-config';

export function FxManagementPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const translate: (key: string, fb?: string) => string = (k, fb) =>
    t(k, { defaultValue: fb ?? k });
  const vm = useFxManagement();

  const formConfig = useMemo(
    () => buildFxFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      components: {
        MarginSettingsPanel: () => (
          <MarginSettingsPanel form={vm.form} disabled={vm.formDisabled} />
        ),
        RateInfoPanel: () => <RateInfoPanel rates={vm.snapshot.rates} lang={lang} />,
        MarginHistoryPanel: () => <MarginHistoryPanel rows={vm.snapshot.marginHistory} />,
        RateHistoryPanel: () => (
          <RateHistoryPanel
            rows={vm.snapshot.rateHistory}
            rateDate={vm.rateFilters.rateDate}
            onRateDateChange={vm.updateRateDateFilter}
            lang={lang}
          />
        ),
      },
    }),
    [vm, lang],
  );

  if (!vm.permissions.view) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('finrec_forbidden_title')}</h3>
        <p className="t-mute">{t('fx_forbidden_sub')}</p>
      </div>
    );
  }

  const handleRefresh = async () => {
    const result = await vm.refreshRates();
    if (!result.ok) {
      toast.error(t(result.error ?? 'fx_refresh_failed'));
      return;
    }
    if (result.usedFallback) toast.warning(t('fx_refresh_fallback'));
    else toast.success(t('fx_refresh_ok', { count: result.updated }));
  };

  const handleSave = vm.form.handleSubmit(async (draft) => {
    const result = await vm.submitMargins(draft);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_save_failed', { field: result.field ?? '' }));
      return;
    }
    toast.success(t('fx_save_pending', { ref: result.approvalId }));
  });

  const handleDiscard = () => {
    if (vm.isDirty && !window.confirm(t('fx_discard_confirm'))) return;
    vm.resetForm();
  };

  return (
    <>
      {vm.pendingApprovalId != null && (
        <div
          className="fs-12"
          style={{
            padding: '10px 14px',
            marginBottom: 16,
            borderRadius: 8,
            background: 'var(--warn-bg, rgba(234, 179, 8, 0.12))',
            border: '1px solid var(--warn-border, rgba(234, 179, 8, 0.35))',
          }}
        >
          {t('fx_pending_banner')}{' '}
          <Link to={`/approvals/${vm.pendingApprovalId}`} className="link">
            {vm.pendingApprovalRef ?? `#${vm.pendingApprovalId}`}
          </Link>
        </div>
      )}

      <DynamicForm
        config={formConfig}
        mode={vm.formDisabled ? FormMode.View : FormMode.Update}
        permissions={{ update: vm.permissions.update, view: vm.permissions.view }}
        customFunctions={customFunctions}
        t={translate}
        header={{
          title: t('s_op_fx'),
          subtitle: t('fx_subtitle'),
          saveLabel: t('ib_save'),
          cancelLabel: t('lf_cancel_back'),
          leading: (
            <Button
              type="button"
              variant="ghost"
              onClick={() => void handleRefresh()}
              disabled={vm.refreshLoading || !vm.permissions.refreshRates}
            >
              <RefreshCw size={14} /> {t('refresh_all')}
            </Button>
          ),
        }}
        onSubmit={() => void handleSave()}
        onCancel={handleDiscard}
      />
    </>
  );
}

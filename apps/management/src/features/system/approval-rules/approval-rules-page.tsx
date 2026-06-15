import { useMemo, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DynamicForm, FormMode, type CustomFunctions } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { getBlockedScreenKeys } from './domain/screen-mutation-guard';
import { canAccessApprovalRules, canUpdateApprovalRules } from './domain/permissions';
import { ApproverWarningDialog } from './components/approver-warning-dialog';
import { FieldsPanel } from './components/fields-panel';
import { ScreensPanel } from './components/screens-panel';
import { useApprovalRules } from './hooks/use-approval-rules';
import { buildApprovalRulesFormConfig } from './approval-rules-form-config';

export function ApprovalRulesPage() {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fb?: string) => string = (k, fb) =>
    t(k, { defaultValue: fb ?? k });
  const { role } = useRole();
  const canEdit = canUpdateApprovalRules(role);
  const vm = useApprovalRules(role);

  const formConfig = useMemo(
    () => buildApprovalRulesFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const blocked = getBlockedScreenKeys();

  const handleSaveScreens = () => {
    const result = vm.saveScreens();
    if (!result.ok) {
      if (result.errorCode === 'ar_screen_save_blocked') return;
      toast.error(t(result.errorCode, result.errorCode));
      return;
    }
    toast.success(t('ar_screens_saved_ok'));
  };

  // `useApprovalRules` her render'da yeni bir nesne döndürür. customFunctions'ı
  // doğrudan vm'e bağlarsak wrapper bileşenlerinin kimliği her render değişir →
  // DynamicForm CustomComponent slot'unu remount eder → ScreensPanel'in mount
  // effect'i setState çağırır → "Maximum update depth exceeded" sonsuz döngüsü.
  // Çözüm: güncel vm/handler'ları ref'te tutup wrapper kimliklerini sabitliyoruz.
  const slotRef = useRef({ vm, canEdit, handleSaveScreens, t });
  slotRef.current = { vm, canEdit, handleSaveScreens, t };

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      components: {
        ScreensPanelWrapper: () => {
          const s = slotRef.current;
          return (
            <ScreensPanel
              rows={s.vm.screens}
              draft={s.vm.screenDraft}
              dirty={s.vm.screenDirty}
              canEdit={s.canEdit}
              onInit={s.vm.initScreenDraft}
              onPatch={s.vm.patchScreenCount}
              onSave={s.handleSaveScreens}
            />
          );
        },
        FieldsPanelWrapper: () => {
          const s = slotRef.current;
          return (
            <FieldsPanel
              rows={s.vm.fields}
              canEdit={s.canEdit}
              editingId={s.vm.fieldEditingId}
              draft={s.vm.fieldDraft}
              onStartNew={s.vm.startNewField}
              onStartEdit={s.vm.startEditField}
              onCancel={s.vm.cancelFieldEdit}
              onPatch={s.vm.patchFieldDraft}
              onSave={s.vm.saveField}
              onDelete={(id) => {
                const r = s.vm.deleteField(id);
                if (r.ok) toast.success(s.t('ar_field_deleted_ok'));
                else toast.error(s.t(r.errorCode ?? 'ar_delete_failed'));
              }}
              onValidate={s.vm.validateField}
            />
          );
        },
      },
    }),
    [],
  );

  if (!canAccessApprovalRules(role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {blocked.length > 0 && (
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
          {t('ar_blocked_banner', { count: blocked.length })}
        </div>
      )}

      <DynamicForm
        config={formConfig}
        mode={canEdit ? FormMode.Update : FormMode.View}
        permissions={{ update: canEdit, view: true }}
        customFunctions={customFunctions}
        t={translate}
        header={{
          title: t('s_sys_approval_rules'),
          subtitle: t('ar_page_subtitle'),
          hidePageHead: false,
        }}
      />

      <ApproverWarningDialog
        open={vm.blockIssues.length > 0}
        issues={vm.blockIssues}
        blocking
        onClose={vm.clearBlockIssues}
      />
    </>
  );
}

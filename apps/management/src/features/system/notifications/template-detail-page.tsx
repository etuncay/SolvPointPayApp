import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, ClipboardList, Play, Save, Settings2 } from 'lucide-react';
import { Button, FormLayout, FormPrimaryActions, PageHead, SectionRail } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { notificationTemplatesService } from './api/mock-notifications-adapter';
import { NotificationTypeBadge } from './components/notification-type-badge';
import { DefinitionTab } from './components/tabs/definition-tab';
import { LogTab } from './components/tabs/log-tab';
import { ManualTriggerTab } from './components/tabs/manual-trigger-tab';
import { canAccessNotifications, canMutateNotifications } from './domain/permissions';
import { useTemplateDetail } from './hooks/use-template-detail';

export function TemplateDetailPage() {
  const { t } = useTranslation();
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { role } = useRole();
  const user = getCurrentUser(role);
  const canEdit = canMutateNotifications(role);
  const vm = useTemplateDetail(role, templateId);
  const [activeSec, setActiveSec] = useState('definition');

  const sections = useMemo(
    () => [
      { id: 'definition', no: '1', label: t('nt_tab_definition') },
      { id: 'manual', no: '2', label: t('nt_tab_manual') },
      { id: 'log', no: '3', label: t('sj_tab_log') },
    ],
    [t],
  );

  if (!canAccessNotifications(role)) {
    return <Navigate to="/" replace />;
  }

  if (vm.loading) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <p className="t-mute">…</p>
      </div>
    );
  }

  if (!vm.template) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('nt_not_found')}</h3>
        <Button type="button" variant="ghost" onClick={() => navigate('/system/notifications')}>
          <ArrowLeft size={14} /> {t('fr_back_list')}
        </Button>
      </div>
    );
  }

  const onSave = async () => {
    const result = notificationTemplatesService.update(
      role,
      user.id,
      vm.template!.id,
      vm.draft,
    );
    if (!result.ok) {
      toast.error(t(result.errorCode, result.errorCode));
      return;
    }
    toast.success(t('nt_saved_ok'));
    vm.bump();
  };

  const onTrigger = async (input: {
    recipientAddress: string;
    recipientDisplayName?: string;
    params: Record<string, string>;
    reason: string;
    scheduledAt?: string;
  }) => {
    const result = await notificationTemplatesService.trigger(
      role,
      user.id,
      vm.template!.id,
      input,
    );
    if (!result.ok) {
      toast.error(t(result.errorCode, result.errorCode));
      return { ok: false, errorCode: result.errorCode };
    }
    toast.success(t('nt_trigger_ok'));
    vm.bump();
    return { ok: true };
  };

  return (
    <>
      <PageHead
        title={vm.template.name}
        subtitle={vm.template.description || '—'}
        status={<NotificationTypeBadge type={vm.template.notificationType} />}
        actions={
          <FormPrimaryActions
            showSave={canEdit}
            onSave={onSave}
            saveLabel={
              <>
                <Save size={14} /> {t('ib_save')}
              </>
            }
            saveDisabled={!vm.dirty}
            showCancel
            onCancel={() => navigate('/system/notifications')}
            cancelLabel={
              <>
                <ArrowLeft size={14} /> {t('fr_back_list')}
              </>
            }
          />
        }
      />

      <FormLayout
        rail={
          <SectionRail
            sections={sections}
            activeId={activeSec}
            title={t('nt_detail_title')}
            onNavigate={setActiveSec}
          />
        }
      >
        {activeSec === 'definition' ? (
          <DefinitionTab
            template={vm.template}
            draft={vm.draft}
            canEdit={canEdit}
            onPatch={vm.patchDraft}
          />
        ) : null}
        {activeSec === 'manual' ? (
          <ManualTriggerTab template={vm.template} canEdit={canEdit} onTrigger={onTrigger} />
        ) : null}
        {activeSec === 'log' ? <LogTab logs={vm.logs} /> : null}
      </FormLayout>
    </>
  );
}

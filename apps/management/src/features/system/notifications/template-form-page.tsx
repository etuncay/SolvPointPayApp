import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { FormLayout, FormPrimaryActions, PageHead } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { notificationTemplatesService } from './api/mock-notifications-adapter';
import { DefinitionTab } from './components/tabs/definition-tab';
import { canMutateNotifications } from './domain/permissions';
import type { CreateTemplateInput, NotificationTemplate } from './domain/types';

export function TemplateFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const user = getCurrentUser(role);
  const [input, setInput] = useState<CreateTemplateInput>({
    name: '',
    notificationType: 'Email',
    subject: '',
    content: 'Merhaba {kullanici_adi}',
    description: '',
  });

  const pseudo: NotificationTemplate = {
    id: '__new__',
    code: '',
    name: input.name,
    notificationType: input.notificationType,
    subject: input.subject,
    content: input.content,
    description: input.description,
    lastTriggeredAt: null,
    createdAt: '',
    updatedAt: '',
  };

  if (!canMutateNotifications(role)) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = () => {
    const result = notificationTemplatesService.create(role, user.id, input);
    if (!result.ok) {
      toast.error(t(result.errorCode, result.errorCode));
      return;
    }
    toast.success(t('nt_created_ok'));
    navigate(`/system/notifications/${result.template.id}`);
  };

  return (
    <>
      <PageHead
        title={t('nt_new_template')}
        subtitle={t('nt_new_subtitle')}
        actions={
          <FormPrimaryActions
            showSave
            onSave={onSubmit}
            saveLabel={
              <>
                <Save size={14} /> {t('sj_create')}
              </>
            }
            saveDisabled={!input.name.trim() || !input.content.trim()}
            showCancel
            onCancel={() => navigate('/system/notifications')}
            cancelLabel={t('fr_back_list')}
          />
        }
      />
      <FormLayout>
        <DefinitionTab
          template={pseudo}
          draft={input}
          canEdit
          onPatch={(patch) => setInput((prev) => ({ ...prev, ...patch }))}
        />
      </FormLayout>
    </>
  );
}

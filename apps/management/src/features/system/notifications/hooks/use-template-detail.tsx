import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { notificationTemplatesService } from '../api/mock-notifications-adapter';
import type { NotificationTemplate, UpdateTemplatePayload } from '../domain/types';

export function useTemplateDetail(role: BackOfficeRole, templateId: string | undefined) {
  const [template, setTemplate] = useState<NotificationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<UpdateTemplatePayload>({});
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => {
    if (!templateId) {
      setTemplate(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = notificationTemplatesService.getById(role, templateId);
    setTemplate(t);
    if (t) {
      setDraft({
        name: t.name,
        notificationType: t.notificationType,
        subject: t.subject,
        content: t.content,
        description: t.description,
      });
    }
    setLoading(false);
  }, [role, templateId, tick]);

  useEffect(() => {
    reload();
  }, [reload]);

  const dirty = useMemo(() => {
    if (!template) return false;
    return JSON.stringify(draft) !== JSON.stringify({
      name: template.name,
      notificationType: template.notificationType,
      subject: template.subject,
      content: template.content,
      description: template.description,
    });
  }, [template, draft]);

  const patchDraft = useCallback((patch: Partial<UpdateTemplatePayload>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  return {
    template,
    draft,
    loading,
    dirty,
    patchDraft,
    bump: () => setTick((n) => n + 1),
    logs: templateId ? notificationTemplatesService.getLogs(role, templateId) : [],
  };
}

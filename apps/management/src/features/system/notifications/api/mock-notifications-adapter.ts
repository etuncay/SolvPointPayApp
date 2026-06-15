import type { BackOfficeRole } from '@epay/ui';
import { appendNotificationLog, getNotificationLogs } from '@/mocks/notification-logs';
import {
  appendNotificationTemplate,
  getNotificationTemplatesStore,
  getTemplateByCodeOrName,
  getTemplateById,
  updateNotificationTemplateRecord,
} from '@/mocks/notification-templates';
import { maskMessage } from '../domain/mask-message';
import { canAccessNotifications, canMutateNotifications } from '../domain/permissions';
import { checkRateLimit, recordSend, resetRateLimitState } from '../domain/rate-limit';
import { renderTemplate } from '../domain/render-template';
import { validateRecipient } from '../domain/validate-recipient';
import { validateTemplateContent } from '../domain/validate-template-content';
import type {
  CreateTemplateInput,
  NotificationLogEntry,
  NotificationTemplate,
  SendTemplateInput,
  TemplateAuditEntry,
  TemplateFilters,
  TriggerTemplateInput,
  UpdateTemplatePayload,
} from '../domain/types';
import type { NotificationTemplatesService } from './notification-templates-service';

let auditLog: TemplateAuditEntry[] = [];

function audit(entry: Omit<TemplateAuditEntry, 'at'>) {
  auditLog = [{ at: new Date('2026-05-25T11:00:00Z').toISOString(), ...entry }, ...auditLog];
}

export function resetNotificationsAuditLog(): void {
  auditLog = [];
}

function validateTriggerReason(reason: string): string | null {
  if (!reason.trim()) return 'rsc_reason_required';
  return null;
}

function performSend(
  template: NotificationTemplate | undefined,
  input: {
    recipientAddress: string;
    recipientDisplayName: string;
    params: Record<string, string>;
    triggeredBy: string;
    manualReason: string | null;
    scheduledAt?: string;
    skipRateLimit?: boolean;
  },
): { ok: true; log: NotificationLogEntry } | { ok: false; errorCode: string } {
  if (!template) return { ok: false, errorCode: 'nt_not_found' };

  const recipientErr = validateRecipient(template.notificationType, input.recipientAddress);
  if (recipientErr) return { ok: false, errorCode: recipientErr };

  const now = Date.now();
  const scheduledMs = input.scheduledAt ? new Date(input.scheduledAt).getTime() : now;
  if (scheduledMs > now + 1000) {
    const body = renderTemplate(template.content, input.params);
    const subjectRendered = template.subject
      ? renderTemplate(template.subject, input.params)
      : '';
    const full = subjectRendered ? `${subjectRendered}\n\n${body}` : body;
    const log = appendNotificationLog({
      createdAt: new Date(now).toISOString(),
      templateId: template.id,
      templateName: template.name,
      notificationType: template.notificationType,
      status: 'Pending',
      recipient: input.recipientDisplayName,
      recipientAddress: input.recipientAddress,
      messageRendered: full,
      messageMasked: maskMessage(
        template.notificationType,
        input.recipientAddress,
        full,
      ),
      manualReason: input.manualReason,
      triggeredBy: input.triggeredBy,
      scheduledAt: new Date(scheduledMs).toISOString(),
    });
    updateNotificationTemplateRecord(template.id, {
      lastTriggeredAt: log.createdAt,
    });
    return { ok: true, log };
  }

  if (!input.skipRateLimit) {
    const rateErr = checkRateLimit(input.recipientAddress, now);
    if (rateErr) return { ok: false, errorCode: rateErr };
  }

  const body = renderTemplate(template.content, input.params);
  const subjectRendered = template.subject ? renderTemplate(template.subject, input.params) : '';
  const full = subjectRendered ? `${subjectRendered}\n\n${body}` : body;
  const log = appendNotificationLog({
    createdAt: new Date(now).toISOString(),
    templateId: template.id,
    templateName: template.name,
    notificationType: template.notificationType,
    status: 'Sent',
    recipient: input.recipientDisplayName,
    recipientAddress: input.recipientAddress,
    messageRendered: full,
    messageMasked: maskMessage(template.notificationType, input.recipientAddress, full),
    manualReason: input.manualReason,
    triggeredBy: input.triggeredBy,
    scheduledAt: null,
  });
  if (!input.skipRateLimit) recordSend(input.recipientAddress, now);
  updateNotificationTemplateRecord(template.id, { lastTriggeredAt: log.createdAt });
  return { ok: true, log };
}

export const notificationTemplatesService: NotificationTemplatesService = {
  list(role, filters) {
    if (!canAccessNotifications(role)) return [];
    let rows = getNotificationTemplatesStore();
    if (filters.type !== 'any') {
      rows = rows.filter((r) => r.notificationType === filters.type);
    }
    if (filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q),
      );
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  },

  getById(role, templateId) {
    if (!canAccessNotifications(role)) return null;
    return getTemplateById(templateId) ?? null;
  },

  create(role, userId, input: CreateTemplateInput) {
    if (!canMutateNotifications(role)) return { ok: false, errorCode: 'sj_forbidden' };
    if (!input.name.trim()) return { ok: false, errorCode: 'nt_name_required' };
    const contentErr = validateTemplateContent(input.content, input.subject);
    if (contentErr) return { ok: false, errorCode: contentErr };
    const code = input.name.trim().toLowerCase().replace(/\s+/g, '_');
    const template = appendNotificationTemplate({
      code,
      name: input.name.trim(),
      notificationType: input.notificationType,
      subject: input.subject,
      content: input.content,
      description: input.description,
    });
    audit({ templateId: template.id, action: 'create', userId });
    return { ok: true, template };
  },

  update(role, userId, templateId, payload: UpdateTemplatePayload) {
    if (!canMutateNotifications(role)) return { ok: false, errorCode: 'sj_forbidden' };
    const before = getTemplateById(templateId);
    if (!before) return { ok: false, errorCode: 'nt_not_found' };
    const content = payload.content ?? before.content;
    const subject = payload.subject ?? before.subject;
    const contentErr = validateTemplateContent(content, subject);
    if (contentErr) return { ok: false, errorCode: contentErr };
    const updated = updateNotificationTemplateRecord(templateId, payload);
    if (!updated) return { ok: false, errorCode: 'nt_not_found' };
    audit({ templateId, action: 'update', userId });
    return { ok: true, template: updated };
  },

  async trigger(role, userId, templateId, input: TriggerTemplateInput) {
    if (!canMutateNotifications(role)) return { ok: false, errorCode: 'sj_forbidden' };
    const reasonErr = validateTriggerReason(input.reason);
    if (reasonErr) return { ok: false, errorCode: reasonErr };
    const template = getTemplateById(templateId);
    if (!template) return { ok: false, errorCode: 'nt_not_found' };
    audit({ templateId, action: 'trigger', userId, reason: input.reason.trim() });
    return performSend(template, {
      recipientAddress: input.recipientAddress,
      recipientDisplayName: input.recipientDisplayName ?? input.recipientAddress,
      params: input.params,
      triggeredBy: userId,
      manualReason: input.reason.trim(),
      scheduledAt: input.scheduledAt,
    });
  },

  getLogs(role, templateId) {
    if (!canAccessNotifications(role)) return [];
    return getNotificationLogs(templateId);
  },

  getAuditLog(templateId) {
    if (templateId) return auditLog.filter((e) => e.templateId === templateId);
    return [...auditLog];
  },
};

/** Tüketici modülleri için programatik gönderim */
export async function sendTemplate(input: SendTemplateInput): Promise<NotificationLogEntry> {
  const template = getTemplateByCodeOrName(input.templateIdOrName);
  const result = performSend(template, {
    recipientAddress: input.recipientAddress,
    recipientDisplayName: input.recipientDisplayName ?? input.recipientAddress,
    params: input.params,
    triggeredBy: input.triggeredBy,
    manualReason: null,
    skipRateLimit: true,
  });
  if (!result.ok) {
    throw new Error(result.errorCode);
  }
  return result.log;
}

export { resetRateLimitState };

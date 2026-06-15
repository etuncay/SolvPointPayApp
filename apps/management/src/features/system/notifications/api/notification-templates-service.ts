import type { BackOfficeRole } from '@epay/ui';
import type {
  CreateTemplateInput,
  NotificationLogEntry,
  SendTemplateInput,
  TemplateAuditEntry,
  TemplateFilters,
  TemplateListRow,
  TriggerTemplateInput,
  UpdateTemplatePayload,
  NotificationTemplate,
} from '../domain/types';

export type NotificationTemplatesService = {
  list(role: BackOfficeRole, filters: TemplateFilters): TemplateListRow[];
  getById(role: BackOfficeRole, templateId: string): NotificationTemplate | null;
  create(
    role: BackOfficeRole,
    userId: string,
    input: CreateTemplateInput,
  ): { ok: true; template: NotificationTemplate } | { ok: false; errorCode: string };
  update(
    role: BackOfficeRole,
    userId: string,
    templateId: string,
    payload: UpdateTemplatePayload,
  ): { ok: true; template: NotificationTemplate } | { ok: false; errorCode: string };
  trigger(
    role: BackOfficeRole,
    userId: string,
    templateId: string,
    input: TriggerTemplateInput,
  ): Promise<{ ok: true; log: NotificationLogEntry } | { ok: false; errorCode: string }>;
  getLogs(role: BackOfficeRole, templateId?: string): NotificationLogEntry[];
  getAuditLog(templateId?: string): TemplateAuditEntry[];
};

export type SendTemplateFn = (input: SendTemplateInput) => Promise<NotificationLogEntry>;

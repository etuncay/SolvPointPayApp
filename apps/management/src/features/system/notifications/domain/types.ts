export type NotificationType = 'SMS' | 'Email' | 'Push';
export type NotificationStatus = 'Pending' | 'Sent' | 'Delivered' | 'Failed';

export interface NotificationTemplate {
  id: string;
  code: string;
  name: string;
  notificationType: NotificationType;
  subject: string;
  content: string;
  description: string;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLogEntry {
  id: string;
  createdAt: string;
  templateId: string;
  templateName: string;
  notificationType: NotificationType;
  status: NotificationStatus;
  recipient: string;
  recipientAddress: string;
  messageRendered: string;
  messageMasked: string;
  manualReason: string | null;
  triggeredBy: string;
  scheduledAt: string | null;
}

export type TemplateListRow = NotificationTemplate;

export interface TemplateFilters {
  query: string;
  type: 'any' | NotificationType;
}

export interface CreateTemplateInput {
  name: string;
  notificationType: NotificationType;
  subject: string;
  content: string;
  description: string;
}

export type UpdateTemplatePayload = Partial<CreateTemplateInput>;

export interface TriggerTemplateInput {
  recipientAddress: string;
  recipientDisplayName?: string;
  params: Record<string, string>;
  reason: string;
  scheduledAt?: string;
}

export interface SendTemplateInput {
  templateIdOrName: string;
  recipientAddress: string;
  recipientDisplayName?: string;
  params: Record<string, string>;
  triggeredBy: string;
}

export interface TemplateAuditEntry {
  at: string;
  templateId: string;
  action: 'create' | 'update' | 'trigger';
  userId: string;
  reason?: string;
}

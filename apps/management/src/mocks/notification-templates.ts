import {
  DEFAULT_NOTIFICATION_TEMPLATES,
  seedDefaultTemplate,
} from '@/features/system/notifications/domain/default-templates';
import type { NotificationTemplate } from '@/features/system/notifications/domain/types';

let store: NotificationTemplate[] = DEFAULT_NOTIFICATION_TEMPLATES.map((d, i) =>
  seedDefaultTemplate(d, i),
);
let nextId = store.length + 1;

export function resetNotificationTemplatesStore(): void {
  store = DEFAULT_NOTIFICATION_TEMPLATES.map((d, i) => seedDefaultTemplate(d, i));
  nextId = store.length + 1;
}

export function getNotificationTemplatesStore(): NotificationTemplate[] {
  return store.map((t) => ({ ...t }));
}

export function getTemplateById(id: string): NotificationTemplate | undefined {
  const t = store.find((x) => x.id === id);
  return t ? { ...t } : undefined;
}

export function getTemplateByCodeOrName(key: string): NotificationTemplate | undefined {
  const k = key.trim().toLowerCase();
  const t = store.find(
    (x) => x.id === key || x.code.toLowerCase() === k || x.name.toLowerCase() === k,
  );
  return t ? { ...t } : undefined;
}

export function appendNotificationTemplate(
  input: Omit<NotificationTemplate, 'id' | 'lastTriggeredAt' | 'createdAt' | 'updatedAt'>,
): NotificationTemplate {
  const now = new Date('2026-05-25T11:00:00Z').toISOString();
  const row: NotificationTemplate = {
    ...input,
    id: `ntpl-${String(nextId++).padStart(3, '0')}`,
    lastTriggeredAt: null,
    createdAt: now,
    updatedAt: now,
  };
  store = [...store, row];
  return row;
}

export function updateNotificationTemplateRecord(
  id: string,
  patch: Partial<NotificationTemplate>,
): NotificationTemplate | undefined {
  const idx = store.findIndex((t) => t.id === id);
  if (idx < 0) return undefined;
  const now = new Date('2026-05-25T11:00:00Z').toISOString();
  const next = { ...store[idx]!, ...patch, updatedAt: now };
  store = [...store.slice(0, idx), next, ...store.slice(idx + 1)];
  return { ...next };
}

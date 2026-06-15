import type { NotificationLogEntry } from '@/features/system/notifications/domain/types';

let logs: NotificationLogEntry[] = [];
let nextId = 1;
const pendingQueue: NotificationLogEntry[] = [];

export function resetNotificationLogs(): void {
  logs = [];
  nextId = 1;
  pendingQueue.length = 0;
}

export function getNotificationLogs(templateId?: string): NotificationLogEntry[] {
  const rows = templateId ? logs.filter((l) => l.templateId === templateId) : [...logs];
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function appendNotificationLog(
  entry: Omit<NotificationLogEntry, 'id'>,
): NotificationLogEntry {
  const row: NotificationLogEntry = {
    ...entry,
    id: `nlog-${String(nextId++).padStart(4, '0')}`,
  };
  logs = [row, ...logs];
  return row;
}

export function enqueuePendingLog(entry: Omit<NotificationLogEntry, 'id' | 'status'>): NotificationLogEntry {
  return appendNotificationLog({ ...entry, status: 'Pending' });
}

export function getPendingQueue(): NotificationLogEntry[] {
  return [...pendingQueue];
}

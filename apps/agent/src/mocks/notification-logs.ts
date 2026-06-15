/** Agent mock bildirim izi — §20 doğrulama için. */

export type AgentNotificationLog = {
  id: string;
  createdAt: string;
  channel: 'SMS' | 'Email';
  templateName: string;
  recipientAddress: string;
  messageRendered: string;
};

let logs: AgentNotificationLog[] = [];
let nextId = 1;

export function resetAgentNotificationLogs(): void {
  logs = [];
  nextId = 1;
}

export function appendAgentNotificationLog(
  entry: Omit<AgentNotificationLog, 'id'>,
): AgentNotificationLog {
  const row: AgentNotificationLog = { ...entry, id: `ag-nlog-${nextId++}` };
  logs = [row, ...logs];
  return row;
}

export function getAgentNotificationLogs(): AgentNotificationLog[] {
  return [...logs];
}

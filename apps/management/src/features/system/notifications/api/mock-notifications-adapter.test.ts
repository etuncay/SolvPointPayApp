import { describe, expect, it, beforeEach } from 'vitest';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { resetNotificationLogs } from '@/mocks/notification-logs';
import { resetNotificationTemplatesStore } from '@/mocks/notification-templates';
import { resetRateLimitState } from '../domain/rate-limit';
import {
  notificationTemplatesService,
  resetNotificationsAuditLog,
  sendTemplate,
} from './mock-notifications-adapter';

describe('notificationTemplatesService', () => {
  beforeEach(() => {
    resetNotificationTemplatesStore();
    resetNotificationLogs();
    resetNotificationsAuditLog();
    resetRateLimitState();
  });

  it('lists seed templates', () => {
    const rows = notificationTemplatesService.list('management', { query: '', type: 'any' });
    expect(rows.length).toBeGreaterThanOrEqual(5);
  });

  it('trigger logs manual reason', async () => {
    const tpl = notificationTemplatesService.list('management', {
      query: 'support_case_opened_email',
      type: 'any',
    })[0]!;
    const result = await notificationTemplatesService.trigger(
      'management',
      MOCK_USER_IDS.management,
      tpl.id,
      {
        recipientAddress: 'ops@epay.local',
        params: { kullanici_adi: 'Test', talep_no: 'SC-1', konu: 'Konu', link: 'https://x' },
        reason: 'Manuel test',
      },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.log.manualReason).toBe('Manuel test');
      expect(result.log.messageRendered).toContain('Test');
    }
  });

  it('sendTemplate export works', async () => {
    const log = await sendTemplate({
      templateIdOrName: 'job_result',
      recipientAddress: 'reports@epay.local',
      params: { is_adi: 'TCMB Batch', link: 'https://epay.local' },
      triggeredBy: 'system',
    });
    expect(log.status).toBe('Sent');
  });
});

import { mockAgentFeesAdapter } from '@/features/agent-fees/api/mock-agent-fees-adapter';
import { mockCustomerCampaignsAdapter } from '@/features/customer-campaigns/api/mock-customer-campaigns-adapter';
import { mockCustomerFeesAdapter } from '@/features/customer-fees/api/mock-customer-fees-adapter';
import { runDailyTcmbReportBatch } from '@/features/reports/api/daily-report-batch';
import type { JobRunContext, JobRunResult } from './types';

export type JobHandler = {
  code: string;
  execute(ctx: JobRunContext): Promise<JobRunResult>;
};

const STUB_OK = (label: string): JobRunResult => ({
  ok: true,
  output: `[stub] ${label} completed`,
});

const handlers: Record<string, JobHandler> = {
  'internal://agent-reconciliation-email': {
    code: 'agent_reconciliation_email',
    async execute() {
      return STUB_OK('agent_reconciliation_email');
    },
  },
  'internal://sanction-screening-monthly': {
    code: 'sanction_screening_monthly',
    async execute() {
      return STUB_OK('sanction_screening_monthly');
    },
  },
  'internal://unblock-expired-entities': {
    code: 'unblock_expired_entities',
    async execute() {
      return STUB_OK('unblock_expired_entities');
    },
  },
  'internal://expire-fees-campaigns': {
    code: 'expire_fees_campaigns',
    async execute() {
      const cf = mockCustomerFeesAdapter.runBatchExpire();
      const cc = mockCustomerCampaignsAdapter.runBatchExpire();
      const af = mockAgentFeesAdapter.runBatchExpire();
      return {
        ok: true,
        output: `expire batch: customerFees=${cf}, campaigns=${cc}, agentFees=${af}`,
      };
    },
  },
  'internal://agent-avg-fee-stats': {
    code: 'agent_avg_fee_stats',
    async execute() {
      return STUB_OK('agent_avg_fee_stats');
    },
  },
  'internal://dms-archive-expired': {
    code: 'dms_archive_expired',
    async execute() {
      return STUB_OK('dms_archive_expired');
    },
  },
  'internal://dms-integrity-monthly': {
    code: 'dms_integrity_monthly',
    async execute() {
      return STUB_OK('dms_integrity_monthly');
    },
  },
  'internal://tcmb-daily-reports': {
    code: 'tcmb_daily_reports',
    async execute(ctx) {
      let reportDate = '2026-05-24';
      try {
        const p = JSON.parse(
          typeof ctx.payload === 'string' ? ctx.payload : JSON.stringify(ctx.payload ?? {}),
        ) as { reportDate?: string };
        if (p.reportDate) reportDate = p.reportDate;
      } catch {
        /* varsayılan tarih */
      }
      const batch = await runDailyTcmbReportBatch(reportDate, ctx.triggeredBy);
      return {
        ok: true,
        output: JSON.stringify(batch),
      };
    },
  },
};

export const JOB_HANDLER_SERVICE_URLS = Object.keys(handlers);

export function getJobHandler(serviceUrl: string): JobHandler | undefined {
  return handlers[serviceUrl];
}

export async function executeJobByServiceUrl(
  serviceUrl: string,
  ctx: JobRunContext,
): Promise<JobRunResult> {
  const handler = getJobHandler(serviceUrl);
  if (!handler) {
    return { ok: false, output: `No handler for ${serviceUrl}` };
  }
  let payload: unknown = ctx.payload;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      payload = {};
    }
  }
  return handler.execute({ ...ctx, payload });
}

import { z } from 'zod';
import { CUSTOMERS } from '@/mocks/data';
import { parseCustomerNo } from '@/features/customer-search/domain/format-customer-no';
import { AGENT_COMPLAINT_TYPES, type AgentComplaintType } from './complaint-type';
import type { FeedbackSubmitPayload } from './types';

const PII_IN_TEXT = /\b\d{11}\b|\b(?:\d[ -]*?){13,19}\b/;

const payloadSchema = z.object({
  requesterOwner: z.enum(['Self', 'Customer']),
  customerNo: z.string().optional(),
  subject: z.string().trim().min(1, 'ag_fb_err_subject'),
  complaintType: z
    .string()
    .refine((v) => AGENT_COMPLAINT_TYPES.includes(v as AgentComplaintType), { message: 'ag_fb_err_type' }),
  detail: z
    .string()
    .trim()
    .min(1, 'ag_fb_err_detail')
    .refine((v) => !PII_IN_TEXT.test(v), { message: 'ag_fb_err_pii' }),
  notes: z
    .string()
    .refine((v) => !v.trim() || !PII_IN_TEXT.test(v), { message: 'ag_fb_err_pii' }),
  documentIds: z.array(z.string()),
});

/** Spec §7 — form gönderim doğrulaması. */
export function validateFeedbackPayload(payload: FeedbackSubmitPayload): string | null {
  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? 'ag_fb_err_validation';
  }

  if (payload.requesterOwner === 'Customer') {
    const no = payload.customerNo?.trim() ?? '';
    if (!no) return 'ag_fb_err_customer_required';
    const id = parseCustomerNo(no);
    if (id == null) return 'ag_fb_err_customer_invalid';
    const customer = CUSTOMERS.find((c) => c.id === id && c.status === 'active');
    if (!customer) return 'ag_fb_err_customer_not_found';
  }

  return null;
}

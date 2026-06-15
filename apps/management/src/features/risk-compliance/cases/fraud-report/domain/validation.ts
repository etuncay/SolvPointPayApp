import { z } from 'zod';
import { isValidFraudNotes } from './notes-pattern';
import type { FraudRecordInput } from './types';

const inputSchema = z.object({
  transactionNo: z.string().trim().min(1, 'frp_tx_required'),
  fraudType: z.union([z.string(), z.literal('')]).optional(),
  detectionSource: z.string().min(1, 'frp_source_required'),
  verdict: z.enum(['Unknown', 'NotFraud', 'ConfirmedFraud', 'PreventedFraud']),
  discoveryAt: z.string().min(1, 'frp_discovery_required'),
  lossAmount: z.number().min(0),
  recoveredAmount: z.number().min(0),
  notes: z.string(),
});

export function validateFraudRecordInput(
  input: FraudRecordInput,
  ctx: { transactionDate: string | null },
): { ok: true } | { ok: false; error: string } {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'frp_invalid' };
  }

  if (!ctx.transactionDate) {
    return { ok: false, error: 'frp_tx_not_found' };
  }

  if (input.verdict === 'NotFraud') {
    if (input.lossAmount !== 0 || input.recoveredAmount !== 0) {
      return { ok: false, error: 'frp_amount_must_be_zero' };
    }
  }

  if (input.verdict === 'ConfirmedFraud') {
    if (input.fraudType == null || String(input.fraudType).trim() === '') {
      return { ok: false, error: 'frp_type_required' };
    }
  }

  const txMs = parseTransactionDate(ctx.transactionDate);
  const discMs = new Date(input.discoveryAt).getTime();
  if (txMs != null && discMs < txMs) {
    return { ok: false, error: 'frp_discovery_before_tx' };
  }

  if (input.notes.trim() && !isValidFraudNotes(input.notes)) {
    return { ok: false, error: 'frp_notes_invalid' };
  }

  return { ok: true };
}

function parseTransactionDate(createdAt: string): number | null {
  const normalized = createdAt.includes('T') ? createdAt : createdAt.replace(' ', 'T');
  const ms = new Date(normalized).getTime();
  return Number.isNaN(ms) ? null : ms;
}

export function toDatetimeLocalValue(isoOrSql: string): string {
  const normalized = isoOrSql.includes('T') ? isoOrSql : isoOrSql.replace(' ', 'T');
  const d = new Date(normalized);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

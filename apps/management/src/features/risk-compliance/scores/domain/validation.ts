import { z } from 'zod';
import type { ManualChangeInput } from './types';

const manualSchema = z.object({
  newScore: z.number().min(0, 'rsc_score_range').max(100, 'rsc_score_range'),
  reason: z.string().trim().min(1, 'rsc_reason_required'),
});

export function validateManualChange(input: ManualChangeInput): { ok: true } | { ok: false; error: string } {
  const parsed = manualSchema.safeParse(input);
  if (!parsed.success) {
    const code = parsed.error.issues[0]?.message ?? 'rsc_invalid';
    return { ok: false, error: code };
  }
  return { ok: true };
}

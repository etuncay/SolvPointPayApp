import { z } from 'zod';
import type { AgentGroupInput, AgentGroupUpdateInput } from './types';

const createSchema = z.object({
  groupCode: z
    .string()
    .min(2, 'agg_code_required')
    .regex(/^[A-Z0-9_]+$/, 'agg_code_format'),
  name: z.string().min(1, 'agg_name_required'),
  description: z.string(),
});

const updateSchema = z.object({
  name: z.string().min(1, 'agg_name_required'),
  description: z.string(),
});

export function validateAgentGroupInput(input: AgentGroupInput): string | null {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? 'agg_validation_failed';
  }
  return null;
}

export function validateAgentGroupUpdate(input: AgentGroupUpdateInput): string | null {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? 'agg_validation_failed';
  }
  return null;
}

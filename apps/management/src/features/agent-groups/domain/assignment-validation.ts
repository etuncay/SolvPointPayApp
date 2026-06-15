import { z } from 'zod';

const assignSchema = z.object({
  agentId: z.number().int().positive('aga_agent_required'),
});

export function validateAssignAgent(agentId: number): string | null {
  const parsed = assignSchema.safeParse({ agentId });
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? 'aga_validation_failed';
  }
  return null;
}

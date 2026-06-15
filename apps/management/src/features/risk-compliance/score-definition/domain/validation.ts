import { z } from 'zod';

export const riskScoreRuleInputSchema = z.object({
  title: z.string().trim().min(1, 'rs_title_required'),
  conditionDsl: z.string().trim().min(1, 'rs_dsl_invalid'),
  scoreContribution: z.number({ invalid_type_error: 'rs_score_numeric' }).finite('rs_score_numeric'),
  description: z.string().nullable().optional(),
  validatedAt: z.string().nullable().optional(),
});

export type RiskScoreRuleInputParsed = z.infer<typeof riskScoreRuleInputSchema>;

export function parseRiskScoreRuleInput(input: unknown) {
  return riskScoreRuleInputSchema.safeParse(input);
}

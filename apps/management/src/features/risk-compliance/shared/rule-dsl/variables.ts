export type RiskScoreScope = 'Customer' | 'Agent' | 'Transaction';

/** 7.4.1 fraud kural kapsamı */
export type FraudDslScope = 'Onboarding' | 'Remittance';

export const RISK_SCORE_SCOPES: RiskScoreScope[] = ['Customer', 'Agent', 'Transaction'];

export const SCOPE_VARIABLES: Record<RiskScoreScope, readonly string[]> = {
  Customer: ['riskScore', 'kycLevel', 'pepFlag', 'monthlyVolume', 'country', 'status'],
  Agent: ['dailyVolume', 'anomalyScore', 'branchCount', 'status', 'txToday'],
  Transaction: ['amount', 'country', 'isForeign', 'channel', 'hour', 'currency'],
};

/** Fraud DSL — kapsam bazlı değişkenler */
export const FRAUD_SCOPE_VARIABLES: Record<FraudDslScope, readonly string[]> = {
  Onboarding: [
    'pepFlag',
    'kycLevel',
    'deviceCount',
    'customerAgeDays',
    'blacklistMatch',
    'status',
    'country',
  ],
  Remittance: [
    'amount',
    'country',
    'hour',
    'transferCount24h',
    'dailyLimitExceeded',
    'ipRiskScore',
    'sameReceiverCount',
    'anomalyScore',
    'agentDailyVolume',
    'txPerHour',
    'blacklistMatch',
    'currency',
    'channel',
  ],
};

export const DSL_KEYWORDS = ['AND', 'OR', 'NOT', 'true', 'false'] as const;

export function isAllowedIdentifier(token: string, scope: RiskScoreScope): boolean {
  const upper = token.toUpperCase();
  if (DSL_KEYWORDS.includes(upper as (typeof DSL_KEYWORDS)[number])) return true;
  if (DSL_KEYWORDS.includes(token as (typeof DSL_KEYWORDS)[number])) return true;
  return SCOPE_VARIABLES[scope].includes(token);
}

export function isAllowedFraudIdentifier(token: string, scope: FraudDslScope): boolean {
  const upper = token.toUpperCase();
  if (DSL_KEYWORDS.includes(upper as (typeof DSL_KEYWORDS)[number])) return true;
  if (DSL_KEYWORDS.includes(token as (typeof DSL_KEYWORDS)[number])) return true;
  return FRAUD_SCOPE_VARIABLES[scope].includes(token);
}

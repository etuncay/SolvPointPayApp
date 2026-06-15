/** Fraud aksiyonları — 7.4 / 7.4.1 paylaşımlı */

export const ALL_FRAUD_ACTIONS = [
  'Allow',
  'Block',
  'CreateCase',
  'Hold',
  'Notify',
  'AddRisk',
  'NotifyCustomer',
  'ContactCustomer',
  'ForcePasswordReset',
  'AddExtraVerification',
  'TerminateSessions',
] as const;

export type FraudAction = (typeof ALL_FRAUD_ACTIONS)[number];

/** Skor tanımlama ekranında gösterilecek aksiyonlar */
export const FRAUD_ACTIONS_SCORE_DEF: FraudAction[] = ALL_FRAUD_ACTIONS.filter(
  (a) => a !== 'AddRisk',
);

/** Allow ile birlikte seçilemeyen aksiyonlar — spec §6 */
export const ALLOW_INCOMPATIBLE: FraudAction[] = [
  'Block',
  'ForcePasswordReset',
  'AddExtraVerification',
  'TerminateSessions',
  'ContactCustomer',
];

const CONFLICT_PAIRS: [FraudAction, FraudAction][] = [['Allow', 'Block']];

/** Allow + Block aynı sette olamaz */
export function hasActionConflict(actions: readonly FraudAction[]): boolean {
  const set = new Set(actions);
  if (CONFLICT_PAIRS.some(([a, b]) => set.has(a) && set.has(b))) return true;
  if (set.has('Allow')) {
    return ALLOW_INCOMPATIBLE.some((a) => set.has(a));
  }
  return false;
}

export function filterConflictingActions(actions: FraudAction[]): FraudAction[] {
  if (!hasActionConflict(actions)) return actions;
  const hasBlock = actions.includes('Block');
  if (hasBlock) return actions.filter((a) => a !== 'Allow');
  return actions.filter((a) => !ALLOW_INCOMPATIBLE.includes(a) || a === 'Allow');
}

/**
 * §0.11 — İşlem onayından SONRA çalışabilen (Near-Real-Time / Inform) aksiyonlar.
 * Yalnızca bu küme onay sonrası işletilebilir.
 */
export const NRT_FRAUD_ACTIONS: FraudAction[] = ['AddRisk', 'NotifyCustomer', 'ContactCustomer'];

/** Kuralın tüm aksiyonları NRT kümesindeyse kural işlem onayından SONRA (NRT/Inform) çalışır. */
export function isNearRealTimeRule(actions: readonly FraudAction[]): boolean {
  return actions.length > 0 && actions.every((a) => NRT_FRAUD_ACTIONS.includes(a));
}

/** Aksi halde (en az bir Block/RT aksiyonu) kural işlem ÖNCESİ (Real-Time/Block) çalışır. */
export function isRealTimeRule(actions: readonly FraudAction[]): boolean {
  return !isNearRealTimeRule(actions);
}

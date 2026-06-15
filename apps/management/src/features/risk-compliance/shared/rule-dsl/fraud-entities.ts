/**
 * Fraud kural motoru — Entity / Attribute kataloğu (GenelIsleyis "Rules / Entities / Attributes").
 * Kurallar `Entity.Attribute` veya pencereli `Entity.Attribute(gün)` sözdizimiyle yazılır.
 */

export const FRAUD_ENTITIES = [
  'Sender',
  'Receiver',
  'SenderAgent',
  'ReceiverAgent',
  'Transaction',
] as const;
export type FraudEntity = (typeof FRAUD_ENTITIES)[number];

/** windows tanımlıysa attribute `(gün)` ister; tanımlı değilse düz attribute'tur. */
export type FraudAttrSpec = { name: string; windows?: number[] };

/** Customer (Sender / Receiver) öznitelikleri */
const CUSTOMER_ATTRS: FraudAttrSpec[] = [
  { name: 'Id' },
  { name: 'Type' },
  { name: 'BirthCountry' },
  { name: 'AddressCountry' },
  { name: 'Nationality' },
  { name: 'IncomeDeclared' },
  { name: 'Occupation' },
  { name: 'PhonePrefix' },
  { name: 'EmailDomain' },
  { name: 'RiskCategory' },
  { name: 'PreviousRiskCategory' },
  { name: 'CustomerBalance' },
  { name: 'AccountType' },
  { name: 'AccountAge' },
  { name: 'LastContactInfoChangeDate' },
  { name: 'LastTxDate' },
  { name: 'IsAddressVerified' },
  { name: 'IP' },
  { name: 'LinkedCustomersCount' },
  { name: 'DeviceCountToday' },
  { name: 'SameDeviceCustomerCountToday' },
  { name: 'IPCountToday' },
  { name: 'SameIPCustomerCountToday' },
  { name: 'EODBalanceAvg', windows: [30] },
  { name: 'SendingTxCount', windows: [1, 7, 30] },
  { name: 'ReceivingTxCount', windows: [1, 7, 30] },
  { name: 'TxCountLastHour' },
  { name: 'SendingAmountTotal', windows: [1, 7, 30] },
  { name: 'ReceivingAmountTotal', windows: [1, 7, 30] },
  { name: 'SendingAmountLastHour' },
  { name: 'ReceivingAmountLastHour' },
  { name: 'SendingAmountAvg', windows: [1, 7, 30] },
  { name: 'ReceivingAmountAvg', windows: [1, 7, 30] },
  { name: 'SendingAmountStdDev', windows: [30] },
  { name: 'IncomingFlatAmountShare', windows: [30] },
  { name: 'ComplaintCount', windows: [30] },
  { name: 'ManualReviewCount', windows: [30] },
  { name: 'ChargebackCount', windows: [30] },
  { name: 'ImpossibleTravel' },
  { name: 'FailedLoginAttemptsLastHour' },
  { name: 'UniqueReceiverCount', windows: [1, 7, 30] },
  { name: 'UniqueSenderCount', windows: [1, 7, 30] },
];

/** Agent (SenderAgent / ReceiverAgent) öznitelikleri */
const AGENT_ATTRS: FraudAttrSpec[] = [
  { name: 'Id' },
  { name: 'Country' },
  { name: 'City' },
  { name: 'RiskCategory' },
  { name: 'TxCountDays', windows: [1, 7, 30] },
  { name: 'TxCountLastHour' },
  { name: 'AmountTotal', windows: [1, 7, 30] },
  { name: 'AmountAvg', windows: [1, 7, 30] },
  { name: 'ComplaintCount', windows: [30] },
  { name: 'ManualReviewCount', windows: [30] },
  { name: 'ChargebackCount', windows: [30] },
];

/** Transaction öznitelikleri */
const TX_ATTRS: FraudAttrSpec[] = [
  { name: 'Amount' },
  { name: 'Currency' },
  { name: 'Date' },
  { name: 'Time' },
  { name: 'Type' },
  { name: 'Status' },
  { name: 'Description' },
  { name: 'Channel' },
];

export const FRAUD_ENTITY_ATTRS: Record<FraudEntity, FraudAttrSpec[]> = {
  Sender: CUSTOMER_ATTRS,
  Receiver: CUSTOMER_ATTRS,
  SenderAgent: AGENT_ATTRS,
  ReceiverAgent: AGENT_ATTRS,
  Transaction: TX_ATTRS,
};

/** Fonksiyonlar + zaman operatörleri (GenelIsleyis "Operators") */
export const FRAUD_FUNCTIONS = [
  'ABS',
  'ROUND',
  'LOWER',
  'UPPER',
  'COALESCE',
  'FLOOR',
  'NOW',
  'DATEDIFF',
  'TIMEDIFF',
  'WITHINLAST',
  'BETWEEN',
] as const;

/** Metin operatörleri */
export const FRAUD_TEXT_OPS = ['CONTAINS', 'STARTSWITH', 'ENDSWITH', 'REGEXMATCH'] as const;

/** Referans listeleri (IN/NOT IN ile okunabilir) */
export const FRAUD_REFERENCE_LISTS = [
  'RiskyCountries',
  'RiskyPhonePrefixes',
  'RiskyEmailProviders',
  'RiskyCities',
  'UsuallyUsedCurrencies',
  'BlacklistedKeywords',
  'RiskyAgents',
  'RiskyCustomers',
  'RiskyCredentials',
  'RiskyIPs',
  'RiskyOccupations',
] as const;

/** `Entity.Attribute(window?)` referansını doğrular; hata kodu veya null döner. */
export function validateEntityRef(
  entity: string,
  attribute: string,
  window: number | null,
): string | null {
  if (!(FRAUD_ENTITIES as readonly string[]).includes(entity)) {
    return `frd_dsl_unknown_entity:${entity}`;
  }
  const specs = FRAUD_ENTITY_ATTRS[entity as FraudEntity];
  const spec = specs.find((s) => s.name === attribute);
  if (!spec) return `frd_dsl_unknown_attr:${entity}.${attribute}`;
  if (spec.windows) {
    if (window == null) return `frd_dsl_window_required:${entity}.${attribute}`;
    if (!spec.windows.includes(window)) {
      return `frd_dsl_bad_window:${entity}.${attribute}(${window})`;
    }
  } else if (window != null) {
    return `frd_dsl_window_not_allowed:${entity}.${attribute}`;
  }
  return null;
}

/** UI ipucu için kapsam vokabüleri */
export function fraudEntityHint(): string {
  return FRAUD_ENTITIES.join(', ');
}

/** Playground / IndexedDB müşteri kaydı durumları (PascalCase — API sözleşmesi) */
export const PLAYGROUND_CUSTOMER_STATUSES = ['Active', 'Passive', 'Blocked', 'Pending'] as const;
export type PlaygroundCustomerStatus = (typeof PLAYGROUND_CUSTOMER_STATUSES)[number];

/** Backoffice liste/form varlık durumu (küçük harf) */
export const ENTITY_LIFECYCLE_STATUSES = ['active', 'inactive', 'blocked', 'closed'] as const;
export type EntityLifecycleStatus = (typeof ENTITY_LIFECYCLE_STATUSES)[number];

/** DMS / belge inceleme — aday müşteri dahil */
export const ENTITY_LIFECYCLE_WITH_PROSPECT = [
  ...ENTITY_LIFECYCLE_STATUSES,
  'prospect',
] as const;
export type EntityLifecycleStatusWithProspect = (typeof ENTITY_LIFECYCLE_WITH_PROSPECT)[number];

export type EntityStatusFilter = EntityLifecycleStatus | 'all';
export type EntityStatusFilterWithProspect = EntityLifecycleStatusWithProspect | 'all';

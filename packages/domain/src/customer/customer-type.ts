export const CUSTOMER_TYPES = ['individual', 'corporate'] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

/** DMS / belge inceleme — aday müşteri dahil */
export const DOCUMENT_CUSTOMER_TYPES = ['individual', 'corporate', 'prospective'] as const;
export type DocumentCustomerType = (typeof DOCUMENT_CUSTOMER_TYPES)[number];

export function isDocumentCustomerType(value: string): value is DocumentCustomerType {
  return (DOCUMENT_CUSTOMER_TYPES as readonly string[]).includes(value);
}

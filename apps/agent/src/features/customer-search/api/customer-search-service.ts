import { mockCustomerSearchAdapter, type CustomerSearchService } from './mock-customer-search-adapter';

/** Gerçek API bağlandığında burada adapter değiştirilir. */
export const customerSearchService: CustomerSearchService = mockCustomerSearchAdapter;

export type { CustomerSearchService };

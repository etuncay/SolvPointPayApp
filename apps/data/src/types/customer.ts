/** IndexedDB'de saklanan playground müşteri kaydı */
import type { CustomerType, PlaygroundCustomerStatus } from '@epay/domain';
import { CUSTOMER_TYPES, PLAYGROUND_CUSTOMER_STATUSES } from '@epay/domain';

export type { CustomerType, PlaygroundCustomerStatus as CustomerStatus };
export { CUSTOMER_TYPES, PLAYGROUND_CUSTOMER_STATUSES as CUSTOMER_STATUSES };

export interface CustomerRecord {
  id: string;
  name: string;
  type: CustomerType;
  status: PlaygroundCustomerStatus;
  email: string;
  phone: string;
  city: string;
  kycLevel: string;
  riskScore: number;
  balance: number;
  createdAt: string;
  /** Form alanları — düzenleme için */
  customerType?: string;
  firstName?: string;
  lastName?: string;
  tradeName?: string;
  taxNo?: string;
  tckn?: string;
  birthDate?: string;
  country?: string;
  address?: string;
  language?: string;
  smsNotify?: boolean;
  emailNotify?: boolean;
  monthlyLimit?: number;
  notes?: string;
}

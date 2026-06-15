import { CustomerKycPill } from '@epay/ui';
import type { CustomerListItem } from './types';

export function KycPill({ customer: c }: { customer: CustomerListItem }) {
  return <CustomerKycPill kyc={c.kyc} customerType={c.type} />;
}

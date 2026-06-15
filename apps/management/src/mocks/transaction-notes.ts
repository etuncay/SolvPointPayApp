import { buildBackOfficeTransactionDetails } from '@epay/data';
import { TRANSACTIONS } from './transactions';

const seed = buildBackOfficeTransactionDetails({ transactions: TRANSACTIONS });

export type TransactionNoteSeed = (typeof seed.notes)[number] & { formatted?: string };
export const TRANSACTION_NOTES = seed.notes;

import { buildBackOfficeTransactionDetails } from '@epay/data';
import { TRANSACTIONS } from './transactions';

const seed = buildBackOfficeTransactionDetails({ transactions: TRANSACTIONS });

export type TransactionDocumentSeed = (typeof seed.documents)[number];
export const TRANSACTION_DOCUMENTS = seed.documents;

import { buildBackOfficeTransactionDetails } from '@epay/data';
import { TRANSACTIONS } from './transactions';

const seed = buildBackOfficeTransactionDetails({ transactions: TRANSACTIONS });

export type TransactionBlockSeed = (typeof seed.blocks)[number];
export const TRANSACTION_BLOCKS = seed.blocks;

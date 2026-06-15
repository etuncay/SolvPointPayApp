import { mockWithdrawalAdapter, type WithdrawalService } from './mock-withdrawal-adapter';

/** Gerçek API bağlandığında burada adapter değiştirilir. */
export const withdrawalService: WithdrawalService = mockWithdrawalAdapter;

export type { WithdrawalService };

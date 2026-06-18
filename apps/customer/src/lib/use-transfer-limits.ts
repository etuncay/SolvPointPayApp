import { useQuery } from '@tanstack/react-query';
import { customerPortalApi } from '@epay/data';
import { validateAmount } from '@/lib/validators';

/** Self-servis transferler — müşteri `internetDailyLimit` (mock + production sözleşmesi). */
export function useTransferLimits() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => customerPortalApi.getSettings(),
  });

  const internetDailyLimit = settings?.internetDailyLimit ?? 25_000;

  function validateTransferTotal(total: number, balance: number): string | null {
    return validateAmount(total, balance, internetDailyLimit);
  }

  return { internetDailyLimit, validateTransferTotal };
}

import type { CurrencyCode } from '../wallet/currency';

export interface TransferCurrencyOption {
  code: CurrencyCode;
  name: string;
  symbol: string;
}

export const TRANSFER_CURRENCY_OPTIONS: readonly TransferCurrencyOption[] = [
  { code: 'TRY', name: 'Türk Lirası', symbol: '₺' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
] as const;

import type { CurrencyCode, TransferDraftInput, TransferKind } from '@epay/data';

export interface TransferPrefill {
  recipientName?: string;
  phone?: string;
  email?: string;
  country?: string;
  purpose?: string;
  customerNo?: string;
}

export function parseAmount(raw: string): number {
  const n = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/** Düzenle akışında draft tutarını giriş alanına geri yazmak için (TR ondalık) */
export function amountToInput(n: number | undefined): string {
  if (!n) return '';
  return String(n).replace('.', ',');
}

export function buildDraft(
  kind: TransferKind,
  title: string,
  sourceWalletId: string,
  currency: CurrencyCode,
  symbol: string,
  amount: number,
  fee: number,
  fields: {
    recipientName: string;
    recipientCustomerNo?: string;
    phone?: string;
    email?: string;
    country: string;
    purpose: string;
    description?: string;
    iban?: string;
    bank?: string;
    dstCurrency?: CurrencyCode;
    fxRate?: number;
    netAmount?: number;
    dstSymbol?: string;
  },
): TransferDraftInput {
  return {
    kind,
    title,
    sourceWalletId,
    recipientName: fields.recipientName,
    recipientCustomerNo: fields.recipientCustomerNo,
    phone: fields.phone,
    email: fields.email,
    country: fields.country,
    currency,
    symbol,
    amount,
    fee,
    total: amount + fee,
    purpose: fields.purpose,
    description: fields.description,
    iban: fields.iban,
    bank: fields.bank,
    srcCurrency: currency,
    dstCurrency: fields.dstCurrency,
    fxRate: fields.fxRate,
    netAmount: fields.netAmount,
    dstSymbol: fields.dstSymbol,
  };
}

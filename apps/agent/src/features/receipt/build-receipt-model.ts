import type { TransactionDetail } from '@/features/transaction-confirmation/domain/transaction-detail';
import type { ConfirmationView } from '@/features/transaction-confirmation/domain/types';
import { fmtNumber } from '@/lib/format';
import { receiptLegalText, type ReceiptLang } from '@epay/data';

/** Tam sayı tutarı yazıya çevirir (mock dekont için, milyona kadar). */
const TR_ONES = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const TR_TENS = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
const EN_ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const EN_TEEN = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function trBelowThousand(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(h === 1 ? 'yüz' : `${TR_ONES[h]} yüz`);
  if (rest >= 10) parts.push(TR_TENS[Math.floor(rest / 10)]!);
  if (rest % 10 > 0) parts.push(TR_ONES[rest % 10]!);
  return parts.join(' ').trim();
}

function enBelowThousand(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(`${EN_ONES[h]} hundred`);
  if (rest >= 20) {
    parts.push(EN_TENS[Math.floor(rest / 10)]!);
    if (rest % 10 > 0) parts.push(EN_ONES[rest % 10]!);
  } else if (rest >= 10) {
    parts.push(EN_TEEN[rest - 10]!);
  } else if (rest > 0) {
    parts.push(EN_ONES[rest]!);
  }
  return parts.join(' ').trim();
}

function amountInWords(amount: number, lang: string): string {
  const n = Math.floor(Math.abs(amount));
  if (n === 0) return lang === 'en' ? 'zero' : 'sıfır';
  if (lang === 'ar') return String(n);

  const isTr = lang !== 'en';
  const below = isTr ? trBelowThousand : enBelowThousand;
  const millionWord = isTr ? 'milyon' : 'million';
  const thousandWord = isTr ? 'bin' : 'thousand';

  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];

  if (millions > 0) parts.push(`${below(millions)} ${millionWord}`);
  if (thousands > 0) {
    if (isTr && thousands === 1) parts.push(thousandWord);
    else parts.push(`${below(thousands)} ${thousandWord}`);
  }
  if (rest > 0) parts.push(below(rest));

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function resolveSendingPoint(view: ConfirmationView): string | null {
  return (
    (view.agentRole === 'Sender' ? view.detail.senderAgent?.name : view.detail.receiverAgent?.name) ??
    view.detail.senderAgent?.name ??
    view.detail.receiverAgent?.name ??
    null
  );
}

const COMPANY = {
  name: 'Paragram Ödeme Kuruluşu A.Ş.',
  email: 'info@pgpara.com',
  website: 'www.pgpara.com',
  brand: 'PGpara',
  taxOffice: 'Boğaziçi Kurumlar V.D.',
  taxNo: '1234567890',
  address: 'Maslak Mah. Büyükdere Cad. No:255, Sarıyer / İstanbul',
  phone: '+90 212 555 00 00',
};

export type ReceiptModel = {
  lang: ReceiptLang;
  dir: 'ltr' | 'rtl';
  company: typeof COMPANY;
  dateTime: string;
  receiptNo: string;
  partnerRefNo: string | null;
  sendingPoint: string | null;
  receiver: { name: string; identityNo: string | null; tel: string | null; address: string | null };
  sender: { name: string; tel: string | null };
  payment: { country: string | null; city: string | null; amount: string; amountWords: string; currency: string };
  details: {
    transactionType: string;
    paymentPurpose: string | null;
    iban: string | null;
    fixedFee: string;
    proportionalFee: string;
    totalFee: string;
    totalPaid: string;
    exchangeRate: string | null;
    targetCurrency: string | null;
    netAmount: string | null;
    description: string | null;
  };
  legalText: string;
  qrUrl: string;
};

function maskIdentity(idNo: string | null): string | null {
  if (!idNo) return null;
  const clean = idNo.trim();
  if (clean.length <= 3) return '***';
  return `${clean.slice(0, 2)}${'*'.repeat(Math.max(2, clean.length - 3))}${clean.slice(-1)}`;
}

/** TransactionDetail → dekont alanları (docs/Sablonlar/dekont-sablonu.md eşleme). */
export function buildReceiptModel(
  detail: TransactionDetail,
  sendingPoint: string | null,
  lang: ReceiptLang,
  legalText: string,
): ReceiptModel {
  const isFx = detail.sourceCurrency !== detail.targetCurrency;
  const totalFee = detail.feeFixed + detail.feeVariable;
  const totalPaid = detail.principalAmount + totalFee;

  return {
    lang,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    company: COMPANY,
    dateTime: detail.createdAt,
    receiptNo: detail.transactionNo,
    partnerRefNo: detail.foreignReferenceNo,
    sendingPoint,
    receiver: {
      name: detail.receiver.name,
      identityNo: maskIdentity(detail.receiver.idNo),
      tel: detail.receiver.phone,
      address: detail.receiver.city,
    },
    sender: {
      name: detail.sender.name,
      tel: detail.sender.phone,
    },
    payment: {
      country: detail.receiver.city ?? detail.sender.city,
      city: detail.receiver.city,
      amount: fmtNumber(detail.principalAmount, lang),
      amountWords: amountInWords(detail.principalAmount, lang),
      currency: detail.sourceCurrency,
    },
    details: {
      transactionType: detail.transactionType,
      paymentPurpose: detail.paymentPurpose,
      iban: detail.receiver.iban ?? detail.sender.iban,
      fixedFee: fmtNumber(detail.feeFixed, lang),
      proportionalFee: fmtNumber(detail.feeVariable, lang),
      totalFee: fmtNumber(totalFee, lang),
      totalPaid: `${fmtNumber(totalPaid, lang)} ${detail.sourceCurrency}`,
      exchangeRate: isFx && detail.fxRate != null ? String(detail.fxRate) : null,
      targetCurrency: isFx ? detail.targetCurrency : null,
      netAmount: isFx && detail.targetAmount != null ? `${fmtNumber(detail.targetAmount, lang)} ${detail.targetCurrency}` : null,
      description: detail.description,
    },
    legalText,
    qrUrl: `https://contracts.pgpara.com/v1/receipt/${detail.transactionNo}`,
  };
}

/** ConfirmationView → dekont modeli (yazdırma sayfası). */
export function buildReceiptModelFromView(view: ConfirmationView, lang: ReceiptLang): ReceiptModel {
  return buildReceiptModel(view.detail, resolveSendingPoint(view), lang, receiptLegalText(lang));
}

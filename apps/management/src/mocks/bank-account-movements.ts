import { mulberry32 } from '@/lib/format';
import type {
  BankAccountMovement,
  BankTransferMethod,
  PaymentStatus,
} from '@/features/banks/movements/domain/types';

const rand = mulberry32(633);

const FIRMA_IBANS = {
  ziraat: 'TR330006100519786457841326',
  garanti: 'TR320006200000000001234567',
  ziraatProt: 'TR020006100519786457841399',
  isEur: 'TR610006400000000098765432',
} as const;

const BANK_BY_IBAN: Record<string, string> = {
  [FIRMA_IBANS.ziraat]: 'Ziraat Bankası',
  [FIRMA_IBANS.garanti]: 'Garanti BBVA',
  [FIRMA_IBANS.ziraatProt]: 'Ziraat Bankası',
  [FIRMA_IBANS.isEur]: 'Türkiye İş Bankası',
};

const FIRMA_IBAN_LIST = Object.values(FIRMA_IBANS);
const EXTERNAL_IBANS = [
  'TR760006200000000012345601',
  'TR640006400000000098765401',
  'TR330006100519786457841325',
];
const EXTERNAL_BANKS = ['Akbank', 'Yapı Kredi', 'Denizbank', 'QNB Finansbank'];

const STATUSES: PaymentStatus[] = ['Pending', 'Completed', 'Failed', 'Returned'];
const METHODS: BankTransferMethod[] = ['EFT', 'FAST', 'SWIFT', 'Internal'];
const CCYS = ['TRY', 'USD', 'EUR'] as const;

const NAMES = [
  'Ahmet Yılmaz',
  'Ayşe Demir',
  'Mehmet Kaya',
  'Fatma Çelik',
  'ACME Lojistik A.Ş.',
  'Beta Teknoloji Ltd.',
];

function bankForIban(iban: string): string {
  return BANK_BY_IBAN[iban] ?? EXTERNAL_BANKS[Math.abs(iban.length) % EXTERNAL_BANKS.length]!;
}

function ts(daysAgo: number, hour: number): string {
  const d = new Date(2026, 4, 23 - daysAgo, hour, 30, 0);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

function buildMovement(
  id: number,
  partial: Partial<BankAccountMovement> & Pick<BankAccountMovement, 'bankTransactionNo'>,
): BankAccountMovement {
  const sourceIban = partial.sourceIban ?? FIRMA_IBANS.ziraat;
  const targetIban = partial.targetIban ?? EXTERNAL_IBANS[0]!;
  const transactionDate = partial.transactionDate ?? ts(1, 10);
  return {
    id,
    sourceBank: partial.sourceBank ?? bankForIban(sourceIban),
    targetBank: partial.targetBank ?? bankForIban(targetIban),
    sourceIban,
    targetIban,
    currency: partial.currency ?? 'TRY',
    amount: partial.amount ?? 10_000,
    paymentStatus: partial.paymentStatus ?? 'Completed',
    bankTransferMethod: partial.bankTransferMethod ?? 'EFT',
    createdAt: partial.createdAt ?? transactionDate,
    transactionDate,
    referenceNo: partial.referenceNo ?? `REF-${id}`,
    name: partial.name ?? NAMES[id % NAMES.length]!,
    taxNo: partial.taxNo ?? `${1000000000 + id}`,
    bankTransactionNo: partial.bankTransactionNo,
    description: partial.description ?? `Hareket ${id}`,
    errorMessage: partial.errorMessage ?? null,
    recordStatus: partial.recordStatus ?? 1,
  };
}

function generateSeed(): BankAccountMovement[] {
  const rows: BankAccountMovement[] = [];
  let id = 1;

  for (let i = 0; i < 72; i++) {
    const daysAgo = Math.floor(rand() * 90);
    const hour = 8 + Math.floor(rand() * 10);
    const outflow = rand() > 0.5;
    const sourceIban = outflow
      ? FIRMA_IBAN_LIST[Math.floor(rand() * FIRMA_IBAN_LIST.length)]!
      : EXTERNAL_IBANS[Math.floor(rand() * EXTERNAL_IBANS.length)]!;
    const targetIban = outflow
      ? EXTERNAL_IBANS[Math.floor(rand() * EXTERNAL_IBANS.length)]!
      : FIRMA_IBAN_LIST[Math.floor(rand() * FIRMA_IBAN_LIST.length)]!;
    const status = STATUSES[Math.floor(rand() * STATUSES.length)]!;
    const method = METHODS[Math.floor(rand() * METHODS.length)]!;
    const currency = CCYS[Math.floor(rand() * CCYS.length)]!;
    const amount = Math.round((rand() * 500_000 + 100) * 100) / 100;
    const transactionDate = ts(daysAgo, hour);

    let errorMessage: string | null = null;
    if (status === 'Failed') {
      errorMessage =
        rand() > 0.5
          ? 'Yetersiz bakiye — banka reddetti.'
          : 'IBAN doğrulama hatası (mock).';
    }

    rows.push(
      buildMovement(id++, {
        sourceIban,
        targetIban,
        sourceBank: bankForIban(sourceIban),
        targetBank: bankForIban(targetIban),
        currency,
        amount,
        paymentStatus: status,
        bankTransferMethod: method,
        transactionDate,
        createdAt: ts(daysAgo + 1, hour),
        bankTransactionNo: `BTX-2026-${String(10000 + i).padStart(5, '0')}`,
        description:
          status === 'Failed'
            ? `Temsilci avans REF-AG-${100 + i} — başarısız`
            : `Ödeme REF-AG-${100 + i}`,
        errorMessage,
        referenceNo: `REF-2026-${String(2000 + i)}`,
      }),
    );
  }

  rows.push(
    buildMovement(id++, {
      bankTransactionNo: 'BTX-INGEST-DUP',
      sourceBank: 'Ziraat Bankası',
      targetBank: 'Garanti BBVA',
      sourceIban: FIRMA_IBANS.ziraat,
      targetIban: FIRMA_IBANS.garanti,
      transactionDate: '2026-05-15 09:00:00',
      paymentStatus: 'Completed',
      amount: 50_000,
      referenceNo: 'REF-INGEST-DUP',
    }),
  );

  rows.push(
    buildMovement(id++, {
      bankTransactionNo: 'BTX-SOFT-DELETED',
      sourceBank: 'Ziraat Bankası',
      targetIban: EXTERNAL_IBANS[0]!,
      transactionDate: '2026-01-01 00:00:00',
      recordStatus: 0,
    }),
  );

  return rows;
}

export const BANK_ACCOUNT_MOVEMENTS_SEED: BankAccountMovement[] = generateSeed();

/** Vitest ingest duplicate vektörü */
export const BANK_MOVEMENT_INGEST_DUP_PAYLOAD = {
  sourceBank: 'Ziraat Bankası',
  targetBank: 'Garanti BBVA',
  sourceIban: FIRMA_IBANS.ziraat,
  targetIban: FIRMA_IBANS.garanti,
  currency: 'TRY' as const,
  amount: 99_999,
  paymentStatus: 'Completed' as const,
  bankTransferMethod: 'EFT' as const,
  createdAt: '2026-05-16 10:00:00',
  transactionDate: '2026-05-15 09:00:00',
  referenceNo: 'REF-INGEST-RETRY',
  name: 'Tekrar Deneme',
  taxNo: '1111111111',
  bankTransactionNo: 'BTX-INGEST-DUP',
  description: 'Mükerrer ingest test',
  errorMessage: null,
};

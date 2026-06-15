import { TRANSACTIONS } from '@/mocks/transactions';

/** Menü 5.1 deep-link — seed'teki ilk aktif işlem */
export const TRANSFER_MENU_DEMO_ID =
  TRANSACTIONS.find((t) => t.recordStatus === 1)?.id ?? 1;

export const TRANSFER_MENU_DETAIL_HREF = `/transfers/${TRANSFER_MENU_DEMO_ID}`;

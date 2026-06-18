import type { SavedRecipient, TransferDraftInput } from '../types/customer-portal';
import { getDb } from './dexie';
import { upsertRecipientOverlay } from './customer-recipient-overlay';

export type RecipientCreateInput = Omit<
  SavedRecipient,
  'id' | 'recordStatus' | 'createdAt' | 'updatedAt'
>;

export function newRecipientId(): string {
  return `r-${Date.now()}`;
}

export function recipientInputFromTransferDraft(draft: TransferDraftInput): RecipientCreateInput {
  return {
    label: draft.recipientName,
    name: draft.recipientName,
    country: draft.country,
    isIntl: draft.kind === 'intl',
    phone: draft.phone,
    email: draft.email,
    customerNo: draft.recipientCustomerNo,
    purpose: draft.purpose,
    description: draft.description,
  };
}

export function buildSavedRecipient(
  input: RecipientCreateInput,
  id: string = newRecipientId(),
): SavedRecipient {
  const now = new Date().toISOString();
  return {
    ...input,
    id,
    recordStatus: 1,
    createdAt: now,
    updatedAt: now,
  };
}

export async function persistSavedRecipient(recipient: SavedRecipient): Promise<SavedRecipient> {
  await getDb().customerRecipients.put(recipient);
  upsertRecipientOverlay(recipient);
  return recipient;
}

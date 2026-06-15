import type {
  BackOfficeTransactionBlock,
  BackOfficeTransactionDetailSeed,
  BackOfficeTransactionDocument,
  BackOfficeTransactionNote,
} from '../types/transaction-detail';

let notes: BackOfficeTransactionNote[] = [];
let documents: BackOfficeTransactionDocument[] = [];
let blocks: BackOfficeTransactionBlock[] = [];

export async function hydrateBackOfficeTransactionDetails(
  seed: BackOfficeTransactionDetailSeed,
): Promise<void> {
  notes = seed.notes.map((n) => ({ ...n }));
  documents = seed.documents.map((d) => ({ ...d }));
  blocks = seed.blocks.map((b) => ({ ...b }));
}

export async function listTransactionNotes(
  transactionId?: number,
): Promise<BackOfficeTransactionNote[]> {
  if (transactionId == null) return notes.map((n) => ({ ...n }));
  return notes.filter((n) => n.transactionId === transactionId).map((n) => ({ ...n }));
}

export async function listTransactionDocuments(
  transactionId?: number,
): Promise<BackOfficeTransactionDocument[]> {
  if (transactionId == null) return documents.map((d) => ({ ...d }));
  return documents.filter((d) => d.transactionId === transactionId).map((d) => ({ ...d }));
}

export async function listTransactionBlocks(
  transactionId?: number,
): Promise<BackOfficeTransactionBlock[]> {
  if (transactionId == null) return blocks.map((b) => ({ ...b }));
  return blocks.filter((b) => b.transactionId === transactionId).map((b) => ({ ...b }));
}

export async function getActiveTransactionBlock(
  transactionId: number,
): Promise<BackOfficeTransactionBlock | undefined> {
  return blocks.find((b) => b.transactionId === transactionId && b.active);
}

export async function upsertTransactionNote(
  note: BackOfficeTransactionNote,
): Promise<BackOfficeTransactionNote> {
  const idx = notes.findIndex((n) => n.id === note.id);
  if (idx >= 0) notes[idx] = { ...note };
  else notes = [...notes, { ...note }];
  return note;
}

export async function upsertTransactionBlock(
  block: BackOfficeTransactionBlock,
): Promise<BackOfficeTransactionBlock> {
  const idx = blocks.findIndex((b) => b.id === block.id);
  if (idx >= 0) blocks[idx] = { ...block };
  else blocks = [...blocks, { ...block }];
  return block;
}

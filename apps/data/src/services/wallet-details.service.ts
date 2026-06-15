import type {
  BackOfficeWalletDetailSeed,
  BackOfficeWalletLimit,
  BackOfficeWalletLimitHistory,
  BackOfficeWalletMovement,
  BackOfficeWalletNote,
} from '../types/wallet-detail';

let notes: BackOfficeWalletNote[] = [];
let limits: BackOfficeWalletLimit[] = [];
let limitHistory: BackOfficeWalletLimitHistory[] = [];
let movements: BackOfficeWalletMovement[] = [];

export async function hydrateBackOfficeWalletDetails(
  seed: BackOfficeWalletDetailSeed,
): Promise<void> {
  notes = seed.notes.map((n) => ({ ...n }));
  limits = seed.limits.map((l) => ({ ...l }));
  limitHistory = seed.limitHistory.map((h) => ({ ...h }));
  movements = seed.movements.map((m) => ({ ...m }));
}

export async function listWalletNotes(walletId?: number): Promise<BackOfficeWalletNote[]> {
  if (walletId == null) return notes.map((n) => ({ ...n }));
  return notes.filter((n) => n.walletId === walletId).map((n) => ({ ...n }));
}

export async function listWalletLimits(walletId?: number): Promise<BackOfficeWalletLimit[]> {
  if (walletId == null) return limits.map((l) => ({ ...l }));
  return limits.filter((l) => l.walletId === walletId).map((l) => ({ ...l }));
}

export async function listWalletLimitHistory(
  walletId?: number,
): Promise<BackOfficeWalletLimitHistory[]> {
  if (walletId == null) return limitHistory.map((h) => ({ ...h }));
  return limitHistory.filter((h) => h.walletId === walletId).map((h) => ({ ...h }));
}

export async function listWalletMovements(walletId?: number): Promise<BackOfficeWalletMovement[]> {
  if (walletId == null) return movements.map((m) => ({ ...m }));
  return movements.filter((m) => m.walletId === walletId).map((m) => ({ ...m }));
}

export async function upsertWalletNote(note: BackOfficeWalletNote): Promise<BackOfficeWalletNote> {
  const idx = notes.findIndex((n) => n.id === note.id);
  if (idx >= 0) notes[idx] = { ...note };
  else notes = [...notes, { ...note }];
  return note;
}

export async function upsertWalletLimit(limit: BackOfficeWalletLimit): Promise<BackOfficeWalletLimit> {
  const idx = limits.findIndex((l) => l.id === limit.id);
  if (idx >= 0) limits[idx] = { ...limit };
  else limits = [...limits, { ...limit }];
  return limit;
}

export async function appendWalletLimitHistory(
  entry: BackOfficeWalletLimitHistory,
): Promise<BackOfficeWalletLimitHistory> {
  limitHistory = [...limitHistory, { ...entry }];
  return entry;
}

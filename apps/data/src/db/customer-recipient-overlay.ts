import type { SavedRecipient } from '../types/customer-portal';
import type { EPayDataDB } from './dexie';

const STORAGE_KEY = 'epay.customer.recipient-overlay';

export interface RecipientOverlay {
  upserts: SavedRecipient[];
  deletedIds: string[];
}

function emptyOverlay(): RecipientOverlay {
  return { upserts: [], deletedIds: [] };
}

export function readRecipientOverlay(): RecipientOverlay {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RecipientOverlay;
        if (Array.isArray(parsed.upserts) && Array.isArray(parsed.deletedIds)) {
          return parsed;
        }
      }
    }
  } catch {
    /* private mode / parse error */
  }
  return emptyOverlay();
}

function writeRecipientOverlay(overlay: RecipientOverlay): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay));
    }
  } catch {
    /* private mode */
  }
}

/** CRUD veya transfer kaydet sonrası — seed yenilemesinde korunur. */
export function upsertRecipientOverlay(recipient: SavedRecipient): void {
  const overlay = readRecipientOverlay();
  overlay.deletedIds = overlay.deletedIds.filter((id) => id !== recipient.id);
  const idx = overlay.upserts.findIndex((r) => r.id === recipient.id);
  if (idx >= 0) overlay.upserts[idx] = recipient;
  else overlay.upserts.push(recipient);
  writeRecipientOverlay(overlay);
}

/** Soft-delete — seed alıcıları dahil. */
export function deleteRecipientInOverlay(id: string): void {
  const overlay = readRecipientOverlay();
  if (!overlay.deletedIds.includes(id)) overlay.deletedIds.push(id);
  overlay.upserts = overlay.upserts.filter((r) => r.id !== id);
  writeRecipientOverlay(overlay);
}

export function resetRecipientOverlay(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* private mode */
  }
}

/** Dexie seed yazımından sonra overlay uygula (re-seed sonrası kullanıcı değişiklikleri). */
export async function applyRecipientOverlay(db: EPayDataDB): Promise<void> {
  const overlay = readRecipientOverlay();
  if (overlay.upserts.length === 0 && overlay.deletedIds.length === 0) return;

  const deleted = new Set(overlay.deletedIds);
  const now = new Date().toISOString();

  for (const id of overlay.deletedIds) {
    const existing = await db.customerRecipients.get(id);
    if (existing) {
      await db.customerRecipients.put({
        ...existing,
        recordStatus: 0,
        updatedAt: now,
      });
    }
  }

  for (const recipient of overlay.upserts) {
    if (!deleted.has(recipient.id)) {
      await db.customerRecipients.put(recipient);
    }
  }
}

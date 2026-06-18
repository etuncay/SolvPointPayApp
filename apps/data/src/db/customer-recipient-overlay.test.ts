import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SavedRecipient } from '../types/customer-portal';
import {
  deleteRecipientInOverlay,
  readRecipientOverlay,
  resetRecipientOverlay,
  upsertRecipientOverlay,
} from './customer-recipient-overlay';

const sample: SavedRecipient = {
  id: 'r-custom',
  label: 'Test Kişi',
  name: 'Test Kişi',
  country: 'Türkiye',
  isIntl: false,
  recordStatus: 1,
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

describe('customer recipient overlay', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    resetRecipientOverlay();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    });
  });

  it('starts empty', () => {
    expect(readRecipientOverlay()).toEqual({ upserts: [], deletedIds: [] });
  });

  it('persists upserts across reads', () => {
    upsertRecipientOverlay(sample);
    expect(readRecipientOverlay().upserts).toHaveLength(1);
    expect(readRecipientOverlay().upserts[0]?.id).toBe('r-custom');
  });

  it('tracks soft-deleted seed ids', () => {
    upsertRecipientOverlay(sample);
    deleteRecipientInOverlay('r1');
    const overlay = readRecipientOverlay();
    expect(overlay.deletedIds).toContain('r1');
    expect(overlay.upserts).toHaveLength(1);
  });

  it('removes deleted custom recipient from upserts', () => {
    upsertRecipientOverlay(sample);
    deleteRecipientInOverlay('r-custom');
    expect(readRecipientOverlay().upserts).toHaveLength(0);
    expect(readRecipientOverlay().deletedIds).toContain('r-custom');
  });

  it('re-upsert clears deleted flag for same id', () => {
    deleteRecipientInOverlay('r1');
    upsertRecipientOverlay({ ...sample, id: 'r1', label: 'Geri geldi' });
    const overlay = readRecipientOverlay();
    expect(overlay.deletedIds).not.toContain('r1');
    expect(overlay.upserts.find((r) => r.id === 'r1')?.label).toBe('Geri geldi');
  });
});

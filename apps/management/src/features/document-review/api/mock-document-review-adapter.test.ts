import { describe, expect, it, beforeEach, vi } from 'vitest';
import { REVIEW_DOCUMENTS } from '@/mocks/document-review-queue';
import {
  getDocumentReviewLog,
  mockDocumentReviewAdapter,
  resetDocumentReviewStore,
} from './mock-document-review-adapter';
import { DEFAULT_QUEUE_FILTERS } from '../domain/types';

describe('mockDocumentReviewAdapter', () => {
  beforeEach(() => {
    resetDocumentReviewStore();
    vi.stubGlobal('confirm', () => true);
  });

  it('kuyrukta yalnızca Pending + approvalRequired belgeler', () => {
    const rows = mockDocumentReviewAdapter.listReviewQueue('compliance', DEFAULT_QUEUE_FILTERS);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.approvalRequired && r.approvalStatus === 'Pending')).toBe(true);
  });

  it('sıralama: şüpheli+yabancı önce gelir', () => {
    const rows = mockDocumentReviewAdapter.listReviewQueue('compliance', DEFAULT_QUEUE_FILTERS);
    const first = rows[0];
    expect(first?.suspiciousFlag && first.nationality !== 'TUR').toBe(true);
  });

  it('ops Identity belgesini görmez', () => {
    const rows = mockDocumentReviewAdapter.listReviewQueue('ops', DEFAULT_QUEUE_FILTERS);
    expect(rows.some((r) => r.category === 'Identity')).toBe(false);
    expect(rows.some((r) => r.category === 'ProofOfAddress')).toBe(true);
  });

  it('kategori filtresi uygulanır', () => {
    const rows = mockDocumentReviewAdapter.listReviewQueue('compliance', {
      ...DEFAULT_QUEUE_FILTERS,
      category: 'LegalEntity',
    });
    expect(rows.every((r) => r.category === 'LegalEntity')).toBe(true);
  });

  it('müşteri no ve belge türü filtreleri uygulanır', () => {
    const byCustomer = mockDocumentReviewAdapter.listReviewQueue('compliance', {
      ...DEFAULT_QUEUE_FILTERS,
      customerNo: 'MUS-099901',
    });
    expect(byCustomer.length).toBeGreaterThan(0);
    expect(byCustomer.every((r) => r.customerNo === 'MUS-099901')).toBe(true);

    const byType = mockDocumentReviewAdapter.listReviewQueue('compliance', {
      ...DEFAULT_QUEUE_FILTERS,
      documentType: 'Pasaport',
    });
    expect(byType.every((r) => r.documentType === 'Pasaport')).toBe(true);
  });

  it('Pending dışı inceleme durumu kuyrukta sonuç döndürmez', () => {
    const approved = mockDocumentReviewAdapter.listReviewQueue('compliance', {
      ...DEFAULT_QUEUE_FILTERS,
      approvalStatus: 'Approved',
    });
    expect(approved).toHaveLength(0);
  });

  it('onay sonrası belge kuyruktan düşer', () => {
    const pending = REVIEW_DOCUMENTS.find((d) => d.category === 'ProofOfAddress')!;
    const before = mockDocumentReviewAdapter.listReviewQueue('ops', DEFAULT_QUEUE_FILTERS);
    expect(before.some((r) => r.id === pending.id)).toBe(true);

    const result = mockDocumentReviewAdapter.approve(pending.id, 'ops', {
      kycStatus: 'unchanged',
      entityStatus: 'active',
      comment: 'Onay',
    });
    expect(result.ok).toBe(true);

    const after = mockDocumentReviewAdapter.listReviewQueue('ops', DEFAULT_QUEUE_FILTERS);
    expect(after.some((r) => r.id === pending.id)).toBe(false);
    expect(getDocumentReviewLog().some((l) => l.documentId === pending.id && l.decision === 'approve')).toBe(true);
  });

  it('red sonrası belge kuyruktan düşer', () => {
    const pending = REVIEW_DOCUMENTS.find((d) => d.id === 5010)!;
    const result = mockDocumentReviewAdapter.reject(pending.id, 'ops', {
      kycStatus: 'unchanged',
      comment: 'Red',
    });
    expect(result.ok).toBe(true);
    const after = mockDocumentReviewAdapter.listReviewQueue('ops', DEFAULT_QUEUE_FILTERS);
    expect(after.some((r) => r.id === 5010)).toBe(false);
  });

  it('ek belge iste belge statüsünü değiştirmez, yeni Pending kayıt ekler', () => {
    const pending = REVIEW_DOCUMENTS.find((d) => d.id === 5002)!;
    const detailBefore = mockDocumentReviewAdapter.getDocumentDetail(pending.id, 'ops');
    const queueBefore = mockDocumentReviewAdapter.listReviewQueue('ops', DEFAULT_QUEUE_FILTERS).length;

    const result = mockDocumentReviewAdapter.requestAdditional(pending.id, 'ops', {
      category: 'ProofOfFunds',
      documentType: 'Maaş Bordrosu',
      comment: 'Ek belge',
    });
    expect(result.ok).toBe(true);

    const detailAfter = mockDocumentReviewAdapter.getDocumentDetail(pending.id, 'ops');
    expect(detailAfter?.document.approvalStatus).toBe(detailBefore?.document.approvalStatus);

    const queueAfter = mockDocumentReviewAdapter.listReviewQueue('compliance', DEFAULT_QUEUE_FILTERS);
    expect(queueAfter.length).toBeGreaterThan(queueBefore);
  });

  it('compliance olmayan rol Identity onaylayamaz', () => {
    const identity = REVIEW_DOCUMENTS.find((d) => d.category === 'Identity')!;
    const result = mockDocumentReviewAdapter.approve(identity.id, 'ops', {
      kycStatus: 'unchanged',
      entityStatus: 'active',
      comment: 'Onay',
    });
    expect(result.ok).toBe(false);
  });
});

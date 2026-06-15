import { describe, expect, it, beforeEach } from 'vitest';
import { getCaseDetailProfile } from '@/mocks/case-detail-profiles';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { fraudRulesService } from '@/features/risk-compliance/fraud-rules/api';
import { __resetFraudRulesStoreForTest } from '@/features/risk-compliance/fraud-rules/api/mock-fraud-rules-adapter';
import {
  mockFraudCasesAdapter,
  __resetFraudCasesStoreForTest,
  __getCaseActionLogs,
} from './mock-fraud-cases-adapter';

describe('mockFraudCasesAdapter detail', () => {
  beforeEach(() => {
    __resetFraudCasesStoreForTest();
    __resetFraudRulesStoreForTest();
  });

  it('getDetail C-1001 — shared panel when linkedCount>0', () => {
    const d = mockFraudCasesAdapter.getDetail('C-1001', 'compliance');
    expect(d?.linkedCustomersCount).toBeGreaterThan(0);
    expect(d?.sharedContact).not.toBeNull();
  });

  it('getDetail C-1002 — agent panel hidden', () => {
    const d = mockFraudCasesAdapter.getDetail('C-1002', 'compliance');
    expect(d?.agent).toBeNull();
  });

  it('getDetail C-1001 — 7.5.2 full attribute panels', () => {
    const d = mockFraudCasesAdapter.getDetail('C-1001', 'compliance');
    expect(d).not.toBeNull();
    // Panel 3 — müşteri işlem geçmişi (pencereli attribute kataloğu)
    expect(d!.txMetrics.length).toBeGreaterThanOrEqual(30);
    expect(d!.txMetrics.some((m) => m.label === 'SendingTxCount(7)')).toBe(true);
    expect(d!.txMetrics.some((m) => m.label === 'EODBalanceAvg(30)')).toBe(true);
    // Panel 4 — erişim bilgileri (8 sinyal)
    expect(d!.accessSignals.length).toBe(8);
    expect(d!.accessSignals.some((s) => s.label === 'ImpossibleTravel')).toBe(true);
    // Panel 1 — genişletilmiş müşteri künyesi
    expect(d!.customer.riskCategory).toBeTruthy();
    expect(d!.customer.occupation).toBeTruthy();
    expect(d!.customer.addressVerified).toBeTruthy();
  });

  it('profile generates full agent metric catalog (Panel 5)', () => {
    const p = getCaseDetailProfile('C-1001');
    expect(p.agentMetrics.length).toBeGreaterThanOrEqual(10);
    expect(p.agentMetrics.some((m) => m.label === 'TxCountDays(30)')).toBe(true);
    expect(p.agentMetrics.some((m) => m.label === 'AmountAvg(7)')).toBe(true);
  });

  it('agentMetrics gated on agent presence', () => {
    // C-1002 — temsilci paneli gizli → metrik yok
    expect(mockFraudCasesAdapter.getDetail('C-1002', 'compliance')?.agentMetrics).toEqual([]);
    // Temsilcili bir vaka varsa metrik seti dolu olmalı (default profilli vakalar)
    const withAgent = ['C-1004', 'C-1005', 'C-1006', 'C-1007', 'C-1008', 'C-1009', 'C-1010']
      .map((id) => mockFraudCasesAdapter.getDetail(id, 'compliance'))
      .find((d) => d?.agent);
    if (withAgent) expect(withAgent.agentMetrics.length).toBeGreaterThanOrEqual(10);
  });

  it('approve no comment — fail', () => {
    const r = mockFraudCasesAdapter.approve(
      'C-1001',
      { comment: '' },
      'compliance',
      'operator',
    );
    expect(r.ok).toBe(false);
    expect(r.error).toBe('fcd_comment_required');
  });

  it('operator can route; manager cannot', () => {
    expect(
      mockFraudCasesAdapter.route(
        'C-1001',
        { comment: 'assign', targetUserId: MOCK_USER_IDS.compliance },
        'compliance',
        'operator',
      ).ok,
    ).toBe(true);
    expect(
      mockFraudCasesAdapter.route(
        'C-1003',
        { comment: 'assign', targetUserId: MOCK_USER_IDS.compliance },
        'compliance',
        'manager',
      ).ok,
    ).toBe(false);
  });

  it('exception — fraud-rules store', () => {
    const before = fraudRulesService.getDetail('FR-001', 'compliance')?.exceptions.length ?? 0;
    const r = mockFraudCasesAdapter.addException(
      'C-1001',
      { customerNo: '99901', expiresAt: '2026-12-31', note: 'test exc' },
      'compliance',
      'operator',
    );
    expect(r.ok).toBe(true);
    const after = fraudRulesService.getDetail('FR-001', 'compliance')?.exceptions.length ?? 0;
    expect(after).toBe(before + 1);
    expect(__getCaseActionLogs('C-1001').some((l) => l.action === 'exception')).toBe(true);
  });

  it('closed case — actions forbidden', () => {
    mockFraudCasesAdapter.reject(
      'C-1001',
      { comment: 'close' },
      'compliance',
      'operator',
    );
    const r = mockFraudCasesAdapter.approve(
      'C-1001',
      { comment: 'retry' },
      'compliance',
      'operator',
    );
    expect(r.error).toBe('fcd_case_closed');
  });
});

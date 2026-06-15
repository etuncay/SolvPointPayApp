import type { ApprovalPayload, ApprovalRequest } from '@/features/approval-pool/domain/types';
import { getCatalogEntry } from '@/features/system/parameters/domain/parameter-catalog';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { deriveUiStatus } from '@/features/approval-pool/domain/ui-status';

const U = MOCK_USER_IDS;

function payload(
  screenKey: string,
  screenName: string,
  changes: ApprovalPayload['changes'],
  extra: Partial<ApprovalPayload> = {},
): ApprovalPayload {
  return {
    screenKey,
    summary: screenName,
    changes,
    raw: { screenKey },
    ...extra,
  };
}

/** 12.4 sistem parametresi onay diff'i — bridge ile aynı şema */
function parameterPayload(
  parameterKey: string,
  oldValue: string,
  newValue: string,
  oldStatus: 'Active' | 'Passive' = 'Active',
  newStatus: 'Active' | 'Passive' = oldStatus,
): ApprovalPayload {
  const changes: ApprovalPayload['changes'] = [
    { field: 'value', label: parameterKey, oldValue, newValue },
  ];
  if (newStatus !== oldStatus) {
    changes.push({
      field: 'status',
      label: `${parameterKey} (status)`,
      oldValue: oldStatus,
      newValue: newStatus,
    });
  }
  const entry = getCatalogEntry(parameterKey);
  const newValues = entry
    ? {
        parameterKey: entry.parameterKey,
        groupName: entry.groupName,
        valueType: entry.valueType,
        description: entry.descriptionKey,
        value: newValue,
        status: newStatus,
      }
    : { parameterKey, value: newValue, status: newStatus };
  const oldValues = entry
    ? {
        parameterKey: entry.parameterKey,
        groupName: entry.groupName,
        valueType: entry.valueType,
        description: entry.descriptionKey,
        value: oldValue,
        status: oldStatus,
      }
    : { parameterKey, value: oldValue, status: oldStatus };
  return {
    screenKey: 'system_parameters',
    formKey: 'system_parameter',
    summary: entry?.descriptionKey ?? parameterKey,
    changes,
    newValues,
    oldValues,
    raw: { parameterKey, parameterId: `prm-seed-${parameterKey}` },
  };
}

function base(
  id: number,
  ref: string,
  screenName: string,
  screenKey: string,
  requiredApprovals: 1 | 2,
  initiatedBy: string,
  initiatedByName: string,
  daysAgo: number,
  partial: Partial<ApprovalRequest> = {},
): ApprovalRequest {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const initiatedAt = d.toISOString();
  const r: ApprovalRequest = {
    id,
    referenceNo: ref,
    screenName,
    payload: payload(screenKey, screenName, [
      { field: 'amount', label: 'Tutar', oldValue: '50.000', newValue: '110.198' },
    ]),
    requiredApprovals,
    initiatedBy,
    initiatedByName,
    initiatedAt,
    firstApprover: null,
    firstApproverName: null,
    firstApprovalAt: null,
    firstStatus: 'Pending',
    secondApprover: requiredApprovals === 2 ? U.management : null,
    secondApproverName: requiredApprovals === 2 ? 'Mehmet Şahin' : null,
    secondApprovalAt: null,
    secondStatus: requiredApprovals === 2 ? null : null,
    uiStatus: 'awaiting_first',
    previousApprovalRef: null,
    comment: null,
    ...partial,
  };
  if (requiredApprovals === 2 && r.secondStatus === null && r.firstStatus === 'Approved') {
    r.secondStatus = 'Pending';
  }
  r.uiStatus = deriveUiStatus(r);
  return r;
}

/** §8 test senaryoları için onay seed */
export const APPROVAL_REQUESTS: ApprovalRequest[] = [
  // 1-onaylı bekleyen (compliance)
  base(1, 'APR-008421', 'AML Onayı', 'TRF_AML', 1, U.ops, 'Ahmet Yılmaz', 0),
  // 2-onaylı — 1. onay bekliyor
  base(2, 'APR-008422', 'İade Onayı', 'REFUND', 2, U.ops, 'Ahmet Yılmaz', 1),
  // 2-onaylı — 2. onay bekliyor
  base(3, 'APR-008423', 'Bayi Limit Artışı', 'AGENT_LIMIT', 2, U.ops, 'Ahmet Yılmaz', 2, {
    firstStatus: 'Approved',
    firstApprover: U.compliance,
    firstApproverName: 'Ayşe Demir',
    firstApprovalAt: new Date(Date.now() - 86400000).toISOString(),
    secondStatus: 'Pending',
  }),
  // 1-onaylı onaylandı
  base(4, 'APR-008424', 'Parametre Değişikliği', 'system_parameters', 1, U.ops, 'Ahmet Yılmaz', 3, {
    firstStatus: 'Approved',
    firstApprover: U.compliance,
    firstApproverName: 'Ayşe Demir',
    firstApprovalAt: new Date(Date.now() - 172800000).toISOString(),
    payload: parameterPayload('reconciliation.amount_tolerance_try', '0.01', '0.05'),
  }),
  // 1-onaylı reddedildi
  base(5, 'APR-008425', 'Yüksek Risk Müşteri', 'HIGH_RISK', 1, U.ops, 'Ahmet Yılmaz', 4, {
    firstStatus: 'Rejected',
    firstApprover: U.compliance,
    firstApproverName: 'Ayşe Demir',
    firstApprovalAt: new Date(Date.now() - 259200000).toISOString(),
    comment: 'Risk skoru yetersiz',
    lastActionBy: U.compliance,
  }),
  // 2. kademe reddetti
  base(6, 'APR-008426', 'Müşteri Ücreti', 'customer_fee', 2, U.ops, 'Ahmet Yılmaz', 5, {
    firstStatus: 'Approved',
    firstApprover: U.compliance,
    firstApproverName: 'Ayşe Demir',
    firstApprovalAt: new Date(Date.now() - 345600000).toISOString(),
    secondStatus: 'Rejected',
    secondApprover: U.management,
    secondApproverName: 'Mehmet Şahin',
    secondApprovalAt: new Date(Date.now() - 340000000).toISOString(),
    comment: 'Limit aşımı',
    lastActionBy: U.management,
  }),
  // 2-onaylı tam onaylandı
  base(7, 'APR-008427', 'Kampanya Ataması', 'CAMPAIGN', 2, U.ops, 'Ahmet Yılmaz', 6, {
    firstStatus: 'Approved',
    firstApprover: U.compliance,
    firstApproverName: 'Ayşe Demir',
    firstApprovalAt: new Date(Date.now() - 432000000).toISOString(),
    secondStatus: 'Approved',
    secondApprover: U.management,
    secondApproverName: 'Mehmet Şahin',
    secondApprovalAt: new Date(Date.now() - 430000000).toISOString(),
    lastActionBy: U.management,
  }),
  // Geri çekilmiş
  base(8, 'APR-008428', 'Temsilci Bloke', 'AGENT_BLOCK', 1, U.ops, 'Ahmet Yılmaz', 1, {
    uiStatus: 'withdrawn',
    firstStatus: 'Pending',
    lastActionBy: U.ops,
  }),
  // Superseded (eski zincir)
  base(9, 'APR-008419', 'Parametre (eski)', 'system_parameters', 1, U.ops, 'Ahmet Yılmaz', 10, {
    uiStatus: 'superseded',
    firstStatus: 'Rejected',
    firstApprover: U.compliance,
    firstApproverName: 'Ayşe Demir',
    firstApprovalAt: new Date(Date.now() - 864000000).toISOString(),
    payload: parameterPayload('treasury.reserve_max_amount_try', '5000000', '8000000'),
  }),
  // Yeniden gönderilmiş (önceki ref=9)
  base(10, 'APR-008429', 'Parametre Değişikliği', 'system_parameters', 1, U.ops, 'Ahmet Yılmaz', 0, {
    previousApprovalRef: 9,
    payload: parameterPayload('treasury.reserve_max_amount_try', '5000000', '6500000'),
  }),
  base(11, 'APR-008430', 'Transfer Limit', 'XFER_LIMIT', 2, U.ops, 'Ahmet Yılmaz', 0),
  base(12, 'APR-008431', 'Döviz Kuru', 'FX_RATE', 1, U.compliance, 'Ayşe Demir', 2),
  base(13, 'APR-008432', 'AML İnceleme', 'TRF_AML', 2, U.ops, 'Ahmet Yılmaz', 3, {
    firstStatus: 'Approved',
    firstApprover: U.compliance,
    firstApproverName: 'Ayşe Demir',
    firstApprovalAt: new Date(Date.now() - 120000000).toISOString(),
    secondStatus: 'Pending',
  }),
  base(14, 'APR-009001', 'Manuel Risk Skoru', 'risk_manual_score', 1, U.compliance, 'Ayşe Demir', 0, {
    payload: {
      screenKey: 'risk_manual_score',
      summary: 'Demo Müşteri — skor 68 → 75',
      changes: [
        { field: 'score', label: 'Risk skoru', oldValue: '68', newValue: '75' },
        { field: 'reason', label: 'Gerekçe', oldValue: '—', newValue: 'Periyodik AML gözden geçirme' },
      ],
      raw: {
        source: 'Customer',
        entityId: '10042',
        entityKey: 'Customer:10042',
        displayName: 'Demo Müşteri — Yüksek Risk',
        oldScore: 68,
        newScore: 75,
        reason: 'Periyodik AML gözden geçirme',
      },
    },
  }),
  // 8.1 §8 — giriş ekranı (form) ile gösterilen onaylar; değişen alanlar vurgulanır.
  // Yeni bireysel müşteri (oldValues yok → tüm dolu alanlar "yeni")
  base(15, 'APR-009101', 'Yeni Bireysel Müşteri', 'customer_individual', 1, U.ops, 'Ahmet Yılmaz', 0, {
    payload: {
      screenKey: 'customer_individual',
      formKey: 'individual',
      summary: 'Zeynep Arslan — yeni kayıt',
      changes: [
        { field: 'fullName', label: 'Adı ve Soyadı', oldValue: '—', newValue: 'Zeynep Arslan' },
        { field: 'idNo', label: 'TCKN', oldValue: '—', newValue: '23456789012' },
        { field: 'limits.daily', label: 'Günlük', oldValue: '—', newValue: '80000' },
      ],
      newValues: {
        fullName: 'Zeynep Arslan',
        idNo: '23456789012',
        idType: 'TCKN',
        idCountry: 'TUR',
        birthDate: '1994-07-22',
        customerType: 'individual',
        kycLevel: 'L1',
        status: 'active',
        birthPlace: 'İzmir',
        maritalStatus: 'single',
        gender: 'female',
        language: 'tr',
        occupation: 'Mühendis',
        'limits.perTx': 50000,
        'limits.daily': 80000,
        'limits.monthly': 500000,
      },
    },
  }),
  // Bireysel müşteri düzenleme (limit + kampanya + medeni durum değişti)
  base(16, 'APR-009102', 'Bireysel Müşteri Düzenleme', 'customer_individual', 1, U.ops, 'Ahmet Yılmaz', 1, {
    payload: {
      screenKey: 'customer_individual',
      formKey: 'individual',
      summary: 'Ahmet Yılmaz — limit artışı',
      changes: [
        { field: 'campaign', label: 'Kampanya', oldValue: '—', newValue: 'Yaz2026' },
        { field: 'limits.perTx', label: 'İşlem Limiti', oldValue: '50000', newValue: '150000' },
        { field: 'limits.daily', label: 'Günlük', oldValue: '80000', newValue: '300000' },
        { field: 'limits.monthly', label: 'Aylık', oldValue: '500000', newValue: '1500000' },
        { field: 'maritalStatus', label: 'Medeni Durum', oldValue: 'single', newValue: 'married' },
      ],
      newValues: {
        fullName: 'Ahmet Yılmaz',
        idNo: '12345678901',
        idType: 'TCKN',
        idCountry: 'TUR',
        birthDate: '1991-04-18',
        customerType: 'individual',
        campaign: 'Yaz2026',
        status: 'active',
        maritalStatus: 'married',
        occupation: 'Yazılım Uzmanı',
        'limits.perTx': 150000,
        'limits.daily': 300000,
        'limits.monthly': 1500000,
      },
      oldValues: {
        fullName: 'Ahmet Yılmaz',
        idNo: '12345678901',
        idType: 'TCKN',
        idCountry: 'TUR',
        birthDate: '1991-04-18',
        customerType: 'individual',
        campaign: '',
        status: 'active',
        maritalStatus: 'single',
        occupation: 'Yazılım Uzmanı',
        'limits.perTx': 50000,
        'limits.daily': 80000,
        'limits.monthly': 500000,
      },
    },
  }),
  // Kurumsal müşteri düzenleme (personel + not + limit değişti)
  base(17, 'APR-009103', 'Kurumsal Müşteri Düzenleme', 'customer_corporate', 1, U.ops, 'Ahmet Yılmaz', 1, {
    payload: {
      screenKey: 'customer_corporate',
      formKey: 'corporate',
      summary: 'Akdeniz Lojistik A.Ş. — limit güncelleme',
      changes: [
        { field: 'staffCount', label: 'Personel Sayısı', oldValue: '85', newValue: '120' },
        { field: 'limits.perTx', label: 'İşlem Limiti', oldValue: '250000', newValue: '500000' },
        { field: 'limits.monthly', label: 'Aylık', oldValue: '5000000', newValue: '10000000' },
      ],
      newValues: {
        tradeName: 'Akdeniz Lojistik A.Ş.',
        taxNo: '1234567890',
        customerNo: 'KUR-0000045',
        organizationType: 'as',
        registryNo: 'İST-99821',
        mersisNo: '0123456789012345',
        activitySubject: 'Uluslararası taşımacılık',
        establishmentDate: '2015-03-10',
        country: 'TUR',
        ownershipType: 'private',
        staffCount: 120,
        language: 'tr',
        notes: 'Sermaye artışı sonrası limit güncellemesi',
        'limits.perTx': 500000,
        'limits.daily': 2000000,
        'limits.monthly': 10000000,
      },
      oldValues: {
        tradeName: 'Akdeniz Lojistik A.Ş.',
        taxNo: '1234567890',
        customerNo: 'KUR-0000045',
        organizationType: 'as',
        registryNo: 'İST-99821',
        mersisNo: '0123456789012345',
        activitySubject: 'Uluslararası taşımacılık',
        establishmentDate: '2015-03-10',
        country: 'TUR',
        ownershipType: 'private',
        staffCount: 85,
        language: 'tr',
        notes: '',
        'limits.perTx': 250000,
        'limits.daily': 1000000,
        'limits.monthly': 5000000,
      },
    },
  }),
  // Temsilci düzenleme (mutabakat + personel + limit değişti)
  base(18, 'APR-009104', 'Temsilci Düzenleme', 'agent_edit', 1, U.ops, 'Ahmet Yılmaz', 0, {
    payload: {
      screenKey: 'agent_edit',
      formKey: 'agent',
      summary: 'Marmara Döviz Ltd. — mutabakat periyodu',
      changes: [
        { field: 'settlement', label: 'Mutabakat', oldValue: 'weekly', newValue: 'daily' },
        { field: 'staffCount', label: 'Personel Sayısı', oldValue: '10', newValue: '14' },
        { field: 'limits.perTx', label: 'İşlem Limiti', oldValue: '200000', newValue: '300000' },
      ],
      newValues: {
        name: 'Marmara Döviz Ltd.',
        taxNo: '9876543210',
        agentNo: 'TMS-000231',
        settlement: 'daily',
        organizationType: 'ltd',
        registryNo: 'İST-44120',
        mersisNo: '9876543210987654',
        activitySubject: 'Yetkili müessese',
        establishmentDate: '2018-06-01',
        country: 'TUR',
        ownershipType: 'private',
        staffCount: 14,
        language: 'tr',
        notes: 'Mutabakat periyodu günlüğe çekildi',
        'limits.perTx': 300000,
        'limits.daily': 1500000,
        'limits.monthly': 8000000,
      },
      oldValues: {
        name: 'Marmara Döviz Ltd.',
        taxNo: '9876543210',
        agentNo: 'TMS-000231',
        settlement: 'weekly',
        organizationType: 'ltd',
        registryNo: 'İST-44120',
        mersisNo: '9876543210987654',
        activitySubject: 'Yetkili müessese',
        establishmentDate: '2018-06-01',
        country: 'TUR',
        ownershipType: 'private',
        staffCount: 10,
        language: 'tr',
        notes: '',
        'limits.perTx': 200000,
        'limits.daily': 1000000,
        'limits.monthly': 5000000,
      },
    },
  }),
  // Yeni kurumsal müşteri (form modal örneği)
  base(19, 'APR-009106', 'Yeni Kurumsal Müşteri', 'customer_corporate', 1, U.ops, 'Ahmet Yılmaz', 0, {
    payload: {
      screenKey: 'customer_corporate',
      formKey: 'corporate',
      summary: 'Doğu Tekstil Ltd. — yeni kayıt',
      changes: [
        { field: 'tradeName', label: 'Ticari Unvan', oldValue: '—', newValue: 'Doğu Tekstil Ltd.' },
        { field: 'taxNo', label: 'VKN', oldValue: '—', newValue: '1122334455' },
        { field: 'limits.perTx', label: 'İşlem Limiti', oldValue: '—', newValue: '100000' },
      ],
      newValues: {
        tradeName: 'Doğu Tekstil Ltd.',
        taxNo: '1122334455',
        organizationType: 'LimitedCompany',
        registryNo: 'İST-55201',
        mersisNo: '0112233445566778',
        activitySubject: 'Tekstil ihracat',
        establishmentDate: '2020-01-15',
        country: 'TUR',
        ownershipType: 'domestic',
        staffCount: 45,
        language: 'tr',
        notes: '',
        'limits.perTx': 100000,
        'limits.daily': 500000,
        'limits.monthly': 2000000,
      },
    },
  }),
  base(20, 'APR-009105', 'Yetkili Kişi Düzenleme', 'authorized_person', 1, U.ops, 'Ahmet Yılmaz', 0, {
    payload: {
      screenKey: 'authorized_person',
      formKey: 'authorized_person',
      summary: 'Mehmet Kaya — unvan güncelleme',
      changes: [{ field: 'occupation', label: 'Meslek', oldValue: 'Müdür', newValue: 'Genel Müdür' }],
      newValues: {
        fullName: 'Mehmet Kaya',
        idNo: '12345678901',
        idType: 'TCKN',
        occupation: 'Genel Müdür',
        employment: 'employed',
        status: 'active',
      },
      oldValues: {
        fullName: 'Mehmet Kaya',
        idNo: '12345678901',
        idType: 'TCKN',
        occupation: 'Müdür',
        employment: 'employed',
        status: 'active',
      },
    },
  }),
  base(21, 'APR-009107', 'Cüzdan Limit Değişikliği', 'wallet_detail', 1, U.ops, 'Ahmet Yılmaz', 0, {
    payload: {
      screenKey: 'wallet_detail',
      formKey: 'wallet_detail',
      summary: 'Cüzdan #11 — çekim limiti artışı',
      changes: [{ field: 'w_Single', label: 'Tek işlem', oldValue: '5000', newValue: '10000' }],
      newValues: { w_Single: 10000, w_DailyAmount: 25000 },
      oldValues: { w_Single: 5000, w_DailyAmount: 15000 },
    },
  }),
  base(22, 'APR-009108', 'Yeni Temsilci', 'agent_edit', 1, U.ops, 'Ahmet Yılmaz', 0, {
    payload: {
      screenKey: 'agent_edit',
      formKey: 'agent',
      summary: 'Ege Kıymet Ltd. — yeni kayıt',
      changes: [{ field: 'name', label: 'Unvan', oldValue: '—', newValue: 'Ege Kıymet Ltd.' }],
      newValues: {
        name: 'Ege Kıymet Ltd.',
        taxNo: '5566778899',
        settlement: 'weekly',
        organizationType: 'LimitedCompany',
        staffCount: 8,
        'limits.perTx': 150000,
      },
    },
  }),
  base(23, 'APR-009109', 'Müşteri Ücreti', 'customer_fee', 1, U.ops, 'Ahmet Yılmaz', 0, {
    payload: {
      screenKey: 'customer_fee',
      summary: 'WalletToPerson / TRY — yeni kademe',
      changes: [{ field: 'fixedFee', label: 'Sabit Ücret', oldValue: '—', newValue: '2.5' }],
      newValues: {
        transactionType: 'WalletToPerson',
        currency: 'TRY',
        lowerLimit: 0,
        fixedFee: 2.5,
        variableFeePct: 0.5,
        sourceCountry: 'ALL',
        targetCountry: 'ALL',
      },
    },
  }),
  base(24, 'APR-009110', 'Temsilci Ücreti', 'agent_fee', 1, U.ops, 'Ahmet Yılmaz', 0, {
    payload: {
      screenKey: 'agent_fee',
      summary: 'STANDARD / WalletToPerson',
      changes: [{ field: 'fixedFee', label: 'Sabit Ücret', oldValue: '1.5', newValue: '2' }],
      newValues: { fixedFee: 2, variableFeePct: 0.3 },
      oldValues: { fixedFee: 1.5, variableFeePct: 0.25 },
    },
  }),
  base(25, 'APR-009111', 'Manuel Düzeltme', '5.2', 1, U.ops, 'Ahmet Yılmaz', 0, {
    payload: {
      screenKey: '5.2',
      formKey: 'manual_correction',
      summary: 'Manuel düzeltme 1500 TRY',
      changes: [{ field: 'requestedAmount', label: 'Tutar', oldValue: '—', newValue: '1500' }],
      newValues: {
        requestedAmount: 1500,
        requestedCurrency: 'TRY',
        correctionReason: 'Refund',
        manualDescription: 'Müşteri iadesi',
      },
    },
  }),
  base(26, 'APR-009112', 'İşlem Onayı', 'transaction_detail', 1, U.ops, 'Ahmet Yılmaz', 0, {
    payload: {
      screenKey: 'transaction_detail',
      summary: 'TX-2026050001 — WalletToPerson',
      changes: [{ field: 'amount', label: 'Tutar', oldValue: '—', newValue: '500' }],
      newValues: { txNo: 'TX-2026050001', type: 'WalletToPerson', amount: 500, currency: 'TRY', status: 'Pending' },
    },
  }),
  base(27, 'APR-009113', 'Risk Yönetimi Değişikliği', 'risk.admin', 2, U.ops, 'Ahmet Yılmaz', 0, {
    payload: {
      screenKey: 'risk.admin',
      summary: 'Referans listesi güncelleme',
      changes: [{ field: 'refItemsCount', label: 'refItemsCount', oldValue: '12', newValue: '13' }],
      newValues: { refItemsCount: 13, groupsCount: 4, rulesCount: 3 },
      oldValues: { refItemsCount: 12, groupsCount: 4, rulesCount: 3 },
    },
  }),
  base(28, 'APR-009114', 'Risk Bazlı Limit Versiyonu', 'risk_based_limits', 1, U.ops, 'Ahmet Yılmaz', 0, {
    payload: {
      screenKey: 'risk_based_limits',
      summary: 'Risk limit matrisi — 9 satır',
      changes: [
        {
          field: 'IndividualCustomer:global.dailyLimit',
          label: 'IndividualCustomer:global.dailyLimit',
          oldValue: '50000',
          newValue: '75000',
        },
      ],
      newValues: { rowCount: 9 },
      oldValues: { rowCount: 9 },
    },
  }),
  base(29, 'APR-009115', 'Fraud Timeout Değişikliği', 'system_parameters', 1, U.ops, 'Ahmet Yılmaz', 0, {
    payload: {
      screenKey: 'system_parameters',
      formKey: 'system_parameter',
      summary: 'prm_desc_engine_timeout_ms',
      changes: [
        {
          field: 'value',
          label: 'fraud.engine_timeout_ms',
          oldValue: '-1',
          newValue: '0',
        },
      ],
      newValues: { parameterKey: 'fraud.engine_timeout_ms', value: '0' },
      oldValues: { parameterKey: 'fraud.engine_timeout_ms', value: '-1', status: 'Active' },
    },
  }),
];

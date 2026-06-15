export const KYC_SCREENING_PAYLOADS: Record<string, unknown> = {
  'SCR-001': {
    provider: 'SanctionScreenStub',
    listVersion: '2026-05-01',
    matchScore: 92.5,
    matchedLists: ['OFAC-SDN', 'EU-CONSOLIDATED'],
    hits: [{ name: 'JOHN DOE', score: 92.5, list: 'OFAC-SDN' }],
  },
  'SCR-002': {
    provider: 'SanctionScreenStub',
    listVersion: '2026-05-01',
    matchScore: 65.0,
    matchedLists: ['PEP-TR'],
    hits: [{ name: 'HATICE ACAR', score: 65.0, list: 'PEP-TR' }],
  },
  'SCR-003': {
    provider: 'SanctionScreenStub',
    listVersion: '2026-05-01',
    matchScore: 88.0,
    matchedLists: ['OFAC-DEMO'],
    hits: [{ name: 'MUSTAFA KARACA', score: 88.0, list: 'OFAC-DEMO' }],
  },
};

import { OPEN_RISK_CASES } from '@/mocks/risk-cases';
import type { ReportGenerator } from '../domain/types';
import { baseResult } from './shared';

export const strOutput: ReportGenerator = async (params) => {
  const rows = OPEN_RISK_CASES.filter((c) => c.status === 'open')
    .slice(0, 20)
    .map((c, i) => ({
      caseId: c.id,
      strRef: `STR-2026-${String(1000 + i).padStart(4, '0')}`,
      entityId: c.customerId ?? c.agentId ?? '—',
      ruleName: c.ruleName ?? '—',
      filedAt: params.dateFrom ?? '2026-05-01',
      status: 'Draft',
    }));
  return baseResult(
    [
      { key: 'caseId', labelKey: 'rpt_col_case_id' },
      { key: 'strRef', labelKey: 'rpt_col_str_ref' },
      { key: 'entityId', labelKey: 'rpt_col_entity' },
      { key: 'ruleName', labelKey: 'col_rule' },
      { key: 'status', labelKey: 'rpt_col_status' },
    ],
    rows,
  );
};

export const infoDocumentResponsePack: ReportGenerator = async () => {
  const rows = [
    { requestId: 'MBT-2026-0142', entity: 'Anadolu Gıda A.Ş.', status: 'Responded', dueDate: '2026-05-20' },
    { requestId: 'MBT-2026-0145', entity: 'Caner Avcı', status: 'Pending', dueDate: '2026-05-25' },
  ];
  return baseResult(
    [
      { key: 'requestId', labelKey: 'rpt_col_request_id' },
      { key: 'entity', labelKey: 'rpt_col_entity' },
      { key: 'status', labelKey: 'rpt_col_status' },
      { key: 'dueDate', labelKey: 'rpt_col_date' },
    ],
    rows,
  );
};

export const assetFreezeSanctionsSummary: ReportGenerator = async () => {
  const rows = [
    { entity: 'Yıldız Döviz', sanctionList: 'OFAC', matchScore: 92, action: 'Frozen' },
    { entity: 'Test Holdings Ltd', sanctionList: 'EU Consolidated', matchScore: 78, action: 'Review' },
  ];
  return baseResult(
    [
      { key: 'entity', labelKey: 'rpt_col_entity' },
      { key: 'sanctionList', labelKey: 'rpt_col_sanction' },
      { key: 'matchScore', labelKey: 'rpt_col_risk' },
      { key: 'action', labelKey: 'rpt_col_status' },
    ],
    rows,
  );
};

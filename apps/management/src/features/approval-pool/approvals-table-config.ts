import type { TableConfig, TranslateFn } from '@epay/ui';
import approvalsJson from './config/approvals.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

export function buildApprovalsTableConfig(t?: TranslateFn): TableConfigJson {
  const base = approvalsJson as TableConfigJson;
  if (!t) return base;
  return {
    ...base,
    title: t('s_op_approval', base.title as string),
    columns: base.columns.map((c) => ({
      ...c,
      title:
        c.key === 'referenceNo'
          ? t('bm_col_reference')
          : c.key === 'screenName'
            ? t('ap_col_screen')
            : c.key === 'initiatedByName'
              ? t('ap_col_initiator')
              : c.key === 'initiatedAt'
                ? t('ap_col_date')
                : c.key === 'firstApproverName'
                  ? t('ap_col_first_approver')
                  : c.key === 'firstApprovalAt'
                    ? t('ap_col_first_date')
                    : c.key === 'secondApproverName'
                      ? t('ap_col_second_approver')
                      : c.key === 'secondApprovalAt'
                        ? t('ap_col_second_date')
                        : c.key === 'uiStatus'
                          ? t('scf_col_status')
                          : c.title,
    })),
  };
}


import { useTranslation } from 'react-i18next';
import { Button, DynamicTable, type TableConfig } from '@epay/ui';
import { X } from 'lucide-react';
import type { ReferenceListItem } from '../domain/types';

type Props = {
  open: boolean;
  onClose: () => void;
  items: ReferenceListItem[];
};

export function ReferenceHistoryDrawer({ open, onClose, items }: Props) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div
        className="modal"
        style={{ width: 640, maxHeight: '80vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="rm-history-title"
      >
        <div className="modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 id="rm-history-title">{t('rm_history_title')}</h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
        <div className="modal-body">
          {items.length === 0 ? (
            <p className="t-mute fs-13">{t('rm_history_empty')}</p>
          ) : (
            <div className="rm-table-wrap">
              <DynamicTable
                config={
                  {
                    rowKey: 'id',
                    hideTitleBar: true,
                    hideColumnFilters: true,
                    pagination: false,
                    columns: [
                      { key: 'value', title: t('rm_hist_col_value'), dataIndex: 'value', render: 'renderValue' },
                      { key: 'sourceTag', title: t('rpt_col_source'), dataIndex: 'sourceTag', render: 'renderSource' },
                      { key: 'effectiveFrom', title: t('rpt_param_date_from'), dataIndex: 'effectiveFrom', render: 'renderFrom' },
                      { key: 'effectiveTo', title: t('rpt_param_date_to'), dataIndex: 'effectiveTo', render: 'renderTo' },
                    ],
                    api: { method: async () => ({ success: true, data: items as unknown as Record<string, unknown>[], total: items.length }) },
                  } satisfies TableConfig
                }
                permissions={{}}
                customFunctions={{
                  renderValue: (v: unknown) => <span className="mono fs-12">{String(v)}</span>,
                  renderSource: (v: unknown) => String(v ?? '—'),
                  renderFrom: (v: unknown) => <span className="mono fs-12">{String(v).slice(0, 16)}</span>,
                  renderTo: (v: unknown) => <span className="mono fs-12">{v ? String(v).slice(0, 16) : '—'}</span>,
                }}
                locale="tr"
                t={(k, fb) => t(k, { defaultValue: fb ?? k })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

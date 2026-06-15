import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type CustomFunctions, type TableConfig } from '@epay/ui';
import { maskAddress } from '../../domain/mask-message';
import { NotificationStatusPill } from '../notification-status-pill';
import { NotificationTypeBadge } from '../notification-type-badge';
import type { NotificationLogEntry, NotificationStatus, NotificationType } from '../../domain/types';

type Props = { logs: NotificationLogEntry[] };

export function LogTab({ logs }: Props) {
  const { t, i18n } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });

  if (logs.length === 0) {
    return <p className="t-mute fs-12" style={{ padding: 16 }}>{t('sj_log_empty')}</p>;
  }

  return (
    <div>
      <DynamicTable
        config={
          {
            rowKey: 'id',
            hideTitleBar: true,
            hideColumnFilters: true,
            pagination: { defaultPageSize: 8, pageSizeOptions: [8, 15, 30] },
            columns: [
              { key: 'createdAt', title: t('rpt_col_date'), dataIndex: 'createdAt', render: 'renderDate', mono: true, width: 170 },
              { key: 'templateName', title: t('nt_log_col_name'), dataIndex: 'templateName' },
              { key: 'notificationType', title: t('rsc_source'), dataIndex: 'notificationType', render: 'renderType', width: 120 },
              { key: 'status', title: t('scf_col_status'), dataIndex: 'status', render: 'renderStatus', width: 120 },
              { key: 'recipient', title: t('nt_log_col_recipient'), dataIndex: 'recipient' },
              { key: 'recipientAddress', title: t('nt_log_col_address'), dataIndex: 'recipientAddress', render: 'renderAddress', mono: true },
              { key: 'messageMasked', title: t('rpt_col_message'), dataIndex: 'messageMasked', render: 'renderMessage' },
            ],
            api: { method: async () => ({ data: logs as unknown as Record<string, unknown>[], total: logs.length, success: true }) },
          } satisfies TableConfig
        }
        permissions={{}}
        onRowClick={(row) => {
          const id = String(row.id);
          setExpandedId((prev) => (prev === id ? null : id));
        }}
        customFunctions={
          {
            renderDate: (val: unknown) => (typeof val === 'string' ? fmt(val) : '—'),
            renderType: (val: unknown) => <NotificationTypeBadge type={val as NotificationType} />,
            renderStatus: (val: unknown) => <NotificationStatusPill status={val as NotificationStatus} />,
            renderAddress: (val: unknown, row: Record<string, unknown>) =>
              maskAddress(row.notificationType as NotificationType, String(val ?? '')),
            renderMessage: (val: unknown) => <span className="t-mute">{String(val ?? '')}</span>,
          } satisfies CustomFunctions
        }
        locale={i18n.language}
        t={(k, fb) => t(k, { defaultValue: fb ?? k })}
      />

      {expandedId ? (
        <pre className="fs-11 mono" style={{ whiteSpace: 'pre-wrap', margin: 8 }}>
          {logs.find((x) => x.id === expandedId)?.messageRendered}
        </pre>
      ) : null}
    </div>
  );
}

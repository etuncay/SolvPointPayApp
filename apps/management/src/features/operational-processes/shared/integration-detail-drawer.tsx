import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { DynamicTable, IconButton, type TableConfig } from '@epay/ui';
import type { IntegrationActionLog, IntegrationRecordBase } from './integration-types';
import { IntegrationStatusBadge } from './integration-status-badge';

type Props = {
  open: boolean;
  record: IntegrationRecordBase | null;
  actionLog: IntegrationActionLog[];
  onClose: () => void;
  transactionLinkLabel?: string;
};

type BtransRecordFields = IntegrationRecordBase & { reportName?: string; reportDate?: string };

export function IntegrationDetailDrawer({
  open,
  record,
  actionLog,
  onClose,
  transactionLinkLabel,
}: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !record) return null;

  const isBtrans = record.integrationType === 'BTrans';
  const btransRecord = isBtrans ? (record as BtransRecordFields) : null;

  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose} role="presentation" />
      <div className="cust-drawer open" role="dialog" style={{ width: 'min(560px, 96vw)' }}>
        <div className="head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="mono fs-14">{record.referenceNo}</h2>
            <div className="sub" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <IntegrationStatusBadge status={record.status} />
              <span className="t-mute mono fs-11">{record.correlationId}</span>
            </div>
          </div>
          <IconButton onClick={onClose} aria-label="close">
            <X size={16} />
          </IconButton>
        </div>

        <div className="body">
          <section style={{ marginBottom: 16 }}>
            <h3 className="fs-12" style={{ marginBottom: 8 }}>
              {isBtrans ? t('int_drawer_report_summary') : t('int_drawer_tx_summary')}
            </h3>
            <div className="fgrid cols-2" style={{ gap: 8, fontSize: 12 }}>
              {isBtrans && btransRecord?.reportName ? (
                <>
                  <div>
                    <span className="t-mute">{t('btrans_col_report_name')}</span>
                    <br />
                    {t(`btrans_report_${btransRecord.reportName}`, btransRecord.reportName)}
                  </div>
                  <div>
                    <span className="t-mute">{t('rpt_col_date')}</span>
                    <br />
                    {btransRecord.reportDate ?? '—'}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="t-mute">{t('fc_col_tx_type')}</span>
                    <br />
                    {record.transactionType}
                  </div>
                  <div>
                    <span className="t-mute">{t('fcd_tx_sender')}</span>
                    <br />
                    {record.senderName} ({record.senderNo})
                  </div>
                  <div>
                    <span className="t-mute">{t('fcd_tx_receiver')}</span>
                    <br />
                    {record.receiverName} ({record.receiverNo})
                  </div>
                  <div>
                    <span className="t-mute">{t('acct_col_amount')}</span>
                    <br />
                    {record.amount} {record.currency}
                  </div>
                  {transactionLinkLabel ? (
                    <div>
                      <span className="t-mute">{t('int_drawer_tx_link')}</span>
                      <br />
                      {transactionLinkLabel}
                    </div>
                  ) : null}
                </>
              )}
              <div>
                <span className="t-mute">{t('int_drawer_attempts')}</span>
                <br />
                {record.attemptCount}
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 16 }}>
            <h3 className="fs-12" style={{ marginBottom: 8 }}>{t('int_drawer_request')}</h3>
            <pre
              className="mono fs-11"
              style={{
                margin: 0,
                padding: 12,
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-subtle)',
                overflow: 'auto',
                maxHeight: 200,
              }}
            >
              {JSON.stringify(record.requestJson, null, 2)}
            </pre>
          </section>

          <section style={{ marginBottom: 16 }}>
            <h3 className="fs-12" style={{ marginBottom: 8 }}>{t('int_drawer_response')}</h3>
            <pre
              className="mono fs-11"
              style={{
                margin: 0,
                padding: 12,
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-subtle)',
                overflow: 'auto',
                maxHeight: 200,
              }}
            >
              {JSON.stringify(record.responseJson, null, 2)}
            </pre>
          </section>

          {record.integrationDefinitionId ? (
            <p className="fs-12" style={{ marginBottom: 16 }}>
              <Link
                className="link"
                to={`/system/integrations/${record.integrationDefinitionId}`}
              >
                {t('int_tab_config')}
              </Link>
            </p>
          ) : null}

          <section>
            <h3 className="fs-12" style={{ marginBottom: 8 }}>{t('int_drawer_audit')}</h3>
            {actionLog.length === 0 ? (
              <p className="t-mute fs-11">{t('kyc_no_audit')}</p>
            ) : (
              <DynamicTable
                config={
                  {
                    rowKey: 'id',
                    hideTitleBar: true,
                    hideColumnFilters: true,
                    pagination: false,
                    columns: [
                      { key: 'at', title: t('kyc_audit_at'), dataIndex: 'at', render: 'renderAt', mono: true, width: 180 },
                      { key: 'action', title: t('kyc_audit_action'), dataIndex: 'action' },
                      { key: 'performedBy', title: t('int_audit_by'), dataIndex: 'performedBy' },
                    ],
                    api: {
                      method: async () => ({
                        data: actionLog.slice(0, 5).map((a, i) => ({ ...a, id: `${a.at}-${i}` })) as unknown as Record<string, unknown>[],
                        total: Math.min(actionLog.length, 5),
                        success: true,
                      }),
                    },
                  } satisfies TableConfig
                }
                permissions={{}}
                customFunctions={{
                  renderAt: (val: unknown) =>
                    typeof val === 'string' ? <span className="mono fs-11">{new Date(val).toLocaleString()}</span> : '—',
                }}
                locale="tr"
                t={(k, fb) => t(k, fb ?? k)}
              />
            )}
          </section>
        </div>
      </div>
    </>
  );
}

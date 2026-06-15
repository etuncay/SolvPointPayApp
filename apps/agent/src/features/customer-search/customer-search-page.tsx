import { useMemo, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FilePlus, FileSearch, Pencil } from 'lucide-react';
import { DynamicForm, DynamicTable, FormMode, PageHead, type TableCustomFunctions } from '@epay/ui';
import { AGENT_PATHS } from '@/config/agent-nav-paths';
import { buildSearchFormConfig } from './customer-search-form-config';
import {
  buildAccountsTableConfig,
  buildCustomerInfoTableConfig,
  buildPendingTransactionsTableConfig,
} from './customer-search-table-config';
import { DocumentUploadModal } from './components/document-upload-modal';
import { DocumentViewModal } from './components/document-view-modal';
import { SearchWarningsBanner } from './components/search-warnings-banner';
import { useCustomerSearch } from './hooks/use-customer-search';

function statusClass(status: string): string {
  if (status === 'active' || status === 'Active') return 'active';
  if (status === 'blocked' || status === 'Blocked') return 'danger';
  if (status === 'passive' || status === 'Passive') return 'muted';
  return 'pending';
}

function txStatusClass(status: string): string {
  if (status === 'Completed' || status === 'Sent') return 'active';
  if (status === 'Pending' || status === 'OnHold' || status === 'Retrying') return 'pending';
  if (status === 'ErrorComplete' || status === 'Canceled' || status === 'ErrorSend' || status === 'ErrorReceive')
    return 'danger';
  return 'muted';
}

/** Agent Müşteri Arama & Görüntüleme (4) — DynamicForm sorgu + DynamicTable paneller. */
export function CustomerSearchPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const {
    loading,
    notFound,
    result,
    customerId,
    documents,
    uploadOpen,
    viewOpen,
    pendingVisible,
    setPendingVisible,
    setUploadOpen,
    setViewOpen,
    runSearch,
    handleUpload,
    initialQuery,
  } = useCustomerSearch();

  const searchConfig = useMemo(
    () => buildSearchFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const customerInfoConfig = useMemo(
    () => buildCustomerInfoTableConfig(customerId, translate),
    [customerId, i18n.language],
  );
  const accountsConfig = useMemo(
    () => buildAccountsTableConfig(customerId, translate),
    [customerId, i18n.language],
  );
  const pendingTxConfig = useMemo(
    () => buildPendingTransactionsTableConfig(customerId, translate),
    [customerId, i18n.language],
  );

  const profileFns: TableCustomFunctions = useMemo(
    () => ({
      renderKyc: (val: unknown): ReactNode => (
        <span className="badge badge--info">{String(val)}</span>
      ),
      renderRisk: (val: unknown): ReactNode => {
        const v = String(val);
        const cls = v === 'High' ? 'danger' : v === 'Medium' ? 'pending' : 'success';
        return <span className={`badge badge--${cls === 'success' ? 'success' : cls === 'danger' ? 'danger' : 'warning'}`}>{t(`ag_cs_risk_${v.toLowerCase()}`, v)}</span>;
      },
      renderStatus: (val: unknown): ReactNode => (
        <span className={`st ${statusClass(String(val))}`}>
          {t(`ag_cs_status_${String(val)}`, String(val))}
        </span>
      ),
    }),
    [t],
  );

  const pendingFns: TableCustomFunctions = useMemo(
    () => ({
      renderTxType: (val: unknown): ReactNode => t(`wa_tx_${String(val)}`, String(val)),
      renderTxStatus: (val: unknown): ReactNode => (
        <span className={`st ${txStatusClass(String(val))}`}>
          {t(`tx_status_${String(val)}`, String(val))}
        </span>
      ),
    }),
    [t],
  );

  const hasResult = result != null;

  return (
    <>
      <PageHead title={t('ag_nav_customers')} subtitle={t('ag_cs_subtitle')} />

      <div className="fcard" style={{ marginBottom: 16 }}>
        <div className="fcard-body">
          <DynamicForm
            config={searchConfig}
            mode={FormMode.Create}
            permissions={{ create: false, update: false, delete: false }}
            initialValues={{
              customerNo: initialQuery.customerNo ?? '',
              idNo: initialQuery.idNo ?? '',
            }}
            loading={loading}
            t={translate}
            onButtonClick={(key, values) => {
              if (key === 'search') {
                void runSearch({
                  customerNo: String(values.customerNo ?? ''),
                  idNo: String(values.idNo ?? ''),
                });
              }
            }}
          />
        </div>
      </div>

      {notFound ? (
        <div className="fcard" style={{ marginBottom: 16 }}>
          <div className="fcard-body">
            <p className="t-mute">{t('ag_cs_not_found')}</p>
          </div>
        </div>
      ) : null}

      {hasResult ? (
        <>
          <SearchWarningsBanner warnings={result.warnings} />

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!hasResult}
              onClick={() => setUploadOpen(true)}
            >
              <FilePlus size={14} /> {t('ag_cs_btn_upload')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!hasResult}
              onClick={() => setViewOpen(true)}
            >
              <FileSearch size={14} /> {t('ag_cs_btn_view_docs')}
            </button>
            {customerId != null ? (
              <Link to={`${AGENT_PATHS.customers}/${customerId}`} className="btn btn-ghost">
                <Pencil size={14} /> {t('ag_cs_btn_edit')}
              </Link>
            ) : null}
          </div>

          {customerInfoConfig ? (
            <div className="fcard" style={{ marginBottom: 16 }}>
              <div className="fcard-body">
                <div className="section-h" style={{ marginBottom: 12 }}>
                  {t('ag_cs_panel_customer')}
                </div>
                <DynamicTable
                  config={customerInfoConfig}
                  permissions={{}}
                  customFunctions={profileFns}
                  locale={i18n.language}
                  t={translate}
                />
              </div>
            </div>
          ) : null}

          {accountsConfig ? (
            <div className="fcard" style={{ marginBottom: 16 }}>
              <div className="fcard-body">
                <div className="section-h" style={{ marginBottom: 12 }}>
                  {t('ag_cs_panel_accounts')}
                </div>
                <DynamicTable
                  config={accountsConfig}
                  permissions={{}}
                  locale={i18n.language}
                  t={translate}
                />
              </div>
            </div>
          ) : null}

          {pendingVisible && pendingTxConfig ? (
            <div className="fcard" style={{ marginBottom: 16 }}>
              <div className="fcard-body">
                <div className="section-h" style={{ marginBottom: 12 }}>
                  {t('ag_cs_panel_pending_tx')}
                </div>
                <DynamicTable
                  config={pendingTxConfig}
                  permissions={{}}
                  customFunctions={pendingFns}
                  locale={i18n.language}
                  t={translate}
                  onDataChange={(rows) => setPendingVisible(rows.length > 0)}
                  onRowClick={(row) =>
                    navigate(AGENT_PATHS.transaction.detail(Number(row.transactionId)), {
                      state: { returnTo: window.location.pathname + window.location.search },
                    })
                  }
                />
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <DocumentUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onSubmit={handleUpload} />
      <DocumentViewModal open={viewOpen} documents={documents} onClose={() => setViewOpen(false)} />
    </>
  );
}

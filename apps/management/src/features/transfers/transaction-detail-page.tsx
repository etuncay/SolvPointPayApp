import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  LockOpen,
  Send,
  XCircle,
} from 'lucide-react';
import { Button, DynamicForm, FormMode, PageHead, type CustomFunctions } from '@epay/ui';
import { InterventionModal, type InterventionVariant } from './components/intervention-modal';
import { TransactionDocumentsTable } from './components/transaction-documents-table';
import { useTransactionDetail } from './hooks/use-transaction-detail';
import { buildTransactionDetailFormConfig } from './transaction-detail-form-config';
import { detailToFormValues } from './domain/detail-to-form-values';

export function TransactionDetailPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    detail,
    loading,
    notFound,
    isManualReview,
    isCorrectionDraft,
    showHold,
    showUnblock,
    showCancel,
    showSubmitApproval,
    showApproveManual,
    hold,
    unblock,
    cancel,
    submitApproval,
    downloadDocument,
    goBack,
  } = useTransactionDetail();

  const [modal, setModal] = useState<InterventionVariant | null>(null);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const formConfig = useMemo(
    () => buildTransactionDetailFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      components: {
        TransactionDocuments: (props) => (
          <div>
            <div style={{ marginBottom: 12 }}>
              <Link
                className="link-btn fs-12"
                to={`/documents?relationType=Transaction&relatedId=${encodeURIComponent(detail?.referenceNo ?? '')}`}
              >
                {t('td_dms_view_all')}
              </Link>
            </div>
            <TransactionDocumentsTable
              documents={
                Array.isArray(props.value)
                  ? (props.value as NonNullable<typeof detail>['documents'])
                  : detail?.documents ?? []
              }
              onDownload={handleDownload}
            />
          </div>
        ),
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [detail?.referenceNo, detail?.documents, t],
  );

  const handleModalConfirm = async (reason: string) => {
    if (!modal) return;
    const runners = { hold, unblock, cancel } as const;
    const result = await runners[modal](reason);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ap_save_failed'));
      return;
    }
    toast.success(t(`td_${modal}_ok`));
  };

  const handleDownload = async (docId: number) => {
    const result = await downloadDocument(docId);
    if (result.ok && result.filename) {
      toast.success(t('td_download_ok', { file: result.filename }));
    } else {
      toast.error(t(result.error ?? 'td_download_failed'));
    }
  };

  const handleSubmitApproval = async () => {
    const result = await submitApproval();
    if (!result.ok) {
      toast.error(t(result.error ?? 'ap_save_failed'));
      return;
    }
    toast.success(t('td_submit_approval_ok', { id: result.approvalId }));
    if (isCorrectionDraft && result.approvalId) {
      navigate(`/approvals/${result.approvalId}`);
    }
  };

  if (loading) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <p className="t-mute">…</p>
      </div>
    );
  }

  if (notFound || !detail) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('frp_tx_not_found')}</h3>
        <p className="t-mute">{t('tx_not_found_sub')}</p>
        <Button type="button" onClick={goBack} style={{ marginTop: 16 }}>
          {t('td_back')}
        </Button>
      </div>
    );
  }

  const agentRoleLabel =
    detail.senderAgent ? t('wa_col_sender_agent') : detail.receiverAgent ? t('wa_col_receiver_agent') : '—';
  const initialValues = detailToFormValues(detail, i18n.language, translate, agentRoleLabel);

  return (
    <>
      <PageHead
        title={t('td_title')}
        subtitle={<span className="mono">{detail.transactionNo}</span>}
        actions={
          <>
            {showHold && (
              <Button type="button" variant="ghost" onClick={() => setModal('hold')}>
                <Ban size={14} /> {t('td_hold')}
              </Button>
            )}
            {showUnblock && (
              <Button type="button" variant="ghost" onClick={() => setModal('unblock')}>
                <LockOpen size={14} /> {t('td_unblock')}
              </Button>
            )}
            {showCancel && (
              <Button type="button" variant="danger" onClick={() => setModal('cancel')}>
                <XCircle size={14} /> {t('td_cancel')}
              </Button>
            )}
            {showSubmitApproval && (
              <Button type="button" variant="primary" onClick={handleSubmitApproval}>
                <Send size={14} /> {t('lf_submit_approval')}
              </Button>
            )}
            {showApproveManual && (
              <Button type="button" variant="primary" disabled title={t('td_approve_manual_stub')}>
                <CheckCircle size={14} /> {t('fcd_action_approve')}
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={goBack}>
              <ArrowLeft size={14} /> {isManualReview && isCorrectionDraft ? t('td_back_edit') : t('td_back')}
            </Button>
          </>
        }
      />

      {detail.isTerminal && (
        <div className="banner banner-warn" style={{ marginBottom: 16 }}>
          {t('td_terminal_banner')}
        </div>
      )}

      {isManualReview && (
        <div className="banner banner-info" style={{ marginBottom: 16 }}>
          {t('td_manual_review_banner')}
        </div>
      )}

      {detail.notesDisplay && (
        <div className="fcard" style={{ marginBottom: 16 }}>
          <div className="fcard-body">
            <div className="section-h">{t('scf_notes')}</div>
            <pre className="fs-12 t-mute" style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>
              {detail.notesDisplay}
            </pre>
          </div>
        </div>
      )}

      <DynamicForm
        config={formConfig}
        mode={FormMode.View}
        permissions={{ view: true }}
        initialValues={initialValues}
        customFunctions={customFunctions}
        t={translate}
      />

      {modal && (
        <InterventionModal
          open
          variant={modal}
          onClose={() => setModal(null)}
          onConfirm={handleModalConfirm}
        />
      )}
    </>
  );
}

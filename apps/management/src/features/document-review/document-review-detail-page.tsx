import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, Download, FileText, User } from 'lucide-react';
import { Button, Field, FormCard, FormGrid, PageHead } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { canApproveCategory, getDocumentReviewPermissions } from './domain/permissions';
import { useDocumentReviewDetail } from './hooks/use-document-review-detail';
import { ApproveDecisionModal } from './components/approve-decision-modal';
import { RejectDecisionModal } from './components/reject-decision-modal';
import { RequestAdditionalModal } from './components/request-additional-modal';

export function DocumentReviewDetailPage() {
  const { t, i18n } = useTranslation();
  const { role } = useRole();
  const permissions = getDocumentReviewPermissions(role);
  const { detail, loading, notFound, download, approve, reject, requestAdditional, goBack } =
    useDocumentReviewDetail(role);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [additionalOpen, setAdditionalOpen] = useState(false);

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
        <h3>{t('dr_not_found')}</h3>
        <Button type="button" onClick={goBack}>{t('dr_back_queue')}</Button>
      </div>
    );
  }

  const { document: doc, customer } = detail;
  const canDecide = permissions.approve && canApproveCategory(role, doc.category);
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US');

  const handleDownload = () => {
    const result = download();
    if (result?.ok) toast.success(t('dr_download_ok', { file: result.filename }));
    else toast.error(t('dr_download_failed'));
  };

  const handleApprove = (payload: Parameters<typeof approve>[0]) => {
    const result = approve(payload);
    if (result.ok) toast.success(t('dr_approved'));
    else toast.error(t(result.error ?? 'dr_save_failed'));
  };

  const handleReject = (payload: Parameters<typeof reject>[0]) => {
    const result = reject(payload);
    if (result.ok) toast.success(t('dr_rejected'));
    else toast.error(t(result.error ?? 'dr_save_failed'));
  };

  const handleAdditional = (payload: Parameters<typeof requestAdditional>[0]) => {
    const result = requestAdditional(payload);
    if (result.ok) toast.success(t('dr_additional_ok'));
    else toast.error(t(result.error ?? 'dr_save_failed'));
  };

  return (
    <>
      <PageHead
        title={t('dr_detail_title')}
        subtitle={`${doc.customerNo} · ${doc.documentType}`}
        actions={
          <>
            <Button type="button" variant="ghost" onClick={goBack}>
              <ArrowLeft size={14} /> {t('dr_back_queue')}
            </Button>
            {canDecide && (
              <>
                <Button type="button" variant="primary" onClick={() => setApproveOpen(true)}>
                  {t('fcd_action_approve')}
                </Button>
                <Button type="button" variant="danger" onClick={() => setRejectOpen(true)}>
                  {t('scf_btn_reject')}
                </Button>
                <Button type="button" onClick={() => setAdditionalOpen(true)}>
                  {t('dr_request_additional')}
                </Button>
              </>
            )}
          </>
        }
      />

      <FormCard title={t('dr_panel_customer')} icon={<User size={13} />}>
        <FormGrid>
          <Field label={t('frd_exc_customer')} locked>
            <input className="input mono locked" readOnly value={customer.customerNo} />
          </Field>
          <Field label={t('rpt_col_name')} locked>
            <input className="input locked" readOnly value={customer.customerName} />
          </Field>
          <Field label={t('ef_nationality')} locked>
            <input className="input locked" readOnly value={customer.nationality} />
          </Field>
          <Field label={t('cd_id')} locked>
            <input className="input mono locked" readOnly value={`${customer.idType} ${customer.idNo}`} />
          </Field>
          {customer.customerType === 'individual' && (
            <Field label={t('dr_kyc_level')} locked>
              <input className="input locked" readOnly value={customer.kycLevel ?? '—'} />
            </Field>
          )}
          <Field label={t('dr_kyc_status')} locked>
            <input className="input locked" readOnly value={customer.kycStatus} />
          </Field>
          <Field label={t('dr_entity_status')} locked>
            <input className="input locked" readOnly value={customer.status} />
          </Field>
          <Field label={t('frd_exc_created')} locked>
            <input className="input mono locked" readOnly value={fmt(customer.createdAt)} />
          </Field>
          <Field label={t('cn_col_text')} col={4} locked>
            <textarea className="textarea locked" readOnly value={customer.notes || '—'} />
          </Field>
        </FormGrid>
      </FormCard>

      <div style={{ marginTop: 16 }}>
        <FormCard title={t('dr_panel_document')} icon={<FileText size={13} />}>
          <FormGrid>
          <Field label={t('dr_col_category')} locked>
            <input className="input locked" readOnly value={t(`dr_cat_${doc.category}`, doc.category)} />
          </Field>
          <Field label={t('dr_col_type')} locked>
            <input className="input locked" readOnly value={doc.documentType} />
          </Field>
          <Field label={t('dr_col_created')} locked>
            <input className="input mono locked" readOnly value={fmt(doc.createdAt)} />
          </Field>
          <Field label={t('dr_created_by')} locked>
            <input className="input locked" readOnly value={doc.createdBy} />
          </Field>
          <Field label={t('dr_doc_status')} locked>
            <input className="input locked" readOnly value={doc.documentStatus} />
          </Field>
          <Field label={t('dr_col_status')} locked>
            <input className="input locked" readOnly value={doc.approvalStatus ?? 'Pending'} />
          </Field>
          <Field label={t('dr_approval_required')} locked>
            <input className="input locked" readOnly value={doc.approvalRequired ? t('dr_yes') : t('dr_no')} />
          </Field>
          <Field label={t('dr_file')}>
            <Button type="button" onClick={handleDownload}>
              <Download size={14} /> {t('dd_download')}
            </Button>
          </Field>
          </FormGrid>
        </FormCard>
      </div>

      <ApproveDecisionModal
        open={approveOpen}
        customer={customer}
        onClose={() => setApproveOpen(false)}
        onConfirm={handleApprove}
      />
      <RejectDecisionModal
        open={rejectOpen}
        customer={customer}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
      <RequestAdditionalModal
        open={additionalOpen}
        onClose={() => setAdditionalOpen(false)}
        onConfirm={handleAdditional}
      />
    </>
  );
}

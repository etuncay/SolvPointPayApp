import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button, DynamicTable, FormCard, PageHead, type TableConfig } from '@epay/ui';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { getKycPermissions, isDecisionLocked } from './domain/permissions';
import { useKycReviewDetail } from './hooks/use-kyc-review-detail';
import { KycActionBar } from './components/kyc-action-bar';
import { KnownExceptionBanner } from './components/known-exception-banner';
import { EntitySummaryPanel } from './components/entity-summary-panel';
import { RiskScoresPanel } from './components/risk-scores-panel';
import { KycRawJsonPanel } from './components/kyc-raw-json-panel';
import { FalsePositiveModal } from './components/false-positive-modal';
import { RequestAdditionalModal } from './components/request-additional-modal';
import { RejectModal } from './components/reject-modal';
import { VerifyModal } from './components/verify-modal';
import { AddDocumentModal } from './components/add-document-modal';

export function KycReviewDetailPage() {
  const { t } = useTranslation();
  const { role } = useRole();
  const permissions = getKycPermissions(role);
  const {
    detail,
    loading,
    notFound,
    falsePositive,
    requestAdditional,
    reject,
    verify,
    finalizeVerify,
    addDocument,
    wantsVerifyApprove,
    goBack,
  } = useKycReviewDetail(role);

  const [fpOpen, setFpOpen] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);

  useEffect(() => {
    if (wantsVerifyApprove && detail?.decision === 'PendingVerification') {
      const r = finalizeVerify();
      if (r.ok) toast.success(t('kyc_verify_finalized'));
      else if (r.error) toast.error(t(r.error));
    }
  }, [wantsVerifyApprove, detail?.decision, finalizeVerify, t]);

  if (!permissions.detail) {
    return <Navigate to="/" replace />;
  }

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
        <h3>{t('finrec_not_found')}</h3>
        <Button type="button" onClick={goBack}>{t('kyc_back_queue')}</Button>
      </div>
    );
  }

  const handleError = (result: { ok: boolean; error?: string }) => {
    if (result.ok) toast.success(t('kyc_action_ok'));
    else toast.error(t(result.error ?? 'ap_save_failed'));
  };

  const decisionLabel = detail.decision ? t(`kyc_decision_${detail.decision}`) : t('sc_chip_open');

  return (
    <>
      <PageHead
        title={t('kyc_detail_title')}
        subtitle={`${detail.entityNo} · ${detail.displayName}`}
        actions={
          <>
            <Button type="button" variant="ghost" onClick={goBack}>
              <ArrowLeft size={14} /> {t('kyc_back_queue')}
            </Button>
            {!isDecisionLocked(detail.decision) && (
              <KycActionBar
                review={detail}
                role={role}
                onFalsePositive={() => setFpOpen(true)}
                onRequestAdditional={() => setReqOpen(true)}
                onReject={() => setRejectOpen(true)}
                onVerify={() => setVerifyOpen(true)}
                onFinalizeVerify={() => handleError(finalizeVerify())}
                onAddDocument={() => setDocOpen(true)}
              />
            )}
          </>
        }
      />

      <KnownExceptionBanner show={detail.isKnownException} />

      <div className="fs-12 t-mute" style={{ marginTop: 8 }}>
        {t('kyc_last_decision')}: <strong>{decisionLabel}</strong>
        {detail.evaluationNote ? ` — ${detail.evaluationNote}` : ''}
      </div>

      <EntitySummaryPanel review={detail} />
      <RiskScoresPanel riskScore={detail.riskScore} riskSegment={detail.riskSegment} entityNo={detail.entityNo} />
      <KycRawJsonPanel rawJson={detail.rawJson} />

      <div style={{ marginTop: 16 }}>
      <FormCard title={t('scf_panel_documents')} icon={<FileText size={13} />}>
        {detail.documents.length === 0 ? (
          <p className="t-mute fs-12">{t('kyc_no_documents')}</p>
        ) : (
          <DynamicTable
            config={
              {
                rowKey: 'id',
                hideTitleBar: true,
                hideColumnFilters: true,
                pagination: false,
                columns: [
                  { key: 'title', title: t('scf_attach_select'), dataIndex: 'title' },
                  { key: 'status', title: t('rpt_col_status'), dataIndex: 'status' },
                  { key: 'uploadedAt', title: t('td_doc_uploaded'), dataIndex: 'uploadedAt', render: 'renderDate', mono: true },
                ],
                api: {
                  method: async () => ({
                    data: detail.documents as unknown as Record<string, unknown>[],
                    total: detail.documents.length,
                    success: true,
                  }),
                },
              } satisfies TableConfig
            }
            permissions={{}}
            customFunctions={{ renderDate: (val: unknown) => (typeof val === 'string' ? new Date(val).toLocaleString() : '—') }}
            locale="tr"
            t={(k, fb) => t(k, { defaultValue: fb ?? k })}
          />
        )}
      </FormCard>
      </div>

      <div style={{ marginTop: 16 }}>
      <FormCard title={t('kyc_panel_audit')} icon={<FileText size={13} />}>
        {detail.auditLog.length === 0 ? (
          <p className="t-mute fs-12">{t('kyc_no_audit')}</p>
        ) : (
          <DynamicTable
            config={
              {
                rowKey: 'id',
                hideTitleBar: true,
                hideColumnFilters: true,
                pagination: false,
                columns: [
                  { key: 'at', title: t('kyc_audit_at'), dataIndex: 'at', render: 'renderDate', mono: true },
                  { key: 'actorName', title: t('kyc_audit_actor'), dataIndex: 'actorName' },
                  { key: 'action', title: t('kyc_audit_action'), dataIndex: 'action' },
                  { key: 'note', title: t('scf_note'), dataIndex: 'note', render: 'renderNote' },
                ],
                api: {
                  method: async () => ({
                    data: detail.auditLog as unknown as Record<string, unknown>[],
                    total: detail.auditLog.length,
                    success: true,
                  }),
                },
              } satisfies TableConfig
            }
            permissions={{}}
            customFunctions={{
              renderDate: (val: unknown) => (typeof val === 'string' ? new Date(val).toLocaleString() : '—'),
              renderNote: (val: unknown) => String(val ?? '—'),
            }}
            locale="tr"
            t={(k, fb) => t(k, { defaultValue: fb ?? k })}
          />
        )}
      </FormCard>
      </div>

      <FalsePositiveModal
        open={fpOpen}
        onClose={() => setFpOpen(false)}
        onConfirm={(input) => {
          const result = falsePositive(input);
          handleError(result);
          if (result.ok) goBack();
        }}
      />
      <RequestAdditionalModal
        open={reqOpen}
        onClose={() => setReqOpen(false)}
        onConfirm={(input) => handleError(requestAdditional(input))}
      />
      <RejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={(input) => {
          const result = reject(input);
          handleError(result);
          if (result.ok) goBack();
        }}
      />
      <VerifyModal
        open={verifyOpen}
        defaultScore={detail.riskScore}
        onClose={() => setVerifyOpen(false)}
        onConfirm={(input) => handleError(verify(input))}
      />
      <AddDocumentModal
        open={docOpen}
        onClose={() => setDocOpen(false)}
        onConfirm={(input) => handleError(addDocument(input))}
      />
    </>
  );
}

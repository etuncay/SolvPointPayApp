import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, RotateCcw, ThumbsDown, X } from 'lucide-react';
import { Button, DynamicForm, Field, FormMode, type FormConfig } from '@epay/ui';
import type { ApprovalRequest } from '../domain/types';
import { getApprovalFormEntry, stripApprovalConfig } from '../domain/approval-form-registry';
import { computeChangedFields } from '../domain/compute-changed-fields';
import { PayloadDiffView } from './payload-diff-view';

export type ReviewStep = 'review' | 'approve' | 'reject';

type Props = {
  open: boolean;
  approval: ApprovalRequest | null;
  initialStep?: ReviewStep;
  canApprove: boolean;
  canReject: boolean;
  canWithdraw: boolean;
  onClose: () => void;
  onApprove: (comment?: string) => void;
  onReject: (comment: string) => void;
  onWithdraw: () => void;
};

export function ApprovalFormModal({
  open,
  approval,
  initialStep = 'review',
  canApprove,
  canReject,
  canWithdraw,
  onClose,
  onApprove,
  onReject,
  onWithdraw,
}: Props) {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const [step, setStep] = useState<ReviewStep>(initialStep);
  const [comment, setComment] = useState('');

  const formKey = approval?.payload.formKey;
  const config = useMemo<FormConfig | null>(() => {
    const entry = getApprovalFormEntry(formKey);
    if (!entry) return null;
    return stripApprovalConfig(entry.buildConfig(translate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey, i18n.language]);

  const changedFields = useMemo(
    () => computeChangedFields(approval?.payload.newValues, approval?.payload.oldValues),
    [approval],
  );

  useEffect(() => {
    if (open) {
      setStep(initialStep);
      setComment('');
    }
  }, [open, approval?.id, initialStep]);

  if (!open || !approval) return null;

  const close = () => {
    onClose();
  };
  const confirmApprove = () => {
    onApprove(comment.trim() || undefined);
  };
  const confirmReject = () => {
    if (!comment.trim()) return;
    onReject(comment.trim());
  };

  const hasForm = !!config && !!approval.payload.newValues;

  return (
    <div className="modal-backdrop open" onClick={close} role="presentation">
      <div
        className="modal"
        style={{
          width: 940,
          maxWidth: '95vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-head" style={{ flex: '0 0 auto' }}>
          <h2>{approval.screenName}</h2>
          <p className="mono">{approval.referenceNo}</p>
        </div>

        <div
          className="modal-body"
          style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', display: 'block' }}
        >
          {hasForm && (
            <div className="fcard" style={{ marginBottom: 16 }}>
              <div className="fcard-head">
                <h3>{t('ap_review_form', 'İşlem Formu')}</h3>
                {changedFields.length > 0 && (
                  <span className="badge danger">
                    {changedFields.length} {t('ap_changed_fields', 'değişen alan')}
                  </span>
                )}
              </div>
              <div className="fcard-body">
                <DynamicForm
                  config={config!}
                  mode={FormMode.View}
                  initialValues={approval.payload.newValues}
                  diff={{
                    changedFields,
                    oldValues: approval.payload.oldValues,
                    oldLabel: t('ap_diff_old', 'Eski'),
                  }}
                  header={{ hidePageHead: true }}
                  t={translate}
                />
              </div>
            </div>
          )}

          <div className="fcard">
            <div className="fcard-head">
              <h3>{t('ap_review_summary', 'Değişiklik Özeti')}</h3>
            </div>
            <div className="fcard-body padless">
              <PayloadDiffView payload={approval.payload} />
            </div>
          </div>

          {step !== 'review' && (
            <div className="fcard" style={{ marginTop: 16 }}>
              <div className="fcard-body">
                <Field label={t('fcd_comment', 'Yorum')} required={step === 'reject'}>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    autoFocus
                  />
                </Field>
                <p className="t-mute fs-11" style={{ marginTop: 6 }}>
                  {step === 'reject'
                    ? t('ap_comment_reject_hint', 'Red gerekçesi zorunludur.')
                    : t('ap_comment_approve_hint', 'Yorum opsiyoneldir.')}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-foot" style={{ flex: '0 0 auto' }}>
          {step === 'review' ? (
            <>
              <Button type="button" variant="ghost" onClick={close}>
                <X size={14} /> {t('ap_close', 'Kapat')}
              </Button>
              {canWithdraw && (
                <Button type="button" variant="ghost" onClick={() => onWithdraw()}>
                  <RotateCcw size={14} /> {t('ap_action_withdraw')}
                </Button>
              )}
              {canReject && (
                <Button type="button" variant="danger" onClick={() => setStep('reject')}>
                  <ThumbsDown size={14} /> {t('scf_btn_reject')}
                </Button>
              )}
              {canApprove && (
                <Button type="button" variant="primary" onClick={() => setStep('approve')}>
                  <Check size={14} /> {t('fcd_action_approve')}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={() => setStep('review')}>
                {t('form_cancel', 'Vazgeç')}
              </Button>
              {step === 'approve' ? (
                <Button type="button" variant="primary" onClick={confirmApprove}>
                  <Check size={14} /> {t('fcd_action_approve')}
                </Button>
              ) : (
                <Button type="button" variant="danger" onClick={confirmReject} disabled={!comment.trim()}>
                  <ThumbsDown size={14} /> {t('scf_btn_reject')}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, Check, RotateCcw, ThumbsDown } from 'lucide-react';
import { Button, PageHead } from '@epay/ui';
import { rowCanApprove, rowCanReject, rowCanWithdraw } from './domain/permissions';
import { userIdsMatch } from './domain/current-user';
import { useApprovalDetail } from './hooks/use-approval-detail';
import { PayloadDiffView } from './components/payload-diff-view';
import { ApproveModal } from './components/approve-modal';
import { RejectModal } from './components/reject-modal';

function statusLabelKey(uiStatus: string): string {
  const map: Record<string, string> = {
    awaiting_first: 'ap_st_awaiting_first',
    awaiting_second: 'ap_st_awaiting_second',
    second_rejected: 'ap_st_second_rejected',
    approved: 'lv_status_Approved',
    rejected: 'sc_chip_rejected',
    superseded: 'ap_st_superseded',
    withdrawn: 'ap_st_withdrawn',
    canceled: 'lv_status_Canceled',
  };
  return map[uiStatus] ?? uiStatus;
}

export function ApprovalDetailPage() {
  const { t, i18n } = useTranslation();
  const { user, detail, loading, notFound, approve, reject, withdraw, resubmit, goBack } =
    useApprovalDetail();
  const tr = i18n.language === 'tr';

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

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
        <h3>{t('ap_not_found')}</h3>
        <Button type="button" variant="ghost" onClick={goBack}>
          <ArrowLeft size={14} /> {t('s_op_approval')}
        </Button>
      </div>
    );
  }

  const canAp = rowCanApprove(user, detail);
  const canRe = rowCanReject(user, detail);
  const canWd = rowCanWithdraw(user, detail);
  const isWithdrawn = detail.uiStatus === 'withdrawn';

  const fmtDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString(tr ? 'tr-TR' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  const onApprove = (comment?: string) => {
    const result = approve(comment);
    if (!result.ok) toast.error(t(result.error ?? 'ap_save_failed'));
    else toast.success(t('ap_approved'));
  };

  const onReject = (comment: string) => {
    const result = reject(comment);
    if (!result.ok) toast.error(t(result.error ?? 'ap_save_failed'));
    else toast.success(t('ap_rejected'));
  };

  const onWithdraw = () => {
    const result = withdraw();
    if (!result.ok) toast.error(t(result.error ?? 'ap_save_failed'));
    else toast.success(t('ap_withdrawn'));
  };

  const onResubmit = () => {
    const result = resubmit();
    if (!result.ok) toast.error(t(result.error ?? 'ap_save_failed'));
    else toast.success(t('ap_resubmitted'));
  };

  return (
    <>
      <PageHead
        title={detail.screenName}
        subtitle={detail.referenceNo}
        meta={
          <span className={`st ${detail.uiStatus === 'approved' ? 'active' : 'inactive'}`}>
            {t(statusLabelKey(detail.uiStatus))}
          </span>
        }
        actions={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button type="button" variant="ghost" onClick={goBack}>
              <ArrowLeft size={14} /> {t('s_op_approval')}
            </Button>
            {canAp && (
              <Button type="button" variant="primary" onClick={() => setApproveOpen(true)}>
                <Check size={14} /> {t('fcd_action_approve')}
              </Button>
            )}
            {canRe && (
              <Button type="button" variant="danger" onClick={() => setRejectOpen(true)}>
                <ThumbsDown size={14} /> {t('scf_btn_reject')}
              </Button>
            )}
            {canWd && (
              <Button type="button" variant="ghost" onClick={onWithdraw}>
                <RotateCcw size={14} /> {t('ap_action_withdraw')}
              </Button>
            )}
            {isWithdrawn && userIdsMatch(user.id, detail.initiatedBy) && (
              <>
                <Button type="button" variant="primary" onClick={onResubmit}>
                  {t('ap_resubmit')}
                </Button>
                <Button type="button" variant="ghost" onClick={goBack}>
                  {t('lf_cancel_back')}
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="fcard" style={{ marginBottom: 16 }}>
        <div className="fcard-body">
          <dl className="fs-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div>
              <dt className="t-mute">{t('ap_col_initiator')}</dt>
              <dd>{detail.initiatedByName}</dd>
            </div>
            <div>
              <dt className="t-mute">{t('ap_col_date')}</dt>
              <dd className="mono">{fmtDate(detail.initiatedAt)}</dd>
            </div>
            <div>
              <dt className="t-mute">{t('ap_col_first_approver')}</dt>
              <dd>{detail.firstApproverName ?? '—'}</dd>
            </div>
            <div>
              <dt className="t-mute">{t('ap_col_second_approver')}</dt>
              <dd>{detail.secondApproverName ?? '—'}</dd>
            </div>
            {detail.comment && (
              <div style={{ gridColumn: '1 / -1' }}>
                <dt className="t-mute">{t('fcd_comment')}</dt>
                <dd>{detail.comment}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="fcard">
        <div className="fcard-head">
          <h3>{tr ? 'Değişiklikler' : 'Changes'}</h3>
        </div>
        <div className="fcard-body padless">
          <PayloadDiffView payload={detail.payload} />
        </div>
      </div>

      <ApproveModal open={approveOpen} onClose={() => setApproveOpen(false)} onConfirm={onApprove} />
      <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} onConfirm={onReject} />
    </>
  );
}

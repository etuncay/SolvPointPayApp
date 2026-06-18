import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Check, Eye, RotateCcw, ThumbsDown } from 'lucide-react';
import { DynamicTable, PageHead, type TableConfig, type TableCustomFunctions } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import type { ApprovalListFilter } from './domain/types';
import { getApprovalPoolPermissions, rowCanApprove, rowCanReject, rowCanWithdraw } from './domain/permissions';
import { useApprovalCurrentUser } from './hooks/use-approval-current-user';
import { approvalsService } from './api';
import { ApprovalFormModal, type ReviewStep } from './components/approval-form-modal';
import { buildApprovalsTableConfig } from './approvals-table-config';

const FILTERS: { key: ApprovalListFilter; labelKey: string }[] = [
  { key: 'pending_mine', labelKey: 'ap_filter_pending' },
  { key: 'initiated_mine', labelKey: 'ap_filter_initiated' },
  { key: 'approved_mine', labelKey: 'ap_filter_approved' },
  { key: 'rejected_mine', labelKey: 'ap_filter_rejected' },
  { key: 'all', labelKey: 'ib_all' },
];

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

type ApprovalsLocationState = { reviewId?: number };

export function ApprovalsPage() {
  const { t, i18n } = useTranslation();
  const { role } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const permissions = getApprovalPoolPermissions(role);
  const user = useApprovalCurrentUser();
  const tr = i18n.language === 'tr';

  const [filter, setFilter] = useState<ApprovalListFilter>('pending_mine');
  const [rev, setRev] = useState(0);
  const [review, setReview] = useState<{ id: number; step: ReviewStep } | null>(null);

  useEffect(() => {
    const reviewId = (location.state as ApprovalsLocationState | null)?.reviewId;
    if (reviewId == null) return;
    setReview({ id: reviewId, step: 'review' });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const rows = useMemo(
    () => approvalsService.list(filter, user),
    [filter, user, rev],
  );
  const pendingCount = useMemo(
    () => approvalsService.countPendingForUser(user),
    [user, rev],
  );

  const bump = () => setRev((v) => v + 1);

  const reviewApproval = useMemo(
    () => (review ? approvalsService.getById(review.id) : null),
    [review, rev],
  );

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

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const tableConfig = useMemo(() => {
    const base = buildApprovalsTableConfig(translate);
    return {
      ...base,
      api: {
        method: async () => ({
          data: rows as unknown as Record<string, unknown>[],
          total: rows.length,
          success: true,
        }),
      },
    } satisfies TableConfig;
  }, [rows, translate]);

  const customFunctions: TableCustomFunctions = useMemo(
    () => ({
      renderDate: (val: unknown) => fmtDate(val == null ? null : String(val)),
      renderStatus: (val: unknown, row: Record<string, unknown>) => {
        const uiStatus = String(val);
        const cls =
          uiStatus === 'approved'
            ? 'active'
            : uiStatus.includes('reject') || uiStatus === 'rejected'
              ? 'blocked'
              : 'inactive';
        return <span className={`st ${cls}`}>{t(statusLabelKey(uiStatus))}</span>;
      },
      renderActions: (val: unknown, row: Record<string, unknown>) => {
        const id = Number(val);
        const r = row as unknown as Parameters<typeof rowCanApprove>[1];
        const canAp = rowCanApprove(user, r);
        const canRe = rowCanReject(user, r);
        const canWd = rowCanWithdraw(user, r);
        return (
          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
            {permissions.view && (
              <button type="button" title={t('act_view')} onClick={() => setReview({ id, step: 'review' })}>
                <Eye size={14} />
              </button>
            )}
            {canAp && (
              <button type="button" title={t('fcd_action_approve')} onClick={() => setReview({ id, step: 'approve' })}>
                <Check size={14} />
              </button>
            )}
            {canRe && (
              <button type="button" title={t('scf_btn_reject')} onClick={() => setReview({ id, step: 'reject' })}>
                <ThumbsDown size={14} />
              </button>
            )}
            {canWd && (
              <button type="button" title={t('ap_action_withdraw')} onClick={() => setReview({ id, step: 'review' })}>
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        );
      },
    }),
    [fmtDate, permissions.view, t, user],
  );

  const doApprove = (comment?: string) => {
    if (!review) return;
    const result = approvalsService.approve(review.id, user, comment);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ap_save_failed'));
      return;
    }
    toast.success(t('ap_approved'));
    setReview(null);
    bump();
  };

  const doReject = (comment: string) => {
    if (!review) return;
    const result = approvalsService.reject(review.id, user, comment);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ap_save_failed'));
      return;
    }
    toast.success(t('ap_rejected'));
    setReview(null);
    bump();
  };

  const doWithdraw = () => {
    if (!review) return;
    const result = approvalsService.withdraw(review.id, user);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ap_save_failed'));
      return;
    }
    toast.success(t('ap_withdrawn'));
    setReview(null);
    bump();
  };

  return (
    <>
      <PageHead
        title={t('s_op_approval')}
        subtitle={t('ap_subtitle')}
        meta={pendingCount > 0 ? <span className="badge accent">{pendingCount}</span> : undefined}
      />

      <div className="filter-chips" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`chip ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      <div className="fcard">
        <div className="fcard-body padless">
          <DynamicTable
            config={tableConfig}
            permissions={{}}
            customFunctions={customFunctions}
            locale={i18n.language}
            t={translate}
          />
        </div>
      </div>

      {reviewApproval && (
        <ApprovalFormModal
          open={review != null}
          approval={reviewApproval}
          initialStep={review?.step}
          canApprove={rowCanApprove(user, reviewApproval)}
          canReject={rowCanReject(user, reviewApproval)}
          canWithdraw={rowCanWithdraw(user, reviewApproval)}
          onClose={() => setReview(null)}
          onApprove={doApprove}
          onReject={doReject}
          onWithdraw={doWithdraw}
        />
      )}
    </>
  );
}

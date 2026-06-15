import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { Button, Field, FormCard, FormGrid, FormLayout } from '@epay/ui';
import { LeaveTypeBadge } from '@/features/hr/leaves/components/leave-type-badge';
import { LeaveTaskStatusPill } from '@/features/hr/leaves/components/leave-task-status-pill';
import { CancelContextBanner } from './components/cancel-context-banner';
import { WorkingDaysField } from './components/working-days-field';
import type { useLeaveForm } from './hooks/use-leave-form';

type Api = ReturnType<typeof useLeaveForm>;

export function LeaveForm({ api }: { api: Api }) {
  const { t } = useTranslation();
  const {
    mode: _mode,
    isView,
    isCancel,
    isCreate,
    detail,
    register,
    watch,
    workingDays,
    canSubmit,
    goToApproval,
    approvalId,
  } = api;

  const originalStart = detail?.originalStartDate ?? detail?.startDate;
  const originalEnd = detail?.originalEndDate ?? detail?.endDate;

  return (
    <>
      {isCancel && originalStart && originalEnd ? (
        <CancelContextBanner startDate={originalStart} endDate={originalEnd} />
      ) : null}

      {isView && detail ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
          <LeaveTypeBadge type={detail.leaveType} />
          <LeaveTaskStatusPill status={detail.taskStatus} />
          {approvalId ? (
            <Button type="button" variant="ghost" onClick={goToApproval}>
              <ExternalLink size={14} /> {t('lf_open_approval')}
            </Button>
          ) : null}
        </div>
      ) : null}

      <FormLayout>
        <FormCard title={t('lf_page_subtitle')}>
          <div id="leave-form">
            <FormGrid cols={2}>
              <Field label={t('lv_col_type')} required>
                {isCreate ? (
                  <select className="select" {...register('leaveType')}>
                    <option value="AnnualLeave">{t('lv_type_AnnualLeave')}</option>
                    <option value="SickLeave">{t('lv_type_SickLeave')}</option>
                    <option value="ExcuseLeave">{t('lv_type_ExcuseLeave')}</option>
                    <option value="UnpaidLeave">{t('lv_type_UnpaidLeave')}</option>
                    <option value="Other">{t('frp_type_Other')}</option>
                  </select>
                ) : detail ? (
                  <div style={{ paddingTop: 8 }}>
                    <LeaveTypeBadge type={detail.leaveType} />
                  </div>
                ) : null}
              </Field>

              <WorkingDaysField value={workingDays} />

              <Field label={t('sj_log_col_start')} required>
                <input
                  type="date"
                  className="input"
                  disabled={isView}
                  readOnly={isView}
                  {...register('startDate')}
                />
              </Field>

              <Field label={t('sj_log_col_end')} required>
                <input
                  type="date"
                  className="input"
                  disabled={isView || (isCancel && watch('cancelFull'))}
                  readOnly={isView}
                  {...register('endDate')}
                />
              </Field>

              {isCancel && !isView ? (
                <Field label={t('lf_full_cancel')}>
                  <label className="fs-12" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="checkbox" {...register('cancelFull')} />
                    {t('lf_full_cancel_hint')}
                  </label>
                </Field>
              ) : null}

              <Field label={t('scf_notes')} col={2}>
                <textarea
                  className="input"
                  rows={3}
                  disabled={isView}
                  readOnly={isView}
                  placeholder={isCancel ? t('lf_cancel_notes_ph') : t('lf_notes_ph')}
                  {...register('notes')}
                />
              </Field>
            </FormGrid>
          </div>
        </FormCard>
      </FormLayout>
    </>
  );
}

export type LeaveFormActionsProps = {
  api: Api;
};

export function LeaveFormActions({ api }: LeaveFormActionsProps) {
  const { t } = useTranslation();
  const { canSubmit, onCancel } = api;

  return (
    <>
      {canSubmit ? (
        <Button type="button" variant="primary" onClick={api.onSubmit}>
          {t('lf_submit_approval')}
        </Button>
      ) : null}
      <Button type="button" variant="ghost" onClick={onCancel}>
        {t('lf_cancel_back')}
      </Button>
    </>
  );
}

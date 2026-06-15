import { useTranslation } from 'react-i18next';
import { JOB_HANDLER_SERVICE_URLS } from '../../domain/job-handler-registry';
import type { CreateJobInput, ScheduledJob, UpdateJobPayload } from '../../domain/types';

type Props = {
  job: ScheduledJob;
  draft: UpdateJobPayload | CreateJobInput;
  canEdit: boolean;
  isCreate?: boolean;
  allJobOptions: { id: string; name: string }[];
  onPatch: (patch: Partial<UpdateJobPayload & CreateJobInput>) => void;
  onJobType: (t: ScheduledJob['jobType']) => void;
};

export function DefinitionTab({
  job,
  draft,
  canEdit,
  isCreate,
  allJobOptions,
  onPatch,
  onJobType,
}: Props) {
  const { t } = useTranslation();
  const jobType = draft.jobType ?? job.jobType;

  return (
    <div className="card" style={{ padding: 20, display: 'grid', gap: 12, maxWidth: 720 }}>
      <label className="fs-12">
        <span className="t-mute">{t('sj_col_name')}</span>
        <input
          className="input"
          disabled={!canEdit}
          value={draft.name ?? ''}
          onChange={(e) => onPatch({ name: e.target.value })}
        />
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('rpt_col_desc')}</span>
        <textarea
          className="input"
          rows={2}
          disabled={!canEdit}
          value={draft.description ?? ''}
          onChange={(e) => onPatch({ description: e.target.value })}
        />
      </label>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <label className="fs-12">
          <span className="t-mute">{t('scf_col_status')}</span>
          <select
            className="select"
            disabled={!canEdit}
            value={draft.status ?? job.status}
            onChange={(e) => onPatch({ status: e.target.value as ScheduledJob['status'] })}
          >
            <option value="Active">{t('ib_status_Active')}</option>
            <option value="Passive">{t('rs_status_passive')}</option>
          </select>
        </label>
        <label className="fs-12">
          <span className="t-mute">{t('sj_col_type')}</span>
          <select
            className="select"
            disabled={!canEdit}
            value={jobType}
            onChange={(e) => onJobType(e.target.value as ScheduledJob['jobType'])}
          >
            <option value="Once">{t('sj_type_Once')}</option>
            <option value="Recurring">{t('sj_type_Recurring')}</option>
          </select>
        </label>
      </div>
      {jobType === 'Recurring' ? (
        <label className="fs-12">
          <span className="t-mute">{t('sj_field_cron')}</span>
          <input
            className="input mono"
            disabled={!canEdit}
            value={draft.cronExpression ?? ''}
            onChange={(e) => onPatch({ cronExpression: e.target.value })}
            placeholder="0 8 * * *"
          />
        </label>
      ) : null}
      <label className="fs-12">
        <span className="t-mute">{t('sj_col_owner')}</span>
        <input
          className="input"
          disabled={!canEdit}
          value={draft.owner ?? ''}
          onChange={(e) => onPatch({ owner: e.target.value })}
        />
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('sj_field_service')}</span>
        {isCreate ? (
          <select
            className="select mono fs-12"
            disabled={!canEdit}
            value={'serviceUrl' in draft && draft.serviceUrl ? draft.serviceUrl : job.serviceUrl}
            onChange={(e) => onPatch({ serviceUrl: e.target.value } as Partial<UpdateJobPayload>)}
          >
            {JOB_HANDLER_SERVICE_URLS.map((url) => (
              <option key={url} value={url}>
                {url}
              </option>
            ))}
          </select>
        ) : (
          <input className="input mono" readOnly value={job.serviceUrl} />
        )}
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('sj_field_dependencies')}</span>
        <select
          className="select"
          multiple
          disabled={!canEdit}
          style={{ minHeight: 80 }}
          value={draft.dependencyIds ?? []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
            onPatch({ dependencyIds: selected });
          }}
        >
          {allJobOptions
            .filter((o) => o.id !== job.id)
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
        </select>
      </label>
      <div style={{ display: 'flex', gap: 12 }}>
        <label className="fs-12">
          <span className="t-mute">{t('sj_field_max_retry')}</span>
          <input
            className="input"
            type="number"
            min={1}
            disabled={!canEdit}
            value={draft.maxRetry ?? 1}
            onChange={(e) => onPatch({ maxRetry: Number(e.target.value) })}
          />
        </label>
        <label className="fs-12">
          <span className="t-mute">{t('sj_field_retry_interval')}</span>
          <input
            className="input"
            type="number"
            min={1}
            disabled={!canEdit}
            value={draft.retryIntervalSec ?? 60}
            onChange={(e) => onPatch({ retryIntervalSec: Number(e.target.value) })}
          />
        </label>
      </div>
      <label className="fs-12">
        <span className="t-mute">{t('sj_field_payload')}</span>
        <textarea
          className="input mono fs-12"
          rows={4}
          disabled={!canEdit}
          value={draft.payload ?? '{}'}
          onChange={(e) => onPatch({ payload: e.target.value })}
        />
      </label>
      <label className="fs-12">
        <span className="t-mute">{t('sj_field_feedback_email')}</span>
        <input
          className="input"
          type="email"
          disabled={!canEdit}
          value={draft.feedbackEmail ?? ''}
          onChange={(e) => onPatch({ feedbackEmail: e.target.value || null })}
        />
      </label>
    </div>
  );
}

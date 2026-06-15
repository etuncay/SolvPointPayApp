import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { FormLayout, FormPrimaryActions, PageHead } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { scheduledJobsService } from './api/mock-scheduled-jobs-adapter';
import { DefinitionTab } from './components/tabs/definition-tab';
import { canMutateScheduledJobs } from './domain/permissions';
import type { CreateJobInput, ScheduledJob } from './domain/types';
import { useJobCreateDefaults } from './hooks/use-job-detail';

export function JobFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const user = getCurrentUser(role);
  const defaults = useJobCreateDefaults();
  const [input, setInput] = useState<CreateJobInput>(defaults);

  const pseudoJob: ScheduledJob = useMemo(
    () => ({
      id: '__new__',
      code: '',
      name: input.name,
      description: input.description,
      status: input.status,
      jobType: input.jobType,
      cronExpression: input.cronExpression,
      owner: input.owner,
      serviceUrl: input.serviceUrl,
      dependencyIds: input.dependencyIds,
      maxRetry: input.maxRetry,
      retryIntervalSec: input.retryIntervalSec,
      payload: input.payload,
      feedbackEmail: input.feedbackEmail,
      createdAt: '',
      updatedAt: '',
    }),
    [input],
  );

  const allJobs = scheduledJobsService.list(role, {
    query: '',
    status: 'any',
    jobType: 'any',
  });

  if (!canMutateScheduledJobs(role)) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = () => {
    const result = scheduledJobsService.create(role, user.id, input);
    if (!result.ok) {
      toast.error(t(result.errorCode, result.errorCode));
      return;
    }
    toast.success(t('sj_created_ok'));
    navigate(`/system/jobs/${result.job.id}`);
  };

  return (
    <>
      <PageHead
        title={t('sj_new_job')}
        subtitle={t('sj_new_subtitle')}
        actions={
          <FormPrimaryActions
            showSave
            onSave={onSubmit}
            saveLabel={
              <>
                <Save size={14} /> {t('sj_create')}
              </>
            }
            saveDisabled={!input.name.trim()}
            showCancel
            onCancel={() => navigate('/system/jobs')}
            cancelLabel={t('fr_back_list')}
          />
        }
      />
      <FormLayout>
        <DefinitionTab
          job={pseudoJob}
          draft={input}
          canEdit
          isCreate
          allJobOptions={allJobs.map((j) => ({ id: j.id, name: j.name }))}
          onPatch={(patch) => setInput((prev) => ({ ...prev, ...patch }))}
          onJobType={(jobType) =>
            setInput((prev) => ({
              ...prev,
              jobType,
              cronExpression: jobType === 'Once' ? null : prev.cronExpression ?? '0 8 * * *',
            }))
          }
        />
      </FormLayout>
    </>
  );
}

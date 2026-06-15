import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Gauge,
  Play,
  Save,
  Settings2,
} from 'lucide-react';
import { Button, FormLayout, FormPrimaryActions, PageHead, SectionRail } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { scheduledJobsService } from './api/mock-scheduled-jobs-adapter';
import { JobRecordStatusPill } from './components/job-record-status-pill';
import { DefinitionTab } from './components/tabs/definition-tab';
import { LogTab } from './components/tabs/log-tab';
import { ManualRunTab } from './components/tabs/manual-run-tab';
import { PerformanceTab } from './components/tabs/performance-tab';
import { ScheduleTab } from './components/tabs/schedule-tab';
import { canAccessScheduledJobs, canMutateScheduledJobs } from './domain/permissions';
import { useJobDetail } from './hooks/use-job-detail';

export function JobDetailPage() {
  const { t } = useTranslation();
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { role } = useRole();
  const user = getCurrentUser(role);
  const canEdit = canMutateScheduledJobs(role);
  const vm = useJobDetail(role, jobId);
  const [activeSec, setActiveSec] = useState('definition');

  const sections = useMemo(
    () => [
      { id: 'definition', no: '1', label: t('sj_tab_definition') },
      { id: 'schedule', no: '2', label: t('sj_tab_schedule') },
      { id: 'manual', no: '3', label: t('sj_tab_manual') },
      { id: 'log', no: '4', label: t('sj_tab_log') },
      { id: 'performance', no: '5', label: t('sj_tab_performance') },
    ],
    [t],
  );

  if (!canAccessScheduledJobs(role)) {
    return <Navigate to="/" replace />;
  }

  if (vm.loading) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <p className="t-mute">…</p>
      </div>
    );
  }

  if (!vm.job) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('sj_not_found')}</h3>
        <Button type="button" variant="ghost" onClick={() => navigate('/system/jobs')}>
          <ArrowLeft size={14} /> {t('fr_back_list')}
        </Button>
      </div>
    );
  }

  const onSave = async () => {
    const result = await scheduledJobsService.update(role, user.id, vm.job!.id, vm.draft);
    if (!result.ok) {
      toast.error(t(result.errorCode, result.errorCode));
      return;
    }
    toast.success(t('sj_saved_ok'));
    vm.bump();
  };

  const onToggle = async () => {
    const result = await scheduledJobsService.toggleStatus(role, user.id, vm.job!.id);
    if (!result.ok) {
      toast.error(t(result.errorCode, result.errorCode));
      return;
    }
    toast.success(t('rs_toggled'));
    vm.bump();
  };

  const onManualRun = async (input: {
    reason: string;
    scheduledAt?: string;
    feedbackEmail?: string;
  }) => {
    const result = await scheduledJobsService.run(
      role,
      user.id,
      user.displayName,
      vm.job!.id,
      input,
    );
    if (!result.ok) {
      toast.error(t(result.errorCode, result.errorCode));
      return { ok: false, errorCode: result.errorCode };
    }
    toast.success(t('sj_run_ok'));
    vm.bump();
    return { ok: true };
  };

  return (
    <>
      <PageHead
        title={vm.job.name}
        subtitle={vm.job.code}
        status={<JobRecordStatusPill status={vm.job.status} />}
        actions={
          <FormPrimaryActions
            leading={
              canEdit ? (
                <Button type="button" variant="ghost" onClick={onToggle}>
                  {vm.job.status === 'Active' ? t('rs_deactivate') : t('rs_activate')}
                </Button>
              ) : undefined
            }
            showSave={canEdit}
            onSave={onSave}
            saveLabel={
              <>
                <Save size={14} /> {t('ib_save')}
              </>
            }
            saveDisabled={!vm.dirty}
            showCancel
            onCancel={() => navigate('/system/jobs')}
            cancelLabel={
              <>
                <ArrowLeft size={14} /> {t('fr_back_list')}
              </>
            }
          />
        }
      />

      <FormLayout
        rail={
          <SectionRail
            sections={sections}
            activeId={activeSec}
            title={t('sj_detail_title')}
            onNavigate={setActiveSec}
          />
        }
      >
        {activeSec === 'definition' ? (
          <DefinitionTab
            job={vm.job}
            draft={vm.draft}
            canEdit={canEdit}
            allJobOptions={vm.allJobs.map((j) => ({ id: j.id, name: j.name }))}
            onPatch={vm.patchDraft}
            onJobType={vm.setJobType}
          />
        ) : null}
        {activeSec === 'schedule' ? <ScheduleTab job={vm.job} /> : null}
        {activeSec === 'manual' ? (
          <ManualRunTab job={vm.job} canEdit={canEdit} onRun={onManualRun} />
        ) : null}
        {activeSec === 'log' ? <LogTab logs={vm.logs} jobName={vm.job.name} /> : null}
        {activeSec === 'performance' ? <PerformanceTab metrics={vm.performance} /> : null}
      </FormLayout>
    </>
  );
}

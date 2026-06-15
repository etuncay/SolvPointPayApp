import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, FlaskConical, UserPlus } from 'lucide-react';
import { Button, FormLayout, PageHead, SectionRail } from '@epay/ui';
import { ActionBuilder } from './components/action-builder';
import { AddExceptionModal } from './components/add-exception-modal';
import { ExceptionsPanel } from './components/exceptions-panel';
import { RulePanel } from './components/rule-panel';
import { SimulationModal } from './components/simulation-modal';
import { VersionHistoryPanel } from './components/version-history-panel';
import { useFraudRuleDetail } from './hooks/use-fraud-rule-detail';

export function FraudRuleDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const vm = useFraudRuleDetail();
  const [activeSec, setActiveSec] = useState('rule');
  const [simOpen, setSimOpen] = useState(false);
  const [simMetrics, setSimMetrics] = useState<ReturnType<typeof vm.simulate>>(null);
  const [excOpen, setExcOpen] = useState(false);

  const sections = useMemo(
    () => [
      { id: 'rule', no: '1', label: t('col_rule') },
      { id: 'actions', no: '2', label: t('rs_col_actions') },
      { id: 'versions', no: '3', label: t('frd_panel_versions') },
      { id: 'exceptions', no: '4', label: t('frd_panel_exceptions') },
    ],
    [t],
  );

  if (!vm.permissions.view) {
    return <Navigate to="/" replace />;
  }

  if (vm.notFound) {
    return (
      <div>
        <p className="t-mute">{t('frd_not_found')}</p>
        <Link to="/risk/fraud-rules">{t('fr_back_list')}</Link>
      </div>
    );
  }

  const title = vm.isNew ? t('fr_new_rule') : vm.detail?.rule.title ?? vm.ruleId;
  const statusLabel =
    vm.detail?.rule.status === 'Passive' ? t('rs_status_passive') : t('ib_status_Active');

  const handleCancel = () => {
    if (vm.dirty && !window.confirm(t('frd_discard_confirm'))) return;
    navigate('/risk/fraud-rules');
  };

  const runSave = (stay: boolean) => {
    const result = vm.save();
    if (!result.ok) {
      toast.error(t(result.error ?? 'frd_save_failed', result.error ?? ''));
      return;
    }
    toast.success(t('frd_save_ok'));
    if (result.id) vm.afterSave(result.id, stay);
    if (!stay) navigate('/risk/fraud-rules');
  };

  const handleSimulate = () => {
    const m = vm.simulate();
    setSimMetrics(m);
    setSimOpen(true);
    if (!m) toast.error(t('frd_sim_failed'));
  };

  const handleException = (input: Parameters<typeof vm.addException>[0]) => {
    const r = vm.addException(input);
    if (!r.ok) {
      toast.error(t(r.error ?? 'frd_save_failed', r.error ?? ''));
      return;
    }
    toast.success(t('frd_exception_ok'));
    setExcOpen(false);
  };

  const handleToggle = () => {
    const r = vm.toggle();
    if (!r.ok) toast.error(t(r.error ?? 'frd_save_failed', r.error ?? ''));
    else toast.success(t('rs_toggled'));
  };

  const handleExceptionClick = () => {
    if (!vm.canPersist) {
      toast.info(t('frd_save_first'));
      return;
    }
    setExcOpen(true);
  };

  return (
    <>
      <PageHead
        title={title}
        subtitle={t('frd_page_subtitle')}
        status={
          vm.isNew ? (
            <span className="mono fs-11 t-mute">7.4.1</span>
          ) : (
            <span className="mono fs-11">
              {vm.ruleId} · {statusLabel}
            </span>
          )
        }
        actions={
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" onClick={handleSimulate}>
              <FlaskConical size={14} /> {t('rs_simulation_btn')}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExceptionClick}>
              <UserPlus size={14} /> {t('frd_add_exception')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => runSave(true)}>
              {t('frd_save_continue')}
            </Button>
            <Button variant="primary" size="sm" onClick={() => runSave(false)}>
              {t('frd_save_finish')}
            </Button>
            {vm.canPersist && (
              <Button variant="ghost" size="sm" onClick={handleToggle}>
                {vm.detail?.rule.status === 'Passive' ? t('rs_activate') : t('rs_deactivate')}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              {t('ib_cancel')}
            </Button>
          </div>
        }
      />

      <div style={{ marginBottom: 12 }}>
        <Link to="/risk/fraud-rules" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> {t('fr_back_list')}
        </Link>
      </div>

      <FormLayout
        rail={
          <SectionRail
            sections={sections}
            activeId={activeSec}
            title={t('frd_sections')}
            onNavigate={(id) => {
              setActiveSec(id);
              document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        }
      >
        <RulePanel input={vm.input} onChange={vm.patchInput} onValidateDsl={vm.validateDsl} />
        <ActionBuilder input={vm.input} onChange={vm.patchInput} actionError={vm.actionError} />
        <VersionHistoryPanel versions={vm.detail?.versions ?? []} />
        <ExceptionsPanel
          exceptions={vm.detail?.exceptions ?? []}
          onAdd={handleExceptionClick}
          canAdd={vm.canPersist}
        />
      </FormLayout>

      <SimulationModal
        open={simOpen}
        onClose={() => setSimOpen(false)}
        metrics={simMetrics}
      />
      <AddExceptionModal
        open={excOpen}
        onClose={() => setExcOpen(false)}
        onSubmit={handleException}
      />
    </>
  );
}

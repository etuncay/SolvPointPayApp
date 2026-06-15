import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button, FormLayout, PageHead, SectionRail } from '@epay/ui';
import { CaseStatusPill } from '../components/case-status-pill';
import { useSupportCaseForm } from './hooks/use-support-case-form';
import { InfoPanel } from './components/info-panel';
import { ActionsPanel } from './components/actions-panel';
import { DocumentsPanel } from './components/documents-panel';
import { CaseActionBar } from './components/case-action-bar';
import { CaseActionModal } from './components/case-action-modal';
import { AttachDocumentModal } from './components/attach-document-modal';
import type { ActionButtonId } from './domain/form-permissions';
import type { ActionKind } from './domain/transitions';
import {
  validateNotePayload,
  validateReopen,
  validateReject,
  validateResolve,
  validateTransfer,
} from './domain/validation';

export function SupportCaseFormPage() {
  const { t } = useTranslation();
  const vm = useSupportCaseForm();
  const [activeSec, setActiveSec] = useState('info');
  const [modalKind, setModalKind] = useState<ActionKind | null>(null);
  const [attachOpen, setAttachOpen] = useState(false);

  const sections = useMemo(() => {
    const base: { id: string; no: string; label: string }[] = [
      { id: 'info', no: '1', label: t('scf_panel_info') },
    ];
    if (!vm.isNew && vm.detail) {
      base.push(
        { id: 'actions', no: '2', label: t('scf_panel_actions') },
        { id: 'docs', no: '3', label: t('scf_panel_documents') },
      );
    }
    return base;
  }, [vm.isNew, vm.detail, t]);

  if (!vm.perms.list && !vm.perms.insert) {
    return <Navigate to="/" replace />;
  }

  if (vm.notFound) {
    return <Navigate to="/support/cases" replace />;
  }

  if (vm.loading) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <p className="t-mute">{t('loading')}</p>
      </div>
    );
  }

  const handleBar = (id: ActionButtonId) => {
    if (id === 'save') {
      const result = vm.saveCreate();
      if (!result) return;
      if (!result.ok) {
        toast.error(t(result.error));
        return;
      }
      toast.success(t('scf_created'));
      return;
    }
    if (id === 'attach') {
      setAttachOpen(true);
      return;
    }
    if (id === 'take') {
      const result = vm.runAction('take', { note: t('scf_take_default_note') });
      if (!result.ok) toast.error(t(result.error));
      else toast.success(t('scf_action_done'));
      return;
    }
    const map: Partial<Record<ActionButtonId, ActionKind>> = {
      transfer: 'transfer',
      contact: 'contact',
      infoRequest: 'infoRequest',
      resolve: 'resolve',
      reject: 'reject',
      reopen: 'reopen',
    };
    const kind = map[id];
    if (kind) setModalKind(kind);
  };

  const submitModal = (payload: Record<string, string>) => {
    if (!modalKind) return;
    let valid: { ok: true } | { ok: false; error: string } = validateNotePayload(payload.note ?? '');
    if (modalKind === 'transfer') {
      valid = validateTransfer({
        departmentId: payload.departmentId ?? '',
        ownerUserId: payload.ownerUserId ?? '',
      });
    }
    if (modalKind === 'resolve') {
      valid = validateResolve({
        resolutionCode: payload.resolutionCode ?? '',
        finalText: payload.note ?? '',
      });
    }
    if (modalKind === 'reject') {
      valid = validateReject({
        reasonCode: payload.reasonCode ?? '',
        explanation: payload.note ?? '',
      });
    }
    if (modalKind === 'reopen') valid = validateReopen({ reopenReason: payload.reopenReason ?? '' });
    if (!valid.ok) {
      toast.error(t(valid.error));
      return;
    }
    const result = vm.runAction(modalKind, payload);
    setModalKind(null);
    if (!result.ok) {
      toast.error(t(result.error));
      return;
    }
    toast.success(t('scf_action_done'));
  };

  return (
    <>
      <PageHead
        title={vm.isNew ? t('s_supp_new') : vm.detail?.caseNo ?? t('scf_edit')}
        subtitle={vm.isNew ? t('scf_subtitle_new') : vm.detail?.subject}
        status={vm.detail ? <CaseStatusPill status={vm.detail.caseStatus} /> : null}
        actions={
          <>
            <CaseActionBar
              buttons={vm.buttons}
              onAction={handleBar}
              saveDisabled={!vm.form.formState.isDirty}
            />
            <Button type="button" variant="ghost" onClick={vm.cancel}>
              {t('scf_back_list')}
            </Button>
          </>
        }
      />

      {vm.isReconciliationLocked && vm.detail?.reconciliationId != null ? (
        <p className="fs-12 t-mute" style={{ marginBottom: 12 }}>
          <Link to="/banks/reconciliation">{t('scf_back_recon')}</Link>
        </p>
      ) : null}

      <FormLayout
        rail={
          <SectionRail
            sections={sections}
            activeId={activeSec}
            title={vm.isNew ? t('s_supp_new') : (vm.detail?.caseNo ?? t('scf_edit'))}
            onNavigate={setActiveSec}
          />
        }
      >
        {activeSec === 'info' ? (
          <InfoPanel
            form={vm.form}
            readonly={!vm.isNew || vm.isReconciliationLocked}
            caseNo={vm.previewCaseNo}
          />
        ) : null}
        {activeSec === 'actions' && vm.detail ? <ActionsPanel detail={vm.detail} /> : null}
        {activeSec === 'docs' && vm.detail ? <DocumentsPanel documents={vm.detail.documents} /> : null}
      </FormLayout>

      <CaseActionModal kind={modalKind} onClose={() => setModalKind(null)} onSubmit={submitModal} />
      <AttachDocumentModal
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        onAttached={(id) => {
          vm.attachDocument(id);
          toast.success(t('scf_attached'));
        }}
      />
    </>
  );
}

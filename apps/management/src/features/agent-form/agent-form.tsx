import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Ban,
  Building2,
  Eye,
  FileText,
  History,
  Upload,
} from 'lucide-react';
import { Button, DynamicForm, FormMode, type CustomFunctions } from '@epay/ui';
import { BlockModal } from '@/features/individual-form/components/block-modal';
import { BgChecksBanner } from '@/features/corporate-form/components/bg-checks-banner';
import { DocUploadModal } from '@/features/corporate-form/components/doc-upload-modal';
import { useAgentForm } from './context/agent-context';
import { buildAgentFormConfig } from './agent-form-config';
import { agentGroupsService } from '@/features/agent-groups/api';
import { agentDetailService } from './api';
import { agentFormSchema } from './domain/validation';
import { fetchVknDemo } from './api/mock-agent-detail-adapter';
import { BankAccountsEditor } from './components/bank-accounts-editor';
import { FinancialWalletsTable } from './components/financial-wallets-table';
import { ShareholdersEditor } from './components/shareholders-editor';
import { AuthorizedPersonsEditor } from './components/authorized-persons-editor';
import { AddressesEditor } from './components/addresses-editor';
import { ContactsEditor } from './components/contacts-editor';
import { DocumentsTable } from './components/documents-table';
import { RiskScoreDisplay } from './components/risk-score-display';
import { StatusDisplay } from './components/status-display';

export function AgentForm() {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const navigate = useNavigate();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const api = useAgentForm();
  const {
    isNew,
    isView,
    permissions,
    watch,
    setValue,
    bgChecks,
    bannerOpen,
    setBannerOpen,
    status,
    onCancel,
    onBlock,
    onUnblock,
    onUploadDocument,
    agentId,
  } = api;

  const [docOpen, setDocOpen] = useState(false);
  const [blkOpen, setBlkOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const formConfig = useMemo(
    () => {
      const config = buildAgentFormConfig(translate);
      const groups = agentGroupsService.listActiveLegacy();
      const groupOpts = groups.map((g) => ({ label: g.label, value: g.key }));
      if (config.panels) {
        const temsilciPanel = config.panels.find((p) => p.key === 'temsilci');
        if (temsilciPanel) {
          for (const f of temsilciPanel.fields) {
            if (f.type === 'Row' && f.fields) {
              const groupField = f.fields.find((ff) => ff.name === 'groupKey');
              if (groupField) groupField.options = groupOpts;
            }
          }
        }
      }
      return config;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const formValues = watch();
  const initialValues = useMemo(() => {
    const vals: Record<string, unknown> = { ...formValues };
    vals._isNew = isNew;
    vals.riskDisplay = { score: formValues.riskScore, segment: formValues.riskSegment };
    vals.statusDisplay = formValues.status;
    vals['limits.perTx'] = formValues.limits?.perTx;
    vals['limits.daily'] = formValues.limits?.daily;
    vals['limits.monthly'] = formValues.limits?.monthly;
    return vals;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey, isNew]);

  useEffect(() => {
    setFormKey((k) => k + 1);
  }, [api.loading]);

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      components: {
        BankAccountsEditor,
        FinancialWalletsTable,
        ShareholdersEditor,
        AuthorizedPersonsEditor: (props) => (
          <AuthorizedPersonsEditor {...props} agentId={agentId} />
        ),
        AddressesEditor,
        ContactsEditor,
        DocumentsTable,
        RiskScoreDisplay,
        StatusDisplay,
      },
      onFieldChange: (name, value, allValues) => {
        if (name === 'taxNo' && typeof value === 'string' && value.length === 10) {
          const existing = agentDetailService.lookupByVkn(value);
          if (existing && isNew) {
            toast.info(t('af_existing_loaded'));
            navigate(`/agents/${existing.id}`);
            return;
          }
          const demo = fetchVknDemo(value);
          if (demo) {
            Object.entries(demo).forEach(([k, v]) => {
              setValue(k as never, v as never, { shouldDirty: true });
            });
            setFormKey((k) => k + 1);
            toast.success(t('cf_vkn_loaded'));
          }
        }
      },
    }),
    [agentId, isNew, navigate, t, setValue],
  );

  const persist = async (values: Record<string, unknown>, draft: boolean) => {
    const payload = { ...values } as Record<string, unknown>;
    delete payload._isNew;
    delete payload.riskDisplay;
    delete payload.statusDisplay;
    if (payload['limits.perTx'] !== undefined || payload['limits.daily'] !== undefined || payload['limits.monthly'] !== undefined) {
      payload.limits = {
        ...(payload.limits as Record<string, unknown> ?? {}),
        perTx: payload['limits.perTx'] ?? 0,
        daily: payload['limits.daily'] ?? 0,
        monthly: payload['limits.monthly'] ?? 0,
      };
      delete payload['limits.perTx'];
      delete payload['limits.daily'];
      delete payload['limits.monthly'];
    }

    if (!draft) {
      const parsed = agentFormSchema.safeParse(payload);
      if (!parsed.success) {
        const first = parsed.error.errors[0];
        toast.error(t(first?.message ?? 'if_validation_failed'));
        return;
      }
    }

    if (draft) {
      const result = agentDetailService.create(payload as never, { draft: true });
      if (!result.ok) {
        toast.error(t(result.error ?? 'ib_save_failed'));
        return;
      }
      toast.success(t('if_draft_ok'));
      navigate(`/agents/${result.id}`);
      return;
    }

    const checks = agentDetailService.runBackgroundChecks(agentId, payload as never);
    if (checks.sanction === 'hit') {
      toast.error(t('if_sanction_hit'));
      return;
    }

    const result = isNew
      ? agentDetailService.create(payload as never)
      : agentDetailService.update(agentId!, payload as never);

    if (!result.ok) {
      const err = result.error ?? 'ib_save_failed';
      if (err.startsWith('af_doc_missing:')) {
        toast.error(t('cf_doc_missing', { doc: err.split(':')[1] }));
      } else {
        toast.error(t(err));
      }
      return;
    }

    toast.success(t('af_save_ok'));
    if (isNew && result.id) navigate(`/agents/${result.id}`);
  };

  const liveStatus = isNew ? 'inactive' : status;
  const statusLabel: Record<string, string> = {
    active: t('ib_status_Active'),
    inactive: t('ib_status_Inactive'),
    blocked: t('fcd_blocked'),
    closed: t('rl_closed'),
  };

  const formMode = isView ? FormMode.View : isNew ? FormMode.Create : FormMode.Update;

  return (
    <>
      {!isNew && <BgChecksBanner checks={bgChecks} open={bannerOpen} onDismiss={() => setBannerOpen(false)} />}

      <DynamicForm
        key={formKey}
        config={formConfig}
        mode={formMode}
        permissions={{
          create: permissions.insert,
          update: permissions.update,
          view: permissions.view,
        }}
        initialValues={initialValues}
        customFunctions={customFunctions}
        t={translate}
        header={{
          title: (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {!isNew && (
                <span
                  className="avatar corp-f"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'oklch(0.92 0.05 250)',
                    color: 'oklch(0.42 0.12 250)',
                    flexShrink: 0,
                  }}
                >
                  <Building2 size={18} />
                </span>
              )}
              <span>
                {isNew ? (tr ? 'Yeni Temsilci' : 'New agent') : formValues.name}
                {isView && (
                  <span className="badge muted" style={{ fontSize: 10.5, marginLeft: 8 }}>
                    <Eye size={11} />
                    {tr ? 'Görüntüleme' : 'View only'}
                  </span>
                )}
              </span>
            </div>
          ),
          subtitle: isNew
            ? tr
              ? 'VKN girilince mevcut kayıt veya ticaret sicil bilgileri dolar.'
              : 'Enter VKN to load registry or existing record.'
            : undefined,
          status: (
            <div className="head-status">
              <span className={`st ${liveStatus}`}>{statusLabel[liveStatus] ?? liveStatus}</span>
              {!isNew && (
                <span className="reason">
                  {tr ? 'Temsilci No' : 'Agent No'} · {formValues.agentNo} ·{' '}
                  {tr ? 'Oluşturma' : 'Created'}{' '}
                  {new Date(formValues.createdAt).toLocaleDateString(tr ? 'tr-TR' : 'en-US')}
                </span>
              )}
            </div>
          ),
          showDraft: !isView && permissions.draft && isNew,
          draftLabel: tr ? 'Taslak Kaydet' : 'Save draft',
          saveLabel: tr ? 'Kaydet' : 'Save',
          cancelLabel: tr ? 'Vazgeç' : 'Cancel',
          leading: !isNew ? (
            <Button type="button" variant="ghost" onClick={() => toast.info(tr ? 'Temsilci aktiviteleri yakında' : 'Agent activities soon')}>
              <History size={13} />
              {tr ? 'Temsilci Aktiviteleri' : 'Agent activities'}
            </Button>
          ) : undefined,
          trailing: (
            <>
              {!isNew && status === 'blocked' && permissions.unblock && (
                <Button type="button" variant="ghost" onClick={onUnblock}>
                  {tr ? 'Bloke Kaldır' : 'Unblock'}
                </Button>
              )}
              {!isNew && status === 'active' && permissions.block && (
                <Button type="button" variant="danger" onClick={() => setBlkOpen(true)}>
                  <Ban size={13} />
                  {tr ? 'Bloke Et' : 'Block'}
                </Button>
              )}
              {!isView && (
                <Button type="button" onClick={() => setDocOpen(true)}>
                  <Upload size={13} style={{ transform: 'rotate(180deg)' }} />
                  {tr ? 'Belge Yükle' : 'Upload doc'}
                </Button>
              )}
              {agentId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    navigate(`/documents?relationType=Agent&relatedId=${encodeURIComponent(formValues.agentNo)}`)
                  }
                >
                  <FileText size={13} />
                  {tr ? 'Belge Gör/İndir' : 'View docs'}
                </Button>
              )}
            </>
          ),
        }}
        onSubmit={(values) => persist(values, false)}
        onButtonClick={(key, values) => {
          if (key === 'draft') return persist(values, true);
          return undefined;
        }}
        onCancel={onCancel}
      />

      <DocUploadModal open={docOpen} onClose={() => setDocOpen(false)} onSubmit={onUploadDocument} />
      <BlockModal open={blkOpen} onClose={() => setBlkOpen(false)} onConfirm={onBlock} />
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Ban, Building2, Eye, FileText, History, Upload } from 'lucide-react';
import { Button, DynamicForm, FormMode, type CustomFunctions } from '@epay/ui';
import { BlockModal } from '@/features/individual-form/components/block-modal';
import { useCorporateCustomerForm } from './context/corporate-customer-context';
import { BgChecksBanner } from './components/bg-checks-banner';
import { DocUploadModal } from './components/doc-upload-modal';
import { buildCorporateFormConfig } from './corporate-form-config';
import {
  campaignEndDateForKey,
  customerCampaignsService,
} from '@/features/customer-campaigns/api';
import type { CampaignOption } from '@/features/customer-campaigns/domain/types';
import { CorpBankAccountsEditor } from './components/corp-bank-accounts-editor';
import { CorpWalletsTable } from './components/corp-wallets-table';
import { CorpShareholdersEditor } from './components/corp-shareholders-editor';
import { CorpAuthorizedEditor } from './components/corp-authorized-editor';
import { CorpAddressesEditor } from './components/corp-addresses-editor';
import { CorpContactsEditor } from './components/corp-contacts-editor';
import { CorpDocumentsTable } from './components/corp-documents-table';
import { CorpRiskScoreDisplay } from './components/corp-risk-display';
import { CorpStatusDisplay } from './components/corp-status-display';

export function CorporateCustomerForm() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const tr = i18n.language === 'tr';
  const translate: (key: string, fb?: string) => string = (k, fb) =>
    t(k, { defaultValue: fb ?? k });

  const api = useCorporateCustomerForm();
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
    onVknBlur,
    onCancel,
    onBlock,
    onUnblock,
    onUploadDocument,
    onAuthorizedTcknBlur,
    customerId,
  } = api;

  const [docOpen, setDocOpen] = useState(false);
  const [blkOpen, setBlkOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [campaignOptions, setCampaignOptions] = useState<CampaignOption[]>([]);

  useEffect(() => {
    setCampaignOptions(customerCampaignsService.listActiveOptions());
  }, []);

  const formConfig = useMemo(() => {
    const config = buildCorporateFormConfig(translate);
    if (config.panels) {
      const musteriPanel = config.panels.find((p) => p.key === 'musteri');
      if (musteriPanel) {
        for (const f of musteriPanel.fields) {
          if (f.type === 'Row' && f.fields) {
            const campaignField = f.fields.find((ff) => ff.name === 'campaign');
            if (campaignField) {
              campaignField.options = [
                { label: '\u2014', value: '' },
                ...campaignOptions.map((o) => ({ label: o.name, value: o.name })),
              ];
            }
          }
        }
      }
    }
    return config;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, campaignOptions]);

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
        CorpBankAccountsEditor,
        CorpWalletsTable,
        CorpShareholdersEditor,
        CorpAuthorizedEditor: (props) => (
          <CorpAuthorizedEditor {...props} onTcknBlur={onAuthorizedTcknBlur} />
        ),
        CorpAddressesEditor,
        CorpContactsEditor,
        CorpDocumentsTable,
        RiskScoreDisplay: CorpRiskScoreDisplay,
        StatusDisplay: CorpStatusDisplay,
      },
      onFieldChange: (name, value, allValues) => {
        if (name === 'taxNo' && typeof value === 'string' && value.length === 10) {
          onVknBlur();
        }
        if (name === 'campaign') {
          const end = value ? campaignEndDateForKey(String(value)) : '';
          setValue('campaignEndDate', end);
        }
      },
    }),
    [onVknBlur, onAuthorizedTcknBlur, setValue],
  );

  const persist = async (values: Record<string, unknown>, draft: boolean) => {
    const payload = { ...values } as Record<string, unknown>;
    delete payload._isNew;
    delete payload.riskDisplay;
    delete payload.statusDisplay;
    if (payload['limits.perTx'] !== undefined) {
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
    if (draft) {
      api.onDraft();
    } else {
      api.onSave();
    }
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
        permissions={{ create: permissions.insert, update: permissions.update, view: permissions.view }}
        initialValues={initialValues}
        customFunctions={customFunctions}
        t={translate}
        header={{
          title: (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {!isNew && (
                <span className="avatar corp-f" style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'oklch(0.92 0.05 250)', color: 'oklch(0.42 0.12 250)', flexShrink: 0 }}>
                  <Building2 size={18} />
                </span>
              )}
              <span>
                {isNew ? (tr ? 'Yeni T\u00fczel M\u00fc\u015fteri' : 'New corporate customer') : formValues.tradeName}
                {isView && (
                  <span className="badge muted" style={{ fontSize: 10.5, marginLeft: 8 }}>
                    <Eye size={11} /> {tr ? 'G\u00f6r\u00fcnt\u00fcleme' : 'View only'}
                  </span>
                )}
              </span>
            </div>
          ),
          subtitle: isNew ? (tr ? 'VKN girilince mevcut kay\u0131t veya ticaret sicil bilgileri dolar.' : 'Enter VKN to load registry or existing record.') : undefined,
          status: (
            <div className="head-status">
              <span className={`st ${liveStatus}`}>{statusLabel[liveStatus] ?? liveStatus}</span>
              {!isNew && (
                <span className="reason">
                  {tr ? 'M\u00fc\u015fteri No' : 'Customer No'} \u00b7 {formValues.customerNo} \u00b7{' '}
                  {tr ? 'Olu\u015fturma' : 'Created'} {new Date(formValues.createdAt).toLocaleDateString(tr ? 'tr-TR' : 'en-US')}
                </span>
              )}
            </div>
          ),
          showDraft: !isView && permissions.draft && isNew,
          draftLabel: tr ? 'Taslak Kaydet' : 'Save draft',
          saveLabel: tr ? 'Kaydet' : 'Save',
          cancelLabel: tr ? 'Vazge\u00e7' : 'Cancel',
          leading: !isNew ? (
            <Button type="button" variant="ghost" onClick={() => toast.info(t('cf_activities_soon'))}>
              <History size={13} /> {tr ? 'M\u00fc\u015fteri Aktiviteleri' : 'Activities'}
            </Button>
          ) : undefined,
          trailing: (
            <>
              {!isNew && status === 'blocked' && permissions.unblock && (
                <Button type="button" variant="ghost" onClick={onUnblock}>{tr ? 'Bloke Kald\u0131r' : 'Unblock'}</Button>
              )}
              {!isNew && status === 'active' && permissions.block && (
                <Button type="button" variant="danger" onClick={() => setBlkOpen(true)}>
                  <Ban size={13} /> {tr ? 'Bloke Et' : 'Block'}
                </Button>
              )}
              {!isView && (
                <Button type="button" onClick={() => setDocOpen(true)}>
                  <Upload size={13} style={{ transform: 'rotate(180deg)' }} /> {tr ? 'Belge Y\u00fckle' : 'Upload doc'}
                </Button>
              )}
              {customerId && (
                <Button type="button" variant="ghost" onClick={() => navigate(`/documents?relationType=Customer&relatedId=${encodeURIComponent(formValues.customerNo)}`)}>
                  <FileText size={13} /> {tr ? 'Belge G\u00f6r/\u0130ndir' : 'View docs'}
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

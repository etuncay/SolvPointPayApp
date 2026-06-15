import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DynamicForm, FormMode, type CustomFunctions } from '@epay/ui';
import { useIndividualCustomerForm } from './context/individual-customer-context';
import { DocUploadModal } from './components/doc-upload-modal';
import { BlockModal } from './components/block-modal';
import { BgChecksBanner } from './components/bg-checks-banner';
import { buildIndividualFormConfig } from './individual-form-config';
import {
  campaignEndDateForKey,
  customerCampaignsService,
} from '@/features/customer-campaigns/api';
import { IndvBankAccountsEditor } from './components/indv-bank-accounts-editor';
import { IndvWalletsTable } from './components/indv-wallets-table';
import { IndvAddressesEditor } from './components/indv-addresses-editor';
import { IndvContactsEditor } from './components/indv-contacts-editor';
import { IndvDocumentsTable } from './components/indv-documents-table';
import { IndvRiskDisplay } from './components/indv-risk-display';
import { IndvStatusDisplay } from './components/indv-status-display';
import { CustomerHeaderTitle } from './components/customer-header-title';
import { CustomerHeaderStatus } from './components/customer-header-status';

export function IndividualCustomerForm({ routeMode: _routeMode }: { routeMode?: 'new' | 'edit' | 'view' }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const tr = i18n.language === 'tr';
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const api = useIndividualCustomerForm();
  const {
    isNew,
    isView,
    isForeign,
    isProspect,
    kpsLocked,
    permissions,
    watch,
    setValue,
    bgChecks,
    bannerOpen,
    setBannerOpen,
    status,
    onSave,
    onDraft,
    onCancel,
    onBlock,
    onUnblock,
    onUploadDocument,
    customerId,
  } = api;

  const [docOpen, setDocOpen] = useState(false);
  const [blkOpen, setBlkOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const formConfig = useMemo(
    () => {
      const config = buildIndividualFormConfig(translate);
      const campaigns = customerCampaignsService.listActiveOptions();
      const campaignOpts = campaigns.map((c) => ({ label: c.name, value: c.name }));
      if (config.panels) {
        const musteriPanel = config.panels.find((p) => p.key === 'musteri');
        if (musteriPanel) {
          for (const f of musteriPanel.fields) {
            if (f.type === 'Row' && f.fields) {
              const campaignField = f.fields.find((ff) => ff.name === 'campaign');
              if (campaignField) campaignField.options = campaignOpts;
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
  const liveStatus = isNew ? 'inactive' : isProspect ? 'prospect' : status;
  const initialValues = useMemo(() => {
    const vals: Record<string, unknown> = { ...formValues };
    vals._isNew = isNew;
    vals._isForeign = isForeign;
    vals._isProspect = isProspect;
    vals._kpsLocked = kpsLocked;
    vals._isView = isView;
    vals._canDraft = permissions.draft;
    vals._canBlock = permissions.block;
    vals._canUnblock = permissions.unblock;
    vals._hasCustomerId = !!customerId;
    vals._liveStatus = liveStatus;
    vals.riskDisplay = { score: formValues.riskScore, segment: formValues.riskSegment };
    vals.statusDisplay = isNew ? 'inactive' : isProspect ? 'prospect' : formValues.status;
    vals['limits.perTx'] = formValues.limits?.perTx;
    vals['limits.daily'] = formValues.limits?.daily;
    vals['limits.monthly'] = formValues.limits?.monthly;
    return vals;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey, isNew, isForeign, isProspect, kpsLocked, isView, customerId, liveStatus]);

  useEffect(() => {
    setFormKey((k) => k + 1);
  }, [api.loading]);

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      components: {
        IndvBankAccountsEditor,
        IndvWalletsTable,
        IndvAddressesEditor,
        IndvContactsEditor,
        IndvDocumentsTable: (props) => (
          <IndvDocumentsTable {...props} onUpload={() => setDocOpen(true)} />
        ),
        IndvRiskDisplay,
        IndvStatusDisplay,
        CustomerHeaderTitle,
        CustomerHeaderStatus,
      },
      onFieldChange: (name, value, allValues) => {
        if (name === 'campaign') {
          const end = value ? campaignEndDateForKey(String(value)) : '';
          setValue('campaignEndDate', end);
          setFormKey((k) => k + 1);
        }
        if (name === 'idNo' && typeof value === 'string' && value.length === 11) {
          const idType = allValues?.idType ?? formValues.idType;
          const idCountry = allValues?.idCountry ?? formValues.idCountry;
          if (idType === 'TCKN' && idCountry === 'TUR') {
            api.onKpsBlur();
            setFormKey((k) => k + 1);
          }
        }
      },
    }),
    [api, formValues.idType, formValues.idCountry, setValue],
  );

  const persist = async (values: Record<string, unknown>, draft: boolean) => {
    const payload = { ...values } as Record<string, unknown>;
    delete payload._isNew;
    delete payload._isForeign;
    delete payload._isProspect;
    delete payload._kpsLocked;
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

    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined) setValue(k as never, v as never, { shouldDirty: true });
    });

    if (draft) {
      onDraft();
    } else {
      onSave();
    }
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
        onSubmit={(values) => persist(values, false)}
        onButtonClick={(key, values) => {
          if (key === 'draft') return persist(values, true);
          if (key === 'block') {
            setBlkOpen(true);
            return undefined;
          }
          if (key === 'unblock') return onUnblock();
          if (key === 'upload') {
            setDocOpen(true);
            return undefined;
          }
          if (key === 'viewdocs') {
            navigate(`/documents?relationType=Customer&relatedId=${encodeURIComponent(formValues.customerNo)}`);
            return undefined;
          }
          if (key === 'activities') {
            toast.info(t('if_activities_soon'));
            return undefined;
          }
          return undefined;
        }}
        onCancel={onCancel}
      />

      <DocUploadModal open={docOpen} onClose={() => setDocOpen(false)} onSubmit={onUploadDocument} />
      <BlockModal open={blkOpen} onClose={() => setBlkOpen(false)} onConfirm={onBlock} />
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Ban,
  Eye,
  FileText,
  History,
  Upload,
} from 'lucide-react';
import { Button, DynamicForm, FormMode, type CustomFunctions } from '@epay/ui';
import { useAuthorizedPersonForm } from './context/authorized-person-context';
import { DocUploadModal } from '@/features/individual-form/components/doc-upload-modal';
import { BlockModal } from '@/features/individual-form/components/block-modal';
import { BgChecksBanner } from '@/features/individual-form/components/bg-checks-banner';
import { buildAPFormConfig } from './agent-person-form-config';
import { APAddressesEditor } from './components/ap-addresses-editor';
import { APContactsEditor } from './components/ap-contacts-editor';
import { APDocumentsTable } from './components/ap-documents-table';
import { APAccessDisplay } from './components/ap-access-display';

export function AuthorizedPersonForm() {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const api = useAuthorizedPersonForm();
  const {
    isNew,
    isView,
    isForeign,
    kpsLocked,
    permissions,
    watch,
    setValue,
    bgChecks,
    bannerOpen,
    setBannerOpen,
    gender,
    maritalStatus,
    status,
    onSave,
    onDraft,
    onCancel,
    onBlock,
    onUnblock,
    onUploadDocument,
    onKpsBlur,
    personId,
  } = api;

  const [docOpen, setDocOpen] = useState(false);
  const [blkOpen, setBlkOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const formConfig = useMemo(
    () => buildAPFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const formValues = watch();
  const initialValues = useMemo(() => {
    const vals: Record<string, unknown> = { ...formValues };
    vals._isNew = isNew;
    vals._isForeign = isForeign;
    vals._kpsLocked = kpsLocked;
    vals.statusDisplay = status;
    vals.riskScore = formValues.riskScore != null ? `${formValues.riskScore} / 100` : '';
    vals.accessInfo = {
      lastLogin: formValues.lastLogin,
      failedAttempts: formValues.failedAttempts,
      device: formValues.device,
      ipLocation: formValues.ipLocation,
    };
    return vals;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey, isNew, isForeign, kpsLocked]);

  useEffect(() => {
    setFormKey((k) => k + 1);
  }, [api.loading]);

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      components: {
        APAddressesEditor,
        APContactsEditor,
        APDocumentsTable,
        APAccessDisplay,
      },
      onFieldChange: (name, value) => {
        if (name === 'idNo' && typeof value === 'string' && value.length === 11) {
          onKpsBlur();
        }
      },
    }),
    [onKpsBlur],
  );

  const persist = async (values: Record<string, unknown>, draft: boolean) => {
    const payload = { ...values } as Record<string, unknown>;
    delete payload._isNew;
    delete payload._isForeign;
    delete payload._kpsLocked;
    delete payload.statusDisplay;
    delete payload.accessInfo;

    if (draft) {
      onDraft();
    } else {
      onSave();
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

  const p = formValues;
  const pageTitle = isNew
    ? tr ? 'Yeni Yetkili Kişi' : 'New authorized person'
    : p.fullName || `${p.firstName} ${p.lastName}`.trim();

  return (
    <>
      {!isNew && (
        <BgChecksBanner checks={bgChecks} open={bannerOpen} onDismiss={() => setBannerOpen(false)} />
      )}

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
                  className="avatar indv-f"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 14,
                    fontWeight: 600,
                    background:
                      gender === 'female' ? 'oklch(0.92 0.05 320)' : 'oklch(0.92 0.05 195)',
                    color: gender === 'female' ? 'oklch(0.42 0.13 320)' : 'oklch(0.42 0.10 195)',
                    flexShrink: 0,
                  }}
                >
                  {(p.firstName?.[0] ?? '') + (p.lastName?.[0] ?? '')}
                </span>
              )}
              <span>
                {pageTitle}
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
              ? 'Kimlik bilgileri girilince Nüfus Paneli KPS\u2019ten doldurulur.'
              : 'Civil registry auto-fills from KPS once identity is entered.'
            : tr
              ? `Kişi No · ${p.personNo ?? ''}`
              : `Person No · ${p.personNo ?? ''}`,
          status: (
            <div className="head-status">
              <span className={`st ${liveStatus}`}>{statusLabel[liveStatus] ?? liveStatus}</span>
            </div>
          ),
          showDraft: !isView && permissions.draft && isNew,
          draftLabel: tr ? 'Taslak Kaydet' : 'Save draft',
          saveLabel: tr ? 'Kaydet' : 'Save',
          cancelLabel: tr ? 'Vazgeç' : 'Cancel',
          leading: !isNew ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => toast.info(tr ? 'Aktivite logu yakında' : 'Activity log coming soon')}
            >
              <History size={13} />
              {tr ? 'Kişi Aktiviteleri' : 'Person activities'}
            </Button>
          ) : undefined,
          trailing: (
            <>
              {!isNew && permissions.block && status !== 'blocked' && (
                <Button type="button" variant="danger" onClick={() => setBlkOpen(true)}>
                  <Ban size={13} />
                  {tr ? 'Bloke Et' : 'Block'}
                </Button>
              )}
              {!isNew && permissions.unblock && status === 'blocked' && (
                <Button type="button" variant="ghost" onClick={onUnblock}>
                  {tr ? 'Bloke Kaldır' : 'Unblock'}
                </Button>
              )}
              {!isView && (
                <Button type="button" onClick={() => setDocOpen(true)}>
                  <Upload size={13} style={{ transform: 'rotate(180deg)' }} />
                  {tr ? 'Belge Yükle' : 'Upload doc'}
                </Button>
              )}
              {personId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => toast.info(tr ? 'DMS yakında' : 'DMS coming soon')}
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

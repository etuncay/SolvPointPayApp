import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Info, Lock, Search, UserPlus } from 'lucide-react';
import { DynamicForm, FormMode, type CustomFunctions } from '@epay/ui';
import {
  ensureAgentRegistrationsSeeded,
  getAgentRegistrationById,
  hasAgentPendingTransfer,
  lookupAgentCustomerByIdentity,
  registrationToFormValues,
  saveAgentRegistration,
} from '@epay/data';
import { AGENT_PATHS } from '@/config/agent-nav-paths';
import { DocumentUploads } from './components/document-uploads';
import { AddressRepeater } from './components/address-repeater';
import { ContactRepeater } from './components/contact-repeater';
import { DocumentList } from './components/document-list';
import { buildRegistrationFormConfig } from './registration-form-config';

type RegistrationDocsMap = Record<string, string | undefined>;

type AcquisitionContext = 'send' | 'withdraw' | 'deposit' | null;

function asDocs(value: unknown): RegistrationDocsMap {
  return value && typeof value === 'object' ? (value as RegistrationDocsMap) : {};
}

/** Mock OCR — TR müşteride kimlik yüklendikten sonra nüfus alanlarını doldurur. */
function mockOcrFields(idNo: string): Record<string, unknown> {
  if (idNo.includes('0000')) return {};
  return {
    _ocrLocked: true,
    birthPlace: 'Ankara',
    maritalStatus: 'single',
    serialNo: 'A12B345678',
    issueDate: '2020-01-15',
    issuingAuthority: 'Ankara İl Nüfus Müdürlüğü',
    validityDate: '2030-01-14',
    motherName: 'Fatma Yılmaz',
    fatherName: 'Mehmet Yılmaz',
    gender: 'male',
    maidenName: '',
    taxCountry: 'TUR',
    educationLevel: 'university',
    employmentStatus: 'employed',
    occupation: 'Mühendis',
    employer: 'Demo A.Ş.',
  };
}

/** Yeni Bireysel Müşteri Kaydı — playground kalıbı: DynamicForm + JSON config + @epay/data. */
export function CustomerRegistrationPage({ mode = 'new' }: { mode?: 'new' | 'edit' }) {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const returnTo = searchParams.get('returnTo');
  const context = (searchParams.get('context') as AcquisitionContext) ?? null;
  const knownByQuery = searchParams.get('knownCustomer') === 'true';

  const [lookupNo, setLookupNo] = useState('');
  const [initialValues, setInitialValues] = useState<Record<string, unknown> | undefined>();
  const [pendingLock, setPendingLock] = useState(false);
  const [knownCustomer, setKnownCustomer] = useState(knownByQuery);
  const [formKey, setFormKey] = useState(0);

  const formConfig = useMemo(
    () => buildRegistrationFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const seededValues = useMemo(() => {
    const base = initialValues ? { ...initialValues } : {};
    base._knownCustomer = knownCustomer;
    base._pendingLock = pendingLock;
    base._context = context;
    base._ocrLocked = base._ocrLocked ?? false;
    base.documents = base.documents ?? {};
    base.addresses =
      base.addresses ??
      ([{ id: 'addr-1', type: 'home', country: 'TUR', city: '', district: '', street: '' }] as unknown[]);
    base.contacts =
      base.contacts ??
      ([{ id: 'contact-1', type: 'email', value: '', primary: true }] as unknown[]);
    return base;
  }, [initialValues, knownCustomer, pendingLock, context]);

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      components: { DocumentUploads, AddressRepeater, ContactRepeater, DocumentList },
      onFieldChange: (name, value, allValues) => {
        if (name === 'documents') {
          const nextDocs = asDocs(value);
          if (
            nextDocs.identityFront &&
            nextDocs.identityBack &&
            allValues.nationality === 'TUR' &&
            !allValues._ocrLocked
          ) {
            const ocr = mockOcrFields(String(allValues.idNo ?? ''));
            if (Object.keys(ocr).length > 0) {
              setInitialValues((prev) => ({ ...(prev ?? {}), ...allValues, documents: nextDocs, ...ocr }));
              setFormKey((k) => k + 1);
              toast.success(t('ag_cust_ocr_ok'));
            } else {
              toast.error(t('ag_cust_ocr_poor_quality'));
            }
          }
        }
      },
    }),
    [t],
  );

  useEffect(() => {
    void ensureAgentRegistrationsSeeded();
  }, []);

  useEffect(() => {
    if (mode !== 'edit' || !customerId) return;
    let cancelled = false;
    void getAgentRegistrationById(customerId).then(async (row) => {
      if (cancelled || !row) {
        if (!cancelled && !row) toast.error(t('ag_cust_lookup_none'));
        return;
      }
      await applyExisting(row.idNo, { ...registrationToFormValues(row), id: row.id }, asDocs(row.documents));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, customerId]);

  const applyExisting = async (
    idNo: string,
    values: Record<string, unknown>,
    nextDocs: RegistrationDocsMap,
  ) => {
    const pending = await hasAgentPendingTransfer(idNo);
    const ocrLocked = values.nationality === 'TUR' && !!(nextDocs.identityFront && nextDocs.identityBack);
    setInitialValues({ ...values, documents: nextDocs, _ocrLocked: ocrLocked });
    setKnownCustomer(true);
    setPendingLock(pending);
    setFormKey((k) => k + 1);
    if (pending) toast.warning(t('ag_cust_pending_tx_block'));
  };

  const handleLookup = async () => {
    const idNo = lookupNo.trim();
    if (!idNo) return;
    const found = await lookupAgentCustomerByIdentity(idNo);
    if (found) {
      await applyExisting(found.idNo, { ...registrationToFormValues(found), id: found.id }, asDocs(found.documents));
      toast.success(t('ag_cust_lookup_found', { name: `${found.firstName} ${found.lastName}` }));
    } else {
      toast.info(t('ag_cust_lookup_none'));
    }
  };

  const persist = async (values: Record<string, unknown>, draft: boolean) => {
    const { _knownCustomer, _pendingLock, _context, _ocrLocked, ...payload } = values;
    try {
      const res = await saveAgentRegistration(payload, { draft });
      if (!res.ok) {
        toast.error(res.error ? t(res.error, { defaultValue: res.error }) : t('ag_cust_save_error'));
        return;
      }
      toast.success(
        draft
          ? t('ag_cust_draft_saved', { no: res.customerNo ?? '' })
          : t('ag_cust_saved', { no: res.customerNo ?? '' }),
      );
      navigate(returnTo ?? AGENT_PATHS.customers);
    } catch (err) {
      console.error(err);
      toast.error(t('ag_cust_save_error'));
    }
  };

  const banner = (pendingLock || knownCustomer || context) && (
    <div className={`fcard ag-cust-banner ${pendingLock ? 'is-lock' : ''}`} style={{ marginBottom: 12 }}>
      <div className="fcard-body" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {pendingLock ? <Lock size={15} /> : <Info size={15} />}
        <span className="fs-12">
          {pendingLock
            ? t('ag_cust_pending_tx_block')
            : knownCustomer
              ? t('ag_cust_known_customer_hint')
              : t('ag_cust_context_hint', { context: context ?? '' })}
        </span>
      </div>
    </div>
  );

  const lookupActions = (
    <div className="flex items-center gap-6">
      <input
        className="input"
        style={{ width: 200 }}
        placeholder={t('ag_cust_lookup_ph')}
        value={lookupNo}
        onChange={(e) => setLookupNo(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void handleLookup();
        }}
      />
      <button type="button" className="btn btn-ghost" onClick={() => void handleLookup()}>
        <Search size={14} /> {t('ag_cust_lookup_btn')}
      </button>
    </div>
  );

  return (
    <>
      {banner}
      <DynamicForm
        key={formKey}
        config={formConfig}
        mode={FormMode.Create}
        permissions={{ create: true }}
        initialValues={seededValues}
        customFunctions={customFunctions}
        t={translate}
        header={{
          title: (
            <>
              <UserPlus size={16} style={{ marginRight: 6 }} />
              {t('ag_nav_cust_new')}
            </>
          ),
          subtitle: t('ag_cust_form_subtitle'),
          railTitle: t('ag_cust_rail_title'),
          showDraft: true,
          draftLabel: t('ag_cust_btn_draft'),
          leading: lookupActions,
        }}
        onSubmit={(values) => persist(values, false)}
        onButtonClick={(key, values) => {
          if (key === 'draft') return persist(values, true);
          return undefined;
        }}
        onCancel={() => navigate(returnTo ?? AGENT_PATHS.customers)}
      />
    </>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useRole } from '@/domain/role-context';
import { corporateCustomersService } from '../api';
import { createCorporateApprovalRequest } from '../api/corporate-approval-bridge';
import {
  createEmptyFormValues,
  createAuthorizedRow,
  createShareholderRow,
  detailToFormValues,
  fetchVknDemo,
  lookupAuthorizedPerson,
} from '../api/mock-corporate-adapter';
import { getCorporateCustomerPermissions } from '../domain/permissions';
import { corporateFormSchema, hasShareholder25Coverage } from '../domain/validation';
import type {
  BackgroundCheckStatus,
  CorporateFormMode,
  CorporateFormValues,
  DocumentUploadInput,
} from '../domain/types';

function allocId(seed: number) {
  return Date.now() + seed;
}

export function useCorporateCustomer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId?: string }>();
  const [searchParams] = useSearchParams();
  const { role } = useRole();

  const mode: CorporateFormMode = useMemo(() => {
    const param = searchParams.get('mode');
    if (param === 'view' || param === 'edit') return param;
    return customerId ? 'edit' : 'new';
  }, [searchParams, customerId]);

  const permissions = useMemo(() => getCorporateCustomerPermissions(role), [role]);
  const isNew = mode === 'new';
  const isView = mode === 'view';

  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [bgChecks, setBgChecks] = useState<BackgroundCheckStatus | null>(null);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [customerIdState, setCustomerIdState] = useState<string | null>(customerId ?? null);
  const [originalValues, setOriginalValues] = useState<CorporateFormValues | null>(null);

  const form = useForm<CorporateFormValues>({
    defaultValues: createEmptyFormValues(),
    mode: 'onBlur',
  });

  const { register, control, watch, setValue, reset, formState } = form;
  const status = watch('status');
  const banks = watch('banks');
  const documents = watch('documents');
  const organizationType = watch('organizationType');

  const banksArray = useFieldArray({ control, name: 'banks' });
  const addressesArray = useFieldArray({ control, name: 'addresses' });
  const contactsArray = useFieldArray({ control, name: 'contacts' });
  const shareholdersArray = useFieldArray({ control, name: 'shareholders' });
  const authorizedArray = useFieldArray({ control, name: 'authorizedPersons' });

  useEffect(() => {
    if (isNew) {
      reset(createEmptyFormValues());
      setLoading(false);
      return;
    }
    if (!customerId) return;
    const detail = corporateCustomersService.getById(customerId);
    if (!detail) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    reset(detailToFormValues(detail));
    setOriginalValues(detailToFormValues(detail));
    setCustomerIdState(customerId);
    setBgChecks(corporateCustomersService.runBackgroundChecks(customerId, detailToFormValues(detail)));
    setLoading(false);
  }, [customerId, isNew, reset]);

  const onVknBlur = useCallback(() => {
    const taxNo = watch('taxNo');
    if (!taxNo) return;

    const existing = corporateCustomersService.lookupByTaxNo(taxNo);
    if (existing && isNew) {
      toast.info(t('cf_existing_loaded'));
      navigate(`/customers/${existing.id}/corporate`);
      return;
    }

    const demo = fetchVknDemo(taxNo);
    if (demo) {
      Object.entries(demo).forEach(([k, v]) => {
        setValue(k as keyof CorporateFormValues, v as never, { shouldDirty: true });
      });
      toast.success(t('cf_vkn_loaded'));
    }
  }, [watch, setValue, isNew, navigate, t]);

  const persist = useCallback(
    async (values: CorporateFormValues, draft: boolean) => {
      const normalized: CorporateFormValues = {
        ...values,
        authorizedPersons: values.authorizedPersons.map((ap) =>
          ap.hasOperationAuth
            ? ap
            : { ...ap, singleTxLimit: 0, dailyLimit: 0, monthlyLimit: 0 },
        ),
      };

      if (!draft) {
        const parsed = corporateFormSchema.safeParse(normalized);
        if (!parsed.success) {
          const first = parsed.error.errors[0];
          toast.error(t(first?.message ?? 'if_validation_failed'));
          return;
        }
      }

      if (draft) {
        const result = corporateCustomersService.create(normalized, { draft: true });
        if (!result.ok) {
          toast.error(t(result.error ?? 'ib_save_failed'));
          return;
        }
        toast.success(t('if_draft_ok'));
        navigate(`/customers/${result.id}/corporate`);
        return;
      }

      const checks = corporateCustomersService.runBackgroundChecks(customerIdState, normalized);
      setBgChecks(checks);
      if (checks.sanction === 'hit') {
        toast.error(t('if_sanction_hit'));
        return;
      }

      if (!hasShareholder25Coverage(normalized.shareholders)) {
        toast.warning(t('cf_ubo25_warning'));
      }

      const result = createCorporateApprovalRequest(
        {
          mode: isNew ? 'new' : 'edit',
          customerId: customerIdState,
          values: normalized,
          oldValues: isNew ? null : originalValues,
        },
        role,
      );
      if (!result.ok) {
        toast.error(t(result.error ?? 'ib_save_failed'));
        return;
      }

      toast.success(t('if_sent_to_approval'));
      navigate('/approvals');
    },
    [customerIdState, isNew, navigate, originalValues, role, t],
  );

  const onSave = () => {
    void persist(form.getValues(), false);
  };

  const onDraft = () => {
    void persist(form.getValues(), true);
  };

  const onCancel = useCallback(() => {
    if (formState.isDirty) {
      if (!window.confirm(t('if_unsaved_confirm'))) return;
    }
    navigate('/customers');
  }, [formState.isDirty, navigate, t]);

  const onBlock = useCallback(
    (reason: string, blockEndDate?: string) => {
      if (!customerIdState) return;
      const result = corporateCustomersService.block(customerIdState, reason, blockEndDate);
      if (result.ok) {
        setValue('status', 'blocked');
        setValue('statusReason', reason);
        toast.success(t('if_block_ok'));
      }
    },
    [customerIdState, setValue, t],
  );

  const onUnblock = useCallback(() => {
    if (!customerIdState) return;
    const result = corporateCustomersService.unblock(customerIdState);
    if (result.ok) {
      setValue('status', 'active');
      setValue('statusReason', null);
      toast.success(t('if_unblock_ok'));
    }
  }, [customerIdState, setValue, t]);

  const onUploadDocument = useCallback(
    (doc: DocumentUploadInput) => {
      const row = corporateCustomersService.uploadDocument(customerIdState, doc);
      setValue('documents', [...documents, row]);
      toast.success(t('if_doc_added'));
    },
    [customerIdState, documents, setValue, t],
  );

  const setDefaultBank = useCallback(
    (index: number) => {
      const currency = banks[index]?.currency;
      if (!currency) return;
      const updated = banks.map((b, i) => ({
        ...b,
        isDefault: b.currency === currency ? i === index : b.isDefault,
      }));
      setValue('banks', updated, { shouldDirty: true });
      toast.info(t('if_default_bank_changed'));
    },
    [banks, setValue, t],
  );

  const verifyContact = useCallback(
    (index: number) => {
      const contacts = watch('contacts');
      const updated = contacts.map((c, i) => (i === index ? { ...c, verified: true } : c));
      setValue('contacts', updated, { shouldDirty: true });
      toast.success(t('if_contact_verified'));
    },
    [watch, setValue, t],
  );

  const setPrimaryContact = useCallback(
    (index: number) => {
      const contacts = watch('contacts');
      const type = contacts[index]?.type;
      const updated = contacts.map((c, i) => ({
        ...c,
        primary: c.type === type ? i === index : c.primary,
      }));
      setValue('contacts', updated, { shouldDirty: true });
    },
    [watch, setValue],
  );

  const addBank = useCallback(() => {
    banksArray.append({
      id: allocId(banks.length),
      bank: '',
      iban: '',
      currency: 'TRY',
      branch: '',
      accountNo: '',
      suffix: '',
      isDefault: banks.length === 0,
      status: 'active',
    });
  }, [banksArray, banks.length]);

  const addAddress = useCallback(() => {
    addressesArray.append({
      id: allocId(addressesArray.fields.length),
      type: 'registered',
      country: 'TUR',
      city: 'İstanbul',
      district: 'Kadıköy',
      neighbourhood: '',
      postcode: '',
      street: '',
      building: '',
      apt: '',
      uavt: '',
      isContact: addressesArray.fields.length === 0,
      status: 'active',
    });
  }, [addressesArray]);

  const addContact = useCallback(
    (type: 'email' | 'phone') => {
      contactsArray.append({
        id: allocId(watch('contacts').length),
        type,
        value: '',
        verified: false,
        primary: !watch('contacts').some((c) => c.type === type && c.primary),
        kind: type === 'phone' ? 'mobile' : undefined,
      });
    },
    [contactsArray, watch],
  );

  const addShareholder = useCallback(() => {
    shareholdersArray.append(createShareholderRow(shareholdersArray.fields.length));
  }, [shareholdersArray]);

  const addAuthorized = useCallback(() => {
    authorizedArray.append(createAuthorizedRow(authorizedArray.fields.length));
  }, [authorizedArray]);

  const onAuthorizedTcknBlur = useCallback(
    (index: number) => {
      const personId = watch(`authorizedPersons.${index}.personId`);
      const hit = lookupAuthorizedPerson(personId ?? '');
      if (!hit) return;
      setValue(`authorizedPersons.${index}.name`, hit.name, { shouldDirty: true });
      setValue(`authorizedPersons.${index}.kycLevel`, hit.kycLevel, { shouldDirty: true });
    },
    [watch, setValue],
  );

  return {
    mode,
    isNew,
    isView,
    loading,
    notFound,
    permissions,
    form,
    register,
    control,
    watch,
    setValue,
    formState,
    bgChecks,
    bannerOpen,
    setBannerOpen,
    banksArray,
    addressesArray,
    contactsArray,
    shareholdersArray,
    authorizedArray,
    status,
    organizationType,
    onVknBlur,
    onSave,
    onDraft,
    onCancel,
    onBlock,
    onUnblock,
    onUploadDocument,
    setDefaultBank,
    verifyContact,
    setPrimaryContact,
    addBank,
    addAddress,
    addContact,
    addShareholder,
    addAuthorized,
    onAuthorizedTcknBlur,
    customerId: customerIdState,
  };
}

export type CorporateCustomerApi = ReturnType<typeof useCorporateCustomer>;

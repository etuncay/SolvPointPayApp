import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useRole } from '@/domain/role-context';
import { individualCustomersService } from '../api';
import {
  createEmptyFormValues,
  detailToFormValues,
} from '../api/mock-individual-adapter';
import { createIndividualApprovalRequest } from '../api/individual-approval-bridge';
import { getIndividualCustomerPermissions } from '../domain/permissions';
import { individualFormSchema, validateDocumentsForSave } from '../domain/validation';
import type {
  BackgroundCheckStatus,
  IndividualFormMode,
  IndividualFormValues,
} from '../domain/types';
import type { DocumentUploadInput } from '../domain/types';

function allocId(seed: number) {
  return Date.now() + seed;
}

export function useIndividualCustomer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId?: string }>();
  const [searchParams] = useSearchParams();
  const { role } = useRole();

  const mode: IndividualFormMode = useMemo(() => {
    const param = searchParams.get('mode');
    if (param === 'view' || param === 'edit') return param;
    return customerId ? 'edit' : 'new';
  }, [searchParams, customerId]);

  const permissions = useMemo(() => getIndividualCustomerPermissions(role), [role]);
  const isNew = mode === 'new';
  const isView = mode === 'view';

  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [kpsLocked, setKpsLocked] = useState(false);
  const [bgChecks, setBgChecks] = useState<BackgroundCheckStatus | null>(null);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [customerIdState, setCustomerIdState] = useState<string | null>(customerId ?? null);
  const [originalValues, setOriginalValues] = useState<IndividualFormValues | null>(null);

  const form = useForm<IndividualFormValues>({
    defaultValues: createEmptyFormValues(),
    mode: 'onBlur',
  });

  const { register, control, watch, setValue, reset, formState } = form;
  const idCountry = watch('idCountry');
  const gender = watch('gender');
  const maritalStatus = watch('maritalStatus');
  const customerType = watch('customerType');
  const status = watch('status');
  const banks = watch('banks');
  const documents = watch('documents');

  const isForeign = idCountry !== 'TUR';
  const isProspect = customerType === 'prospective';
  const isTR = !isForeign && idCountry === 'TUR';

  const banksArray = useFieldArray({ control, name: 'banks' });
  const addressesArray = useFieldArray({ control, name: 'addresses' });
  const contactsArray = useFieldArray({ control, name: 'contacts' });

  useEffect(() => {
    if (isNew) {
      reset(createEmptyFormValues());
      setLoading(false);
      return;
    }
    if (!customerId) return;
    const detail = individualCustomersService.getById(customerId);
    if (!detail) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    reset(detailToFormValues(detail));
    setOriginalValues(detailToFormValues(detail));
    setKpsLocked(detail.idCountry === 'TUR');
    setCustomerIdState(customerId);
    setBgChecks(individualCustomersService.runBackgroundChecks(customerId, detailToFormValues(detail)));
    setLoading(false);
  }, [customerId, isNew, reset]);

  const onKpsBlur = useCallback(() => {
    const idNo = watch('idNo');
    const birthDate = watch('birthDate');
    if (!idNo || !birthDate) return;

    const existing = individualCustomersService.lookupByIdentity(idNo, birthDate);
    if (existing && isNew) {
      toast.info(t('if_existing_loaded'));
      navigate(`/customers/${existing.id}/individual`);
      return;
    }

    if (watch('idCountry') === 'TUR' && watch('idType') === 'TCKN') {
      const kps = individualCustomersService.fetchKps(idNo, birthDate);
      if (kps) {
        setValue('fullName', `${kps.firstName} ${kps.lastName}`);
        setValue('birthPlace', kps.birthPlace);
        setValue('maritalStatus', kps.maritalStatus as IndividualFormValues['maritalStatus']);
        setValue('serialNo', kps.serialNo);
        setValue('issueDate', kps.issueDate);
        setValue('issuingAuthority', kps.issuingAuthority);
        setValue('validityDate', kps.validityDate);
        setValue('motherName', kps.motherName);
        setValue('fatherName', kps.fatherName);
        setValue('gender', kps.gender as IndividualFormValues['gender']);
        setKpsLocked(true);
        toast.success(t('if_kps_loaded'));
      }
    }
  }, [watch, setValue, isNew, navigate, t]);

  const persist = useCallback(
    async (values: IndividualFormValues, draft: boolean) => {
      if (!draft) {
        const parsed = individualFormSchema.safeParse(values);
        if (!parsed.success) {
          const first = parsed.error.errors[0];
          toast.error(t(first?.message ?? 'if_validation_failed'));
          return;
        }
      }

      if (draft) {
        const result = individualCustomersService.create(values, { draft: true });
        if (!result.ok) {
          toast.error(t(result.error ?? 'ib_save_failed'));
          return;
        }
        toast.success(t('if_draft_ok'));
        navigate(`/customers/${result.id}/individual`);
        return;
      }

      const docErr = validateDocumentsForSave(values.documents);
      if (docErr) {
        toast.error(t(docErr));
        return;
      }

      const checks = individualCustomersService.runBackgroundChecks(customerIdState, values);
      setBgChecks(checks);
      if (checks.sanction === 'hit') {
        toast.error(t('if_sanction_hit'));
        return;
      }

      // 8.1 Onay Havuzu — kayıt doğrudan yazılmaz, maker-checker onayına gönderilir.
      const result = createIndividualApprovalRequest(
        {
          mode: isNew ? 'new' : 'edit',
          customerId: customerIdState,
          values,
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
      const result = individualCustomersService.block(customerIdState, reason, blockEndDate);
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
    const result = individualCustomersService.unblock(customerIdState);
    if (result.ok) {
      setValue('status', 'active');
      setValue('statusReason', null);
      toast.success(t('if_unblock_ok'));
    }
  }, [customerIdState, setValue, t]);

  const onUploadDocument = useCallback(
    (doc: DocumentUploadInput) => {
      const row = individualCustomersService.uploadDocument(customerIdState, doc);
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
      type: 'home',
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

  return {
    mode,
    isNew,
    isView,
    isForeign,
    isProspect,
    isTR,
    kpsLocked,
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
    gender,
    maritalStatus,
    status,
    onKpsBlur,
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
    customerId: customerIdState,
  };
}

export type IndividualCustomerApi = ReturnType<typeof useIndividualCustomer>;

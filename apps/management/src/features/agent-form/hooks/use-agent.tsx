import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useRole } from '@/domain/role-context';
import { agentDetailService } from '../api';
import { createAgentApprovalRequest } from '../api/agent-approval-bridge';
import {
  createEmptyFormValues,
  createAuthorizedRow,
  createShareholderRow,
  detailToFormValues,
  fetchVknDemo,
} from '../api/mock-agent-detail-adapter';
import { getAgentFormPermissions } from '../domain/permissions';
import { agentFormSchema } from '../domain/validation';
import type {
  AgentFormMode,
  AgentFormValues,
  BackgroundCheckStatus,
  DocumentUploadInput,
} from '../domain/types';

function allocId(seed: number) {
  return Date.now() + seed;
}

export function useAgent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { agentId } = useParams<{ agentId?: string }>();
  const [searchParams] = useSearchParams();
  const { role } = useRole();

  const mode: AgentFormMode = useMemo(() => {
    const param = searchParams.get('mode');
    if (param === 'view' || param === 'edit') return param;
    return agentId ? 'edit' : 'new';
  }, [searchParams, agentId]);

  const permissions = useMemo(() => getAgentFormPermissions(role), [role]);
  const isNew = mode === 'new';
  const isView =
    mode === 'view' || (isNew ? !permissions.insert : !permissions.update);

  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [bgChecks, setBgChecks] = useState<BackgroundCheckStatus | null>(null);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [agentIdState, setAgentIdState] = useState<string | null>(agentId ?? null);
  const [originalValues, setOriginalValues] = useState<AgentFormValues | null>(null);

  const form = useForm<AgentFormValues>({
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
    if (!agentId) return;
    const detail = agentDetailService.getById(agentId);
    if (!detail) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    reset(detailToFormValues(detail));
    setOriginalValues(detailToFormValues(detail));
    setAgentIdState(agentId);
    setBgChecks(agentDetailService.runBackgroundChecks(agentId, detailToFormValues(detail)));
    setLoading(false);
  }, [agentId, isNew, reset]);

  const onVknBlur = useCallback(() => {
    const taxNo = watch('taxNo');
    if (!taxNo) return;

    const existing = agentDetailService.lookupByVkn(taxNo);
    if (existing && isNew) {
      toast.info(t('af_existing_loaded'));
      navigate(`/agents/${existing.id}`);
      return;
    }

    const demo = fetchVknDemo(taxNo);
    if (demo) {
      Object.entries(demo).forEach(([k, v]) => {
        setValue(k as keyof AgentFormValues, v as never, { shouldDirty: true });
      });
      toast.success(t('cf_vkn_loaded'));
    }
  }, [watch, setValue, isNew, navigate, t]);

  const persist = useCallback(
    async (values: AgentFormValues, draft: boolean) => {
      if (!draft) {
        const parsed = agentFormSchema.safeParse(values);
        if (!parsed.success) {
          const first = parsed.error.errors[0];
          toast.error(t(first?.message ?? 'if_validation_failed'));
          return;
        }
      }

      if (draft) {
        const result = agentDetailService.create(values, { draft: true });
        if (!result.ok) {
          toast.error(t(result.error ?? 'ib_save_failed'));
          return;
        }
        toast.success(t('if_draft_ok'));
        navigate(`/agents/${result.id}`);
        return;
      }

      const checks = agentDetailService.runBackgroundChecks(agentIdState, values);
      setBgChecks(checks);
      if (checks.sanction === 'hit') {
        toast.error(t('if_sanction_hit'));
        return;
      }

      const result = createAgentApprovalRequest(
        {
          mode: isNew ? 'new' : 'edit',
          agentId: agentIdState,
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
    [agentIdState, isNew, navigate, originalValues, role, t],
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
    navigate('/agents');
  }, [formState.isDirty, navigate, t]);

  const onBlock = useCallback(
    (reason: string, blockEndDate?: string) => {
      if (!agentIdState) return;
      const result = agentDetailService.block(agentIdState, reason, blockEndDate);
      if (result.ok) {
        setValue('status', 'blocked');
        setValue('statusReason', reason);
        toast.success(t('af_block_ok'));
      }
    },
    [agentIdState, setValue, t],
  );

  const onUnblock = useCallback(() => {
    if (!agentIdState) return;
    const result = agentDetailService.unblock(agentIdState);
    if (result.ok) {
      setValue('status', 'active');
      setValue('statusReason', null);
      toast.success(t('if_unblock_ok'));
    }
  }, [agentIdState, setValue, t]);

  const onUploadDocument = useCallback(
    (doc: DocumentUploadInput) => {
      const row = agentDetailService.uploadDocument(agentIdState, doc);
      setValue('documents', [...documents, row]);
      toast.success(t('if_doc_added'));
    },
    [agentIdState, documents, setValue, t],
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
      latitude: undefined,
      longitude: undefined,
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
    agentId: agentIdState,
  };
}

export type AgentApi = ReturnType<typeof useAgent>;

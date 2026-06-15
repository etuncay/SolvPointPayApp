import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useRole } from '@/domain/role-context';
import { authorizedPersonService } from '../api';
import { createAuthorizedPersonApprovalRequest } from '../api/authorized-person-approval-bridge';
import {
  createEmptyAuthorizedPersonValues,
  detailToFormValues,
} from '../api/mock-authorized-person-adapter';
import { getAuthorizedPersonPermissions } from '../domain/permissions';
import { authorizedPersonFormSchema, validatePersonDocumentsForSave } from '../domain/validation';
import type {
  AuthorizedPersonFormMode,
  AuthorizedPersonFormValues,
  BackgroundCheckStatus,
  DocumentUploadInput,
} from '../domain/types';

function allocId(seed: number) {
  return Date.now() + seed;
}

export function useAuthorizedPerson() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { personId } = useParams<{ personId?: string }>();
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get('agentId');
  const { role } = useRole();

  const mode: AuthorizedPersonFormMode = useMemo(() => {
    const param = searchParams.get('mode');
    if (param === 'view' || param === 'edit') return param;
    return personId ? 'edit' : 'new';
  }, [searchParams, personId]);

  const permissions = useMemo(() => getAuthorizedPersonPermissions(role), [role]);
  const isNew = mode === 'new';
  const isView =
    mode === 'view' || (isNew ? !permissions.insert : !permissions.update);

  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [kpsLocked, setKpsLocked] = useState(false);
  const [bgChecks, setBgChecks] = useState<BackgroundCheckStatus | null>(null);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [personIdState, setPersonIdState] = useState<string | null>(personId ?? null);
  const [originalValues, setOriginalValues] = useState<AuthorizedPersonFormValues | null>(null);

  const form = useForm<AuthorizedPersonFormValues>({
    defaultValues: createEmptyAuthorizedPersonValues(),
    mode: 'onBlur',
  });

  const { register, control, watch, setValue, reset, formState } = form;
  const idCountry = watch('idCountry');
  const gender = watch('gender');
  const maritalStatus = watch('maritalStatus');
  const status = watch('status');
  const documents = watch('documents');

  const isForeign = idCountry !== 'TUR';
  const isTR = !isForeign && idCountry === 'TUR';

  const addressesArray = useFieldArray({ control, name: 'addresses' });
  const contactsArray = useFieldArray({ control, name: 'contacts' });

  useEffect(() => {
    if (isNew) {
      reset(createEmptyAuthorizedPersonValues());
      setLoading(false);
      return;
    }
    if (!personId) return;
    const detail = authorizedPersonService.getById(personId);
    if (!detail) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    reset(detailToFormValues(detail));
    setOriginalValues(detailToFormValues(detail));
    setKpsLocked(detail.idCountry === 'TUR');
    setPersonIdState(personId);
    setBgChecks(authorizedPersonService.runBackgroundChecks(personId, detailToFormValues(detail)));
    setLoading(false);
  }, [personId, isNew, reset]);

  const onKpsBlur = useCallback(() => {
    const idNo = watch('idNo');
    const birthDate = watch('birthDate');
    if (!idNo || !birthDate) return;

    const existing = authorizedPersonService.lookupByIdentity(idNo, birthDate);
    if (existing && isNew) {
      toast.info(t('ap2_existing_loaded'));
      navigate(`/agents/authorized-persons/${existing.id}${agentId ? `?agentId=${agentId}` : ''}`);
      return;
    }

    if (watch('idCountry') === 'TUR' && watch('idType') === 'TCKN') {
      const kps = authorizedPersonService.fetchKps(idNo, birthDate);
      if (kps) {
        setValue('fullName', `${kps.firstName} ${kps.lastName}`);
        setValue('birthPlace', kps.birthPlace);
        setValue('maritalStatus', kps.maritalStatus as AuthorizedPersonFormValues['maritalStatus']);
        setValue('serialNo', kps.serialNo);
        setValue('issueDate', kps.issueDate);
        setValue('issuingAuthority', kps.issuingAuthority);
        setValue('validityDate', kps.validityDate);
        setValue('motherName', kps.motherName);
        setValue('fatherName', kps.fatherName);
        setValue('gender', kps.gender as AuthorizedPersonFormValues['gender']);
        setKpsLocked(true);
        toast.success(t('if_kps_loaded'));
      }
    }
  }, [watch, setValue, isNew, navigate, t, agentId]);

  const persist = useCallback(
    async (values: AuthorizedPersonFormValues, draft: boolean) => {
      if (!draft) {
        const parsed = authorizedPersonFormSchema.safeParse(values);
        if (!parsed.success) {
          const first = parsed.error.errors[0];
          toast.error(t(first?.message ?? 'if_validation_failed'));
          return;
        }
      }

      if (draft) {
        if (!permissions.draft) return;
        const result = authorizedPersonService.create(values, { draft: true });
        if (!result.ok) {
          toast.error(t(result.error ?? 'ib_save_failed'));
          return;
        }
        toast.success(t('if_draft_ok'));
        navigate(`/agents/authorized-persons/${result.id}${agentId ? `?agentId=${agentId}` : ''}`);
        return;
      }

      if (isNew ? !permissions.insert : !permissions.update) return;

      const docErr = validatePersonDocumentsForSave(values.documents);
      if (docErr) {
        toast.error(t(docErr));
        return;
      }

      const checks = authorizedPersonService.runBackgroundChecks(personIdState, values);
      setBgChecks(checks);
      if (checks.sanction === 'hit') {
        toast.error(t('if_sanction_hit'));
        return;
      }

      const result = createAuthorizedPersonApprovalRequest(
        {
          mode: isNew ? 'new' : 'edit',
          personId: personIdState,
          agentId,
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
    [personIdState, isNew, navigate, originalValues, role, t, permissions.draft, permissions.insert, permissions.update, agentId],
  );

  const onSave = () => {
    void persist(form.getValues(), false);
  };

  const onDraft = () => {
    void persist(form.getValues(), true);
  };

  const onCancel = useCallback(() => {
    if (formState.isDirty) {
      if (!window.confirm(t('ap2_unsaved_confirm'))) return;
    }
    if (agentId) {
      navigate(`/agents/${agentId}`);
      return;
    }
    navigate('/agents');
  }, [formState.isDirty, navigate, t, agentId]);

  const onBlock = useCallback(
    (reason: string, blockEndDate?: string) => {
      if (!personIdState) return;
      const result = authorizedPersonService.block(personIdState, reason, blockEndDate);
      if (result.ok) {
        setValue('status', 'blocked');
        setValue('statusReason', reason);
        toast.success(t('ap2_block_ok'));
      }
    },
    [personIdState, setValue, t],
  );

  const onUnblock = useCallback(() => {
    if (!personIdState) return;
    const result = authorizedPersonService.unblock(personIdState);
    if (result.ok) {
      setValue('status', 'active');
      setValue('statusReason', null);
      toast.success(t('if_unblock_ok'));
    }
  }, [personIdState, setValue, t]);

  const onUploadDocument = useCallback(
    (doc: DocumentUploadInput) => {
      const row = authorizedPersonService.uploadDocument(personIdState, doc);
      setValue('documents', [...documents, row]);
      toast.success(t('if_doc_added'));
    },
    [personIdState, documents, setValue, t],
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
    verifyContact,
    setPrimaryContact,
    addAddress,
    addContact,
    personId: personIdState,
    agentId,
  };
}

export type AuthorizedPersonApi = ReturnType<typeof useAuthorizedPerson>;

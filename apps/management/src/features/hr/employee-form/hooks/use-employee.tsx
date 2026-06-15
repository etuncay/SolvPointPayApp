import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useRole } from '@/domain/role-context';
import { getHrCurrentUserExtras } from '@/domain/hr-persona';
import { employeeDetailService } from '../api';
import { getMissingHrDocuments } from '../domain/required-hr-documents';
import {
  canAccessEmployeeForm,
  getEmployeeFormPermissions,
} from '../domain/permissions';
import { employeeFormSchema } from '../domain/validation';
import type {
  DocumentUploadInput,
  EmployeeDetail,
  EmployeeFormMode,
  EmployeeFormValues,
} from '../domain/types';

function allocId(seed: number) {
  return Date.now() + seed;
}

export function createEmptyFormValues(): EmployeeFormValues {
  return {
    photoUrl: null,
    firstName: '',
    lastName: '',
    identityNo: '',
    identityDocument: 'IdentityCard',
    title: '',
    departmentId: 'dept-ops',
    hireDate: new Date().toISOString().slice(0, 10),
    nationality: 'TUR',
    birthPlace: '',
    birthDate: '',
    gender: 'Male',
    maritalStatus: 'Single',
    maidenName: null,
    documentSerialNo: null,
    documentIssueDate: null,
    documentIssuedBy: null,
    documentExpiryDate: null,
    motherName: null,
    fatherName: null,
    educationLevel: 'Bachelor',
    lastSchool: null,
    graduationYear: null,
    taxCountry: 'TUR',
    bankName: null,
    bankAccountNo: null,
    iban: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    employmentStatus: 'Active',
    addresses: [
      {
        id: allocId(1),
        addressType: 'Home',
        country: 'TUR',
        city: '',
        district: '',
        postcode: '',
        line: '',
      },
    ],
    contacts: [
      { id: allocId(2), type: 'email', value: '', verified: false, primary: true },
      { id: allocId(3), type: 'phone', value: '', verified: false, primary: true },
    ],
    documents: [],
  };
}

function detailToFormValues(detail: EmployeeDetail): EmployeeFormValues {
  const { employeeId: _e, personId: _p, userNo: _u, createdAt: _c, updatedAt: _up, ...rest } = detail;
  return rest;
}

export function useEmployee() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId?: string }>();
  const [searchParams] = useSearchParams();
  const { role } = useRole();
  const { hrPersona } = getHrCurrentUserExtras(role);

  const mode: EmployeeFormMode = useMemo(() => {
    if (searchParams.get('mode') === 'view') return 'view';
    return employeeId ? 'update' : 'insert';
  }, [searchParams, employeeId]);

  const permissions = useMemo(
    () => getEmployeeFormPermissions(hrPersona, mode),
    [hrPersona, mode],
  );
  const isInsert = mode === 'insert';
  const isView = mode === 'view' || (!permissions.update && !isInsert);
  const canAccess = canAccessEmployeeForm(hrPersona, mode);

  const [loading, setLoading] = useState(!isInsert);
  const [notFound, setNotFound] = useState(false);
  const [detail, setDetail] = useState<EmployeeDetail | null>(null);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpPhoneIndex, setOtpPhoneIndex] = useState<number | null>(null);
  const [docOpen, setDocOpen] = useState(false);

  const form = useForm<EmployeeFormValues>({
    defaultValues: createEmptyFormValues(),
    mode: 'onBlur',
  });
  const { register, control, watch, setValue, reset } = form;
  const addressesArray = useFieldArray({ control, name: 'addresses' });
  const contactsArray = useFieldArray({ control, name: 'contacts' });
  const values = watch();

  const missingDocs = useMemo(
    () =>
      getMissingHrDocuments({
        nationality: values.nationality,
        employmentStatus: values.employmentStatus,
        documents: values.documents,
      }),
    [values.nationality, values.employmentStatus, values.documents],
  );

  useEffect(() => {
    if (!canAccess) return;
    if (isInsert) {
      reset(createEmptyFormValues());
      setLoading(false);
      return;
    }
    if (!employeeId) return;
    const row = employeeDetailService.getById(employeeId);
    if (!row) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setDetail(row);
    reset(detailToFormValues(row));
    setLoading(false);
  }, [employeeId, isInsert, reset, canAccess]);

  const persist = useCallback(
    (formValues: EmployeeFormValues) => {
      const parsed = employeeFormSchema.safeParse(formValues);
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        toast.error(t(first?.message ?? 'ef_validation_failed'));
        return;
      }
      const result = isInsert
        ? employeeDetailService.create(formValues)
        : employeeDetailService.update(employeeId!, formValues);
      if (!result.ok) {
        toast.error(t(result.errorCode, result.errorCode));
        return;
      }
      toast.success(t('ef_saved_ok'));
      navigate(`/hr/employees/${result.detail.employeeId}`);
    },
    [employeeId, isInsert, navigate, t],
  );

  const onSave = useCallback(() => persist(values), [persist, values]);
  const onCancel = useCallback(() => navigate('/hr/employees'), [navigate]);

  const verifyPhone = useCallback((index: number) => {
    setOtpPhoneIndex(index);
    setOtpOpen(true);
  }, []);

  const completeOtp = useCallback(
    (code: string) => {
      if (code !== '123456') {
        toast.error(t('ef_otp_invalid'));
        return false;
      }
      if (otpPhoneIndex != null) {
        setValue(`contacts.${otpPhoneIndex}.verified`, true, { shouldDirty: true });
      }
      setOtpOpen(false);
      toast.success(t('ef_otp_ok'));
      return true;
    },
    [otpPhoneIndex, setValue, t],
  );

  const onUploadDocument = useCallback(
    (input: DocumentUploadInput) => {
      if (isInsert) {
        const meta = input;
        setValue(
          'documents',
          [
            ...values.documents,
            {
              id: `local-${allocId(9)}`,
              type: meta.type,
              typeLabelKey: `ef_doc_${meta.type}`,
              fileName: meta.fileName,
              uploadedAt: new Date().toISOString(),
            },
          ],
          { shouldDirty: true },
        );
        toast.success(t('ef_doc_added_local'));
        return;
      }
      const result = employeeDetailService.uploadDocument(employeeId!, input);
      if (!result.ok) {
        toast.error(t(result.errorCode, result.errorCode));
        return;
      }
      reset(detailToFormValues(result.detail));
      setDetail(result.detail);
      toast.success(t('du_upload_success'));
    },
    [employeeId, isInsert, reset, setValue, t, values.documents],
  );

  return {
    mode,
    permissions,
    isInsert,
    isView,
    canAccess,
    loading,
    notFound,
    detail,
    register,
    control,
    watch,
    setValue,
    addressesArray,
    contactsArray,
    missingDocs,
    onSave,
    onCancel,
    otpOpen,
    setOtpOpen,
    otpPhoneIndex,
    verifyPhone,
    completeOtp,
    docOpen,
    setDocOpen,
    onUploadDocument,
    addAddress: () =>
      addressesArray.append({
        id: allocId(10),
        addressType: 'Home',
        country: 'TUR',
        city: '',
        district: '',
        postcode: '',
        line: '',
      }),
    addContact: (type: 'email' | 'phone') =>
      contactsArray.append({
        id: allocId(11),
        type,
        value: '',
        verified: false,
        primary: false,
      }),
  };
}

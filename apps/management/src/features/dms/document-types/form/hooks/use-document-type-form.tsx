import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { getAllDocumentTypesIncludingInactive } from '@/mocks/document-types-store';
import { documentTypesService } from '../../api/mock-document-types-adapter';
import { canMutateDocumentTypes } from '../../domain/permissions';
import {
  EMPTY_DOCUMENT_TYPE_FORM,
  type DocumentTypeFormValues,
} from '../domain/form-types';
import { validateDocumentTypeForm } from '../domain/validation';

export function useDocumentTypeForm(typeId?: string) {
  const { role } = useRole();
  const navigate = useNavigate();
  const isEdit = Boolean(typeId);
  const [loading, setLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);

  const form = useForm<DocumentTypeFormValues>({
    defaultValues: EMPTY_DOCUMENT_TYPE_FORM,
  });

  const approvalRequired = form.watch('approvalRequired');

  useEffect(() => {
    if (!approvalRequired) {
      form.setValue('approverRoles', []);
    }
  }, [approvalRequired, form]);

  useEffect(() => {
    if (!isEdit || !typeId) {
      setLoading(false);
      return;
    }
    const master = documentTypesService.getById(typeId);
    if (!master) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    form.reset({
      documentCategory: master.documentCategory,
      name: master.name,
      documentTypeCode: master.documentTypeCode,
      description: master.description,
      activeRetentionYears: master.activeRetentionYears,
      archiveRetentionYears: master.archiveRetentionYears,
      maxFileSizeMb: master.maxFileSizeMb != null ? String(master.maxFileSizeMb) : '',
      isPersonalData: master.isPersonalData,
      approvalRequired: master.approvalRequired,
      viewerRoles: [...master.viewerRoles],
      approverRoles: [...master.approverRoles],
    });
    setLoading(false);
  }, [isEdit, typeId, form]);

  const existingTypes = useMemo(
    () =>
      getAllDocumentTypesIncludingInactive()
        .filter((t) => t.recordStatus === 1)
        .map((t) => ({ id: t.id, documentTypeCode: t.documentTypeCode })),
    [],
  );

  const canMutate = canMutateDocumentTypes(role);

  const submit = (): { ok: true; id: string } | { ok: false; error: string } | null => {
    const validated = validateDocumentTypeForm(form.getValues(), {
      isEdit,
      editId: typeId,
      existingTypes,
    });
    if (!validated.ok) return validated;

    if (isEdit && typeId) {
      return documentTypesService.update(role, typeId, validated.payload);
    }
    return documentTypesService.create(role, validated.payload);
  };

  const cancel = () => navigate('/documents/types');

  return {
    form,
    isEdit,
    loading,
    notFound,
    canMutate,
    approvalRequired,
    submit,
    cancel,
  };
}

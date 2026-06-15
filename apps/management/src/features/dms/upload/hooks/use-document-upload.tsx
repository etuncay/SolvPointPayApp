import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import type { BackOfficeRole } from '@epay/ui';
import { DOCUMENT_CATEGORIES } from '@/features/document-review/domain/types';
import { documentsService } from '@/features/dms/api/mock-documents-adapter';
import type { DocumentCategory } from '@/features/dms/domain/types';
import type { DocumentTypeDefinition } from '@/features/dms/document-types/domain/types';
import {
  EMPTY_UPLOAD_FORM,
  type UploadFormValues,
} from '../domain/types';

export function useDocumentUpload(role: BackOfficeRole) {
  const [searchParams] = useSearchParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);

  const form = useForm<UploadFormValues>({
    defaultValues: {
      ...EMPTY_UPLOAD_FORM,
      relations:
        searchParams.get('relationType') && searchParams.get('relatedId')
          ? [
              {
                relationType: searchParams.get('relationType') as UploadFormValues['relations'][0]['relationType'],
                relatedId: searchParams.get('relatedId')!,
              },
            ]
          : [],
    },
  });

  const { control, watch, setValue, handleSubmit, formState } = form;
  const relationsArray = useFieldArray({ control, name: 'relations' });
  const category = watch('category') as DocumentCategory | '';
  const documentTypeId = watch('documentTypeId');

  const typeOptions: DocumentTypeDefinition[] = useMemo(() => {
    if (!category) return [];
    return documentsService.getDocumentTypesByCategory(role, category);
  }, [role, category]);

  useEffect(() => {
    if (!documentTypeId) return;
    if (!typeOptions.some((t) => t.id === documentTypeId)) {
      setValue('documentTypeId', '');
    }
  }, [category, documentTypeId, typeOptions, setValue]);

  const onCategoryChange = useCallback(
    (next: DocumentCategory | '') => {
      setValue('category', next);
      setValue('documentTypeId', '');
    },
    [setValue],
  );

  type UploadSubmitResult =
    | Awaited<ReturnType<typeof documentsService.create>>
    | { ok: false; error: string };

  const submitUpload = useCallback(async (): Promise<UploadSubmitResult | undefined> => {
    let outcome: UploadSubmitResult | undefined;
    await handleSubmit(async (values) => {
      if (!selectedFile) {
        outcome = { ok: false, error: 'du_file_required' };
        return;
      }
      if (!values.category) {
        outcome = { ok: false, error: 'du_category_required' };
        return;
      }

      setScanning(true);
      try {
        outcome = await documentsService.create(role, {
          category: values.category,
          documentTypeId: values.documentTypeId,
          validFrom: values.validFrom || undefined,
          validUntil: values.validUntil || undefined,
          file: selectedFile,
          relations: values.relations.filter((r) => r.relatedId.trim()),
        });
      } finally {
        setScanning(false);
      }
    })();
    return outcome;
  }, [handleSubmit, role, selectedFile]);

  return {
    form,
    categories: DOCUMENT_CATEGORIES,
    typeOptions,
    relationsArray,
    selectedFile,
    setSelectedFile,
    scanning,
    onCategoryChange,
    submitUpload,
    formState,
  };
}

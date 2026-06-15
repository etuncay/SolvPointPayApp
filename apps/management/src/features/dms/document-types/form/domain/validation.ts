import type { BackOfficeRole } from '@epay/ui';
import type { DocumentCategory } from '@/features/document-review/domain/types';
import type { DocumentTypeFormPayload, DocumentTypeFormValues } from './form-types';
import { parseMaxFileSizeInput, resolveDefaultMaxSizeMb } from './resolve-default-max-size';

export function slugifyTypeCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
}

export function isDocumentTypeCodeTaken(
  code: string,
  allCodes: { id: string; documentTypeCode: string }[],
  excludeId?: string,
): boolean {
  const norm = code.trim().toUpperCase();
  if (!norm) return false;
  return allCodes.some(
    (t) =>
      t.documentTypeCode.toUpperCase() === norm &&
      (excludeId == null || t.id !== excludeId),
  );
}

export function validateDocumentTypeForm(
  values: DocumentTypeFormValues,
  ctx: {
    isEdit: boolean;
    editId?: string;
    existingTypes: { id: string; documentTypeCode: string }[];
  },
): { ok: true; payload: DocumentTypeFormPayload } | { ok: false; error: string } {
  if (!values.documentCategory) {
    return { ok: false, error: 'dtf_category_required' };
  }
  if (!values.name.trim()) {
    return { ok: false, error: 'dtf_name_required' };
  }

  const code = ctx.isEdit
    ? values.documentTypeCode.trim().toUpperCase()
    : slugifyTypeCode(values.name);
  if (!code) {
    return { ok: false, error: 'dtf_code_invalid' };
  }

  if (isDocumentTypeCodeTaken(code, ctx.existingTypes, ctx.editId)) {
    return { ok: false, error: 'dtf_duplicate_type_code' };
  }

  if (values.activeRetentionYears < 1 || values.archiveRetentionYears < 1) {
    return { ok: false, error: 'dtf_retention_invalid' };
  }

  if (values.viewerRoles.length === 0) {
    return { ok: false, error: 'dtf_viewer_roles_required' };
  }

  if (values.approvalRequired && values.approverRoles.length === 0) {
    return { ok: false, error: 'dtf_approver_roles_required' };
  }

  const parsedMax = parseMaxFileSizeInput(values.maxFileSizeMb);
  const maxStored = parsedMax === null ? null : resolveDefaultMaxSizeMb(parsedMax);

  const approverRoles: BackOfficeRole[] = values.approvalRequired ? values.approverRoles : [];

  return {
    ok: true,
    payload: {
      documentCategory: values.documentCategory as DocumentCategory,
      name: values.name.trim(),
      documentTypeCode: code,
      description: values.description.trim(),
      activeRetentionYears: values.activeRetentionYears,
      archiveRetentionYears: values.archiveRetentionYears,
      maxFileSizeMb: maxStored,
      isPersonalData: values.isPersonalData,
      approvalRequired: values.approvalRequired,
      viewerRoles: [...values.viewerRoles],
      approverRoles,
      uploaderRoles: [...values.viewerRoles],
    },
  };
}

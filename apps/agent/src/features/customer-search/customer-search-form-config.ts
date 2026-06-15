import type { FormConfig, TranslateFn } from '@epay/ui';
import searchFormJson from './config/search.form.config.json';
import documentUploadJson from './config/document-upload.form.config.json';
import { localizeDocumentUploadFormConfig, localizeSearchFormConfig } from './localize-config';

export function buildSearchFormConfig(t?: TranslateFn): FormConfig {
  const base = searchFormJson as FormConfig;
  return t ? localizeSearchFormConfig(base, t) : base;
}

export function buildDocumentUploadFormConfig(t?: TranslateFn): FormConfig {
  const base = documentUploadJson as FormConfig;
  return t ? localizeDocumentUploadFormConfig(base, t) : base;
}

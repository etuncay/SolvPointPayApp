import type { FieldConfig, FormConfig, TranslateFn } from '@epay/ui';
import { buildIndividualFormConfig } from '@/features/individual-form/individual-form-config';
import { buildCorporateFormConfig } from '@/features/corporate-form/corporate-form-config';
import { buildAgentFormConfig } from '@/features/agent-form/agent-form-config';
import { buildAPFormConfig } from '@/features/authorized-person-form/agent-person-form-config';
import { buildWalletDetailFormConfig } from '@/features/wallets/wallet-detail-form-config';
import { buildManualCorrectionFormConfig } from '@/features/transfers/manual-correction-form-config';
import { buildParameterFormConfig } from '@/features/system/parameters/parameter-form-config';

export interface ApprovalFormEntry {
  /** Modal başlığı i18n anahtarı */
  titleKey: string;
  /** İlgili ekranın form config üreticisi */
  buildConfig: (t?: TranslateFn) => FormConfig;
}

/**
 * Onay kaydının `payload.formKey`'i → giriş ekranı formu. Kayıtlı değilse (ör. FX,
 * tablo tabanlı ekranlar) onay modalı özet diff tablosuna düşer (8.1 §8 fallback).
 */
export const APPROVAL_FORM_REGISTRY: Record<string, ApprovalFormEntry> = {
  individual: { titleKey: 'ap_form_individual', buildConfig: buildIndividualFormConfig },
  corporate: { titleKey: 'ap_form_corporate', buildConfig: buildCorporateFormConfig },
  agent: { titleKey: 'ap_form_agent', buildConfig: buildAgentFormConfig },
  authorized_person: { titleKey: 'ap_form_authorized_person', buildConfig: buildAPFormConfig },
  wallet_detail: { titleKey: 'ap_form_wallet_detail', buildConfig: buildWalletDetailFormConfig },
  manual_correction: { titleKey: 'ap_form_manual_correction', buildConfig: buildManualCorrectionFormConfig },
  system_parameter: { titleKey: 'ap_form_system_parameter', buildConfig: buildParameterFormConfig },
};

export function getApprovalFormEntry(formKey?: string): ApprovalFormEntry | null {
  if (!formKey) return null;
  return APPROVAL_FORM_REGISTRY[formKey] ?? null;
}

/* ── config sadeleştirme (onay modalı salt-okunur skaler görünüm) ── */

function stripFields(fields?: FieldConfig[]): FieldConfig[] {
  if (!fields) return [];
  const out: FieldConfig[] = [];
  for (const f of fields) {
    // App context gerektiren alt-editörler (banka/adres/ortak vb.) modalda render edilmez;
    // koleksiyon değişiklikleri özet diff tablosunda görünür.
    if (f.type === 'CustomComponent') continue;
    if (f.type === 'Row' && f.fields) {
      const children = stripFields(f.fields);
      if (children.length) out.push({ ...f, fields: children });
      continue;
    }
    out.push(f);
  }
  return out;
}

function hasRenderable(fields: FieldConfig[]): boolean {
  return fields.some((f) => f.type !== 'Divider');
}

/**
 * Onay modalı için config'i sadeleştirir: CustomComponent alanları + boş panelleri,
 * header (custom title/status + aksiyonlar) ve buton çubuğunu kaldırır. Geriye salt-okunur
 * skaler alanlar kalır; bunlar diff vurgusuyla gösterilir.
 */
export function stripApprovalConfig(config: FormConfig): FormConfig {
  const next: FormConfig = { ...config };
  if (next.fields) next.fields = stripFields(next.fields);
  if (next.panels) {
    next.panels = next.panels
      .map((p) => ({ ...p, fields: stripFields(p.fields) }))
      .filter((p) => hasRenderable(p.fields));
  }
  if (next.tabs) {
    next.tabs = next.tabs.map((tab) => ({
      ...tab,
      fields: tab.fields ? stripFields(tab.fields) : undefined,
      panels: tab.panels
        ? tab.panels
            .map((p) => ({ ...p, fields: stripFields(p.fields) }))
            .filter((p) => hasRenderable(p.fields))
        : undefined,
    }));
  }
  delete next.header;
  delete next.buttonToolbar;
  return next;
}

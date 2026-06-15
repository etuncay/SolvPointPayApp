import type { FormConfig, TableConfig, TranslateFn } from '@epay/ui';

type TableConfigJson = Omit<TableConfig, 'api'>;

const SEARCH_FIELD_KEYS: Record<string, string> = {
  customerNo: 'ag_cs_field_customer_no',
  idNo: 'ag_cs_field_id_no',
};

const CUSTOMER_INFO_COL: Record<string, string> = {
  customerNo: 'ag_cs_col_customer_no',
  fullName: 'ag_cs_col_full_name',
  idNo: 'ag_cs_col_id_no',
  kycLevel: 'ag_cs_col_kyc',
  riskSegment: 'ag_cs_col_risk',
  primaryPhone: 'ag_cs_col_phone',
  primaryEmail: 'ag_cs_col_email',
  city: 'ag_cs_col_city',
  district: 'ag_cs_col_district',
  membershipDate: 'ag_cs_col_membership',
  campaign: 'ag_cs_col_campaign',
  campaignEndDate: 'ag_cs_col_campaign_end',
  status: 'ag_cs_col_status',
  statusReason: 'ag_cs_col_status_reason',
};

const ACCOUNTS_COL: Record<string, string> = {
  walletNo: 'ag_cs_col_wallet_no',
  currency: 'ag_cs_col_currency',
  availableBalance: 'ag_cs_col_available',
  withdrawalLimit: 'ag_cs_col_withdrawal_limit',
  transferLimit: 'ag_cs_col_transfer_limit',
  internationalLimit: 'ag_cs_col_intl_limit',
};

const PENDING_TX_COL: Record<string, string> = {
  transactionNo: 'ag_cs_col_tx_no',
  createdAt: 'ag_cs_col_tx_date',
  transactionType: 'ag_cs_col_tx_type',
  senderName: 'ag_cs_col_sender',
  receiverName: 'ag_cs_col_receiver',
  currency: 'ag_cs_col_currency',
  amount: 'ag_cs_col_amount',
  status: 'ag_cs_col_tx_status',
  description: 'ag_cs_col_description',
};

function localizeTable(base: TableConfigJson, titleKey: string, colMap: Record<string, string>, t: TranslateFn): TableConfigJson {
  return {
    ...base,
    title: t(titleKey, base.title),
    columns: base.columns.map((c) => ({
      ...c,
      title: t(colMap[c.key] ?? c.key, c.title),
    })),
  };
}

export function localizeSearchFormConfig(base: FormConfig, t: TranslateFn): FormConfig {
  const localizeFields = (fields: FormConfig['fields']) =>
    fields?.map((f) => ({
      ...f,
      label: f.label ? t(SEARCH_FIELD_KEYS[f.name] ?? f.name, f.label) : f.label,
      placeholder: f.placeholder ? t(`${SEARCH_FIELD_KEYS[f.name]}_ph`, f.placeholder) : f.placeholder,
    }));

  return {
    ...base,
    fields: localizeFields(base.fields),
    tabs: base.tabs?.map((tab) => ({
      ...tab,
      title: tab.title,
      fields: localizeFields(tab.fields) ?? [],
    })),
    panels: base.panels?.map((p) => ({
      ...p,
      fields: localizeFields(p.fields) ?? [],
    })),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons?.map((b) => ({
            ...b,
            label: b.key === 'search' ? t('ag_cs_btn_search', b.label) : b.label,
          })),
        }
      : base.buttonToolbar,
  };
}

export function localizeCustomerInfoTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return localizeTable(base, 'ag_cs_panel_customer', CUSTOMER_INFO_COL, t);
}

export function localizeAccountsTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return localizeTable(base, 'ag_cs_panel_accounts', ACCOUNTS_COL, t);
}

export function localizePendingTxTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return localizeTable(base, 'ag_cs_panel_pending_tx', PENDING_TX_COL, t);
}

const DOCUMENTS_VIEW_COL: Record<string, string> = {
  category: 'ag_cs_doc_category',
  type: 'ag_cs_doc_type',
  validityLabel: 'ag_cs_doc_validity',
  approvalStatus: 'ag_cs_doc_approval',
  fileName: 'ag_cs_doc_file',
};

export function localizeDocumentsViewTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return localizeTable(base, 'ag_cs_view_title', DOCUMENTS_VIEW_COL, t);
}

export function localizeDocumentUploadFormConfig(base: FormConfig, t: TranslateFn): FormConfig {
  return {
    ...base,
    fields: base.fields?.map((f) => {
      if (f.name === 'category' && f.options) {
        return {
          ...f,
          label: t('ag_cs_doc_category', f.label),
          options: [
            { label: t('ag_cs_doc_cat_identity'), value: 'Identity' },
            { label: t('ag_cs_doc_cat_poa'), value: 'ProofOfAddress' },
            { label: t('ag_cs_doc_cat_pof'), value: 'ProofOfFunds' },
          ],
        };
      }
      if (f.name === 'type') {
        return { ...f, label: t('ag_cs_doc_type', f.label) };
      }
      if (f.name === 'validFrom') return { ...f, label: t('ag_cs_doc_valid_from', f.label) };
      if (f.name === 'validTo') return { ...f, label: t('ag_cs_doc_valid_to', f.label) };
      if (f.name === 'fileName') return { ...f, label: t('ag_cs_doc_file', f.label) };
      return f;
    }),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t(b.key === 'cancel' ? 'form_cancel' : 'ag_cs_upload_submit', b.label),
          })),
        }
      : base.buttonToolbar,
  };
}

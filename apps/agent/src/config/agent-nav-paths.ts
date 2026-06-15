/** Agent menü route sabitleri — docs/Agent/00.index.md ile hizalı */
export const AGENT_PATHS = {
  home: '/',
  accounts: '/accounts',
  customerNew: '/customers/new',
  customers: '/customers',
  withdrawal: '/withdrawal',
  transfers: {
    root: '/transfers',
    ownWallet: '/transfers/own-wallet',
    bankAccount: '/transfers/bank-account',
    person: '/transfers/person',
    abroad: '/transfers/abroad',
  },
  transactions: '/transactions',
  transaction: {
    detail: (id: number | string) => `/transactions/${id}`,
    approve: (id: number | string) => `/transactions/${id}/approve`,
    signedReceipt: (id: number | string) => `/transactions/${id}/signed-receipt`,
    success: (id: number | string) => `/transactions/${id}/success`,
  },
  receiptPrint: (id: number | string) => `/receipt/${id}`,
  feedback: '/feedback',
  playground: '/playground',
} as const;

/** Para Transferi alt menü — pathname → sidebar sub id */
export const TRANSFER_PATH_SUB_ID: Record<string, string> = {
  [AGENT_PATHS.transfers.ownWallet]: 'tr_own',
  [AGENT_PATHS.transfers.bankAccount]: 'tr_bank',
  [AGENT_PATHS.transfers.person]: 'tr_person',
  [AGENT_PATHS.transfers.abroad]: 'tr_abroad',
};

export const TRANSFER_SUB_LABEL_KEYS: Record<string, string> = {
  tr_own: 'ag_s_tr_own',
  tr_bank: 'ag_s_tr_bank',
  tr_person: 'ag_s_tr_person',
  tr_abroad: 'ag_s_tr_abroad',
};

/** Müşteri alt menü — sidebar sub id → i18n key */
export const CUSTOMER_SUB_LABEL_KEYS: Record<string, string> = {
  cust_list: 'ag_s_cust_list',
  cust_new: 'ag_s_cust_new',
};

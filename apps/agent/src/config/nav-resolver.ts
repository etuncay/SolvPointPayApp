import { AGENT_PATHS, CUSTOMER_SUB_LABEL_KEYS, TRANSFER_PATH_SUB_ID, TRANSFER_SUB_LABEL_KEYS } from './agent-nav-paths';
import { NAV_DEFAULT_HREF } from './navigation';

export function resolveActiveNav(pathname: string): string {
  if (pathname === AGENT_PATHS.home) return 'home';
  if (pathname.startsWith(AGENT_PATHS.accounts)) return 'accounts';
  // /customers/new ve /customers/:id dahil tüm müşteri sayfaları
  if (pathname.startsWith(AGENT_PATHS.customers)) return 'customers';
  if (pathname.startsWith(AGENT_PATHS.withdrawal)) return 'withdrawal';
  if (pathname.startsWith(AGENT_PATHS.transfers.root)) return 'transfers';
  if (pathname.startsWith(AGENT_PATHS.transactions)) return 'transactions';
  if (pathname.startsWith(AGENT_PATHS.feedback)) return 'feedback';
  if (pathname.startsWith(AGENT_PATHS.playground)) return 'playground';
  return 'home';
}

export function resolveActiveSub(pathname: string): string | null {
  // Transfer alt menü
  if (TRANSFER_PATH_SUB_ID[pathname]) return TRANSFER_PATH_SUB_ID[pathname];
  // Müşteri alt menü: yeni kayıt → cust_new; liste ve düzenleme → cust_list
  if (pathname === AGENT_PATHS.customerNew) return 'cust_new';
  if (pathname.startsWith(AGENT_PATHS.customers)) return 'cust_list';
  return null;
}

export function resolveSubCrumbLabel(
  activeNav: string,
  activeSub: string | null,
  t: (key: string) => string,
): string | null {
  if (activeNav === 'transfers' && activeSub) {
    const key = TRANSFER_SUB_LABEL_KEYS[activeSub];
    return key ? t(key) : null;
  }
  if (activeNav === 'customers' && activeSub) {
    const key = CUSTOMER_SUB_LABEL_KEYS[activeSub];
    return key ? t(key) : null;
  }
  return null;
}

export function resolveNavHref(activeNav: string): string {
  return NAV_DEFAULT_HREF[activeNav] ?? AGENT_PATHS.home;
}

/** Menüde olmayan işlem alt ekranları için breadcrumb yaprağı. */
export function resolveTransactionCrumb(pathname: string, t: (key: string) => string): string | null {
  if (/^\/transactions\/[^/]+\/approve$/.test(pathname)) return t('ag_cf_title_approve');
  if (/^\/transactions\/[^/]+\/signed-receipt$/.test(pathname)) return t('ag_sr_title');
  if (/^\/transactions\/[^/]+\/success$/.test(pathname)) return t('ag_success_title');
  if (/^\/transactions\/\d+$/.test(pathname)) return t('ag_cf_title_detail');
  return null;
}

export function resolvePlaygroundCrumb(pathname: string, t: (key: string) => string): string | null {
  if (pathname === `${AGENT_PATHS.playground}/new`) return t('pg_form_new');
  if (/^\/playground\/edit\//.test(pathname)) return t('pg_form_edit');
  if (/^\/playground\/delete\//.test(pathname)) return t('pg_form_delete');
  if (/^\/playground\/view\//.test(pathname)) return t('pg_form_view');
  return null;
}

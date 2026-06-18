/** Temsilci portalı — uygulama kimliği ve oturum anahtarları */
export const APP_PRODUCT = 'Agent Portal';

export const APP_SESSION_KEY = 'epay-agent-auth-session';
export const APP_ROLE_STORAGE_KEY = 'epay-agent-portal-role';

/** Mock işlem store — sessionStorage anahtarı öneki (`{agentId}` ile tamamlanır). */
export const AGENT_TX_STORE_KEY_PREFIX = 'epay-agent-tx-store';

/** Login ekranında gösterilen demo hesaplar (parola @epay/data DEMO_PASSWORD) */
export const AGENT_DEMO_ACCOUNTS = [{ email: 'agent@epay.demo', role: 'ops' as const }];

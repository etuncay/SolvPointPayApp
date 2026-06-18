import { createHttpAuthAdapter } from '../adapters/http/auth-http.adapter';
import { createHttpCustomersAdapter } from '../adapters/http/customers-http.adapter';
import { createHttpFormReferenceAdapter } from '../adapters/http/form-reference-http.adapter';
import { createHttpAccountsAdapter } from '../adapters/http/accounts-http.adapter';
import { createHttpAgentRegistrationAdapter } from '../adapters/http/registration-http.adapter';
import { createHttpCustomerPortalAdapter } from '../adapters/http/customer-portal-http.adapter';
import { createHttpTransactionsAdapter } from '../adapters/http/transactions-http.adapter';
import { createHttpWalletsAdapter } from '../adapters/http/wallets-http.adapter';
import { createDexieCustomersAdapter } from '../adapters/dexie/customers-dexie.adapter';
import { createDexieFormReferenceAdapter } from '../adapters/dexie/form-reference-dexie.adapter';
import { createDexieAccountsAdapter } from '../adapters/dexie/accounts-dexie.adapter';
import { createDexieAgentRegistrationAdapter } from '../adapters/dexie/registration-dexie.adapter';
import { createDexieCustomerPortalAdapter } from '../adapters/dexie/customer-portal-dexie.adapter';
import { createDexieTransactionsAdapter } from '../adapters/dexie/transactions-dexie.adapter';
import { createDexieWalletsAdapter } from '../adapters/dexie/wallets-dexie.adapter';
import { ensurePlaygroundCustomersSeeded } from '../db/seed';
import { ensureReferenceDataSeeded } from '../db/seed-references';
import { ensureAgentAccountsSeeded } from '../db/seed-accounts';
import { ensureAgentRegistrationsSeeded } from '../db/seed-registration';
import { ensureCustomerPortalSeeded } from '../db/seed-customer-portal';
import { ensureBackOfficeTransactionsSeeded } from '../db/seed-transactions';
import { ensureBackOfficeWalletsSeeded } from '../db/seed-wallets';
import { getDb } from '../db/dexie';
import { setCustomersApiPort, getCustomersApiPort } from '../services/customers.service';
import { setCustomerPortalApiPort } from '../services/customer-portal.service';
import { setFormReferenceApiPort, getFormReferenceApiPort } from '../services/form-reference.service';
import { setAccountsApiPort } from '../services/accounts.service';
import { setAgentRegistrationApiPort } from '../services/registration.service';
import { setTransactionsApiPort } from '../services/transactions.service';
import { setWalletsApiPort } from '../services/wallets.service';
import { createMockAuthAdapter } from '../adapters/mock/auth-mock.adapter';
import { setAuthPort } from '../services/auth.service';

export type DataDriver = 'dexie' | 'http';

let activeDriver: DataDriver = 'dexie';

export interface ConfigureDataLayerOptions {
  /** dexie = tarayıcı mock (varsayılan); http = gerçek API */
  driver?: DataDriver;
  /** driver === 'http' iken zorunlu — örn. import.meta.env.VITE_API_BASE_URL */
  apiBaseUrl?: string;
}

/**
 * Veri katmanı sürücüsünü seçer.
 * Mock aşamasında çağrılmasa bile varsayılan Dexie adapter kullanılır.
 */
export function configureDataLayer(options: ConfigureDataLayerOptions = {}): void {
  const driver = options.driver ?? 'dexie';
  if (driver === 'http') {
    if (!options.apiBaseUrl?.trim()) {
      throw new Error('[@epay/data] http driver için apiBaseUrl gerekli');
    }
    activeDriver = 'http';
    const base = options.apiBaseUrl.trim();
    setAuthPort(createHttpAuthAdapter(base));
    setCustomersApiPort(createHttpCustomersAdapter(base));
    setFormReferenceApiPort(createHttpFormReferenceAdapter(base));
    setAccountsApiPort(createHttpAccountsAdapter(base));
    setAgentRegistrationApiPort(createHttpAgentRegistrationAdapter(base));
    setCustomerPortalApiPort(createHttpCustomerPortalAdapter(base));
    setTransactionsApiPort(createHttpTransactionsAdapter(base));
    setWalletsApiPort(createHttpWalletsAdapter(base));
    return;
  }
  activeDriver = 'dexie';
  setAuthPort(createMockAuthAdapter());
  setCustomersApiPort(createDexieCustomersAdapter());
  setFormReferenceApiPort(createDexieFormReferenceAdapter());
  setAccountsApiPort(createDexieAccountsAdapter());
  setAgentRegistrationApiPort(createDexieAgentRegistrationAdapter());
  setCustomerPortalApiPort(createDexieCustomerPortalAdapter());
  setTransactionsApiPort(createDexieTransactionsAdapter());
  setWalletsApiPort(createDexieWalletsAdapter());
}

/** Mock mod: Dexie + ilk seed (playground ve benzeri ekranlar) */
export async function initMockDataLayer(): Promise<void> {
  if (!getCustomersApiPort()) {
    configureDataLayer({ driver: 'dexie' });
  }
  await ensurePlaygroundCustomersSeeded();
  await ensureReferenceDataSeeded();
  await ensureAgentAccountsSeeded();
  await ensureAgentRegistrationsSeeded();
  await ensureCustomerPortalSeeded();
  await ensureBackOfficeTransactionsSeeded(getDb());
  await ensureBackOfficeWalletsSeeded(getDb());
}

export function getActiveDataDriver(): DataDriver {
  return getCustomersApiPort() ? activeDriver : 'dexie';
}

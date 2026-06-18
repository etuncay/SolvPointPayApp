import { DEMO_CUSTOMER_PASSWORD } from './seed-customer-portal';

const STORAGE_KEY = 'epay.customer.demo-password';

/** Mock müşteri parolası — seed varsayılanı veya changePassword sonrası güncel değer. */
export function getDemoCustomerPassword(): string {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
    }
  } catch {
    /* private mode */
  }
  return DEMO_CUSTOMER_PASSWORD;
}

export function setDemoCustomerPassword(password: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, password);
    }
  } catch {
    /* private mode */
  }
}

export function resetDemoCustomerPassword(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* private mode */
  }
}

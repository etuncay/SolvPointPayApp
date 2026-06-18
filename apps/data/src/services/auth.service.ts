import type { AuthPort } from '../contracts/auth-port';
import { createMockAuthAdapter } from '../adapters/mock/auth-mock.adapter';

let port: AuthPort | null = null;

export function setAuthPort(next: AuthPort): void {
  port = next;
}

export function getAuthPort(): AuthPort | null {
  return port;
}

function resolvePort(): AuthPort {
  if (!port) {
    port = createMockAuthAdapter();
  }
  return port;
}

/** BackOffice auth — UI ve auth-context bu yüzeyi kullanır. */
export const authApi: AuthPort = {
  getSessionUser() {
    return resolvePort().getSessionUser();
  },
  authenticate(email, password) {
    return resolvePort().authenticate(email, password);
  },
  verifyOtp(userId, code, kind) {
    return resolvePort().verifyOtp(userId, code, kind);
  },
  getAccountUser(userId) {
    return resolvePort().getAccountUser(userId);
  },
  registerAccount(payload) {
    return resolvePort().registerAccount(payload);
  },
  activateAccount(userId) {
    return resolvePort().activateAccount(userId);
  },
  resendOtp(userId, kind) {
    return resolvePort().resendOtp(userId, kind);
  },
  logout() {
    return resolvePort().logout();
  },
};

/** @deprecated authApi.authenticate kullanın */
export function authenticate(email: string, password: string) {
  return authApi.authenticate(email, password);
}

/** @deprecated authApi.getAccountUser kullanın */
export function getAccountUser(userId: string) {
  return authApi.getAccountUser(userId);
}

/** @deprecated authApi.registerAccount kullanın */
export function registerAccount(payload: Parameters<AuthPort['registerAccount']>[0]) {
  return authApi.registerAccount(payload);
}

/** @deprecated authApi.activateAccount kullanın */
export function activateAccount(userId: string) {
  return authApi.activateAccount(userId);
}

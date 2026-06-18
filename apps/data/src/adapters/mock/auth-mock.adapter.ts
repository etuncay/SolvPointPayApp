import { AUTH_SEED_ACCOUNTS } from '../../db/seed-auth';
import type { AuthPort } from '../../contracts/auth-port';
import type { AuthAccountRecord, AuthOtpResult, AuthResult, AuthUser, RegisterPayload } from '../../types/auth';

const REG_KEY = 'epay-auth-registered';
const SESSION_KEY = 'epay-auth-session';
const OTP_KEY = 'epay-auth-otp-pending';

interface OtpPending {
  userId: string;
  kind: 'login' | 'register';
  code: string;
}

function loadRegistered(): AuthAccountRecord[] {
  try {
    const raw = sessionStorage.getItem(REG_KEY);
    return raw ? (JSON.parse(raw) as AuthAccountRecord[]) : [];
  } catch {
    return [];
  }
}

function saveRegistered(list: AuthAccountRecord[]): void {
  try {
    sessionStorage.setItem(REG_KEY, JSON.stringify(list));
  } catch {
    /* private mode */
  }
}

function allAccounts(): AuthAccountRecord[] {
  return [...AUTH_SEED_ACCOUNTS, ...loadRegistered()];
}

function toUser(a: AuthAccountRecord): AuthUser {
  return { id: a.id, fullName: a.fullName, email: a.email, phone: a.phone, role: a.role };
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function loadOtp(): OtpPending | null {
  try {
    const raw = sessionStorage.getItem(OTP_KEY);
    return raw ? (JSON.parse(raw) as OtpPending) : null;
  } catch {
    return null;
  }
}

function saveOtp(pending: OtpPending | null): void {
  try {
    if (pending) sessionStorage.setItem(OTP_KEY, JSON.stringify(pending));
    else sessionStorage.removeItem(OTP_KEY);
  } catch {
    /* private mode */
  }
}

function persistSession(user: AuthUser | null): void {
  try {
    if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode */
  }
}

/** Demo / geliştirme — seed + sessionStorage kayıtlı hesaplar. */
export function createMockAuthAdapter(): AuthPort {
  return {
    async getSessionUser() {
      try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as AuthUser;
      } catch {
        return null;
      }
    },

    async authenticate(email, password) {
      const acc = allAccounts().find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
      if (!acc || acc.password !== password) return { ok: false, error: 'invalid' };
      if (acc.status !== 'active') return { ok: false, error: 'inactive' };
      const code = generateOtp();
      saveOtp({ userId: acc.id, kind: 'login', code });
      // eslint-disable-next-line no-console
      console.info('[demo OTP]', code);
      return { ok: true, userId: acc.id, requiresOtp: true, demoOtp: code };
    },

    async verifyOtp(userId, code, kind) {
      const pending = loadOtp();
      if (!pending || pending.userId !== userId || pending.kind !== kind) {
        return { ok: false, error: 'expired' };
      }
      if (code.trim() !== pending.code) return { ok: false, error: 'otp' };

      if (kind === 'register') {
        const list = loadRegistered();
        const i = list.findIndex((a) => a.id === userId);
        if (i >= 0) {
          list[i] = { ...list[i]!, status: 'active' };
          saveRegistered(list);
        }
        saveOtp(null);
        return { ok: true };
      }

      const acc = allAccounts().find((x) => x.id === userId);
      saveOtp(null);
      if (!acc) return { ok: false, error: 'expired' };
      const user = toUser(acc);
      persistSession(user);
      return { ok: true, user };
    },

    async getAccountUser(userId) {
      const a = allAccounts().find((x) => x.id === userId);
      return a ? toUser(a) : undefined;
    },

    async registerAccount(p: RegisterPayload) {
      const email = p.email.trim().toLowerCase();
      if (allAccounts().some((a) => a.email.toLowerCase() === email)) {
        return { ok: false, error: 'exists' };
      }
      const list = loadRegistered();
      const id = `usr-${Date.now().toString(36)}`;
      list.push({
        id,
        fullName: p.fullName.trim(),
        email: p.email.trim(),
        phone: p.phone.trim(),
        role: p.role,
        password: p.password,
        status: 'pending',
      });
      saveRegistered(list);
      const otpCode = generateOtp();
      saveOtp({ userId: id, kind: 'register', code: otpCode });
      // eslint-disable-next-line no-console
      console.info('[demo OTP]', otpCode);
      return { ok: true, userId: id, requiresOtp: true, demoOtp: otpCode };
    },

    async activateAccount(userId) {
      const list = loadRegistered();
      const i = list.findIndex((a) => a.id === userId);
      if (i >= 0) {
        list[i] = { ...list[i]!, status: 'active' };
        saveRegistered(list);
      }
    },

    async resendOtp(userId, kind) {
      const pending = loadOtp();
      if (!pending || pending.userId !== userId || pending.kind !== kind) {
        return { ok: false };
      }
      const code = generateOtp();
      saveOtp({ ...pending, code });
      // eslint-disable-next-line no-console
      console.info('[demo OTP]', code);
      return { ok: true, demoOtp: code };
    },

    async logout() {
      persistSession(null);
      saveOtp(null);
    },
  };
}

/** Testler — sessionStorage kayıtlı hesap listesini sıfırlar. */
export function clearMockRegisteredAccounts(): void {
  try {
    sessionStorage.removeItem(REG_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(OTP_KEY);
  } catch {
    /* ignore */
  }
}

import { AUTH_SEED_ACCOUNTS } from '../db/seed-auth';
import type {
  AuthAccountRecord,
  AuthResult,
  AuthUser,
  RegisterPayload,
} from '../types/auth';

const REG_KEY = 'epay-auth-registered';

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

/** E-posta + parola doğrula. */
export function authenticate(email: string, password: string): AuthResult {
  const acc = allAccounts().find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!acc || acc.password !== password) return { ok: false, error: 'invalid' };
  if (acc.status !== 'active') return { ok: false, error: 'inactive' };
  return { ok: true, userId: acc.id };
}

export function getAccountUser(userId: string): AuthUser | undefined {
  const a = allAccounts().find((x) => x.id === userId);
  return a ? toUser(a) : undefined;
}

/** Yeni hesap oluştur (pending — OTP doğrulayınca aktifleşir). */
export function registerAccount(p: RegisterPayload): AuthResult {
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
  return { ok: true, userId: id };
}

/** Kayıtlı hesabı aktifleştir (register OTP sonrası). */
export function activateAccount(userId: string): void {
  const list = loadRegistered();
  const i = list.findIndex((a) => a.id === userId);
  if (i >= 0) {
    list[i] = { ...list[i]!, status: 'active' };
    saveRegistered(list);
  }
}

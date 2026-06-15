/* ──────────────────────────────────────────────────────
 *  AuthProvider — oturum + OTP akış durumu.
 *  Oturum sessionStorage'da; rol oturumdaki kullanıcıdan gelir.
 * ────────────────────────────────────────────────────── */
import * as React from 'react';
import {
  activateAccount,
  authenticate,
  getAccountUser,
  registerAccount,
  type AuthErrorCode,
  type AuthUser,
  type RegisterPayload,
} from '@epay/data';

type OtpKind = 'login' | 'register';

interface PendingOtp {
  kind: OtpKind;
  userId: string;
  email: string;
  phone: string;
  /** Demo: gerçek SMS olmadığından kod ekranda ipucu olarak gösterilir. */
  code: string;
}

export interface FlowResult {
  ok: boolean;
  error?: AuthErrorCode | 'otp' | 'expired';
}

interface AuthContextValue {
  user: AuthUser | null;
  pending: PendingOtp | null;
  startLogin: (email: string, password: string) => FlowResult;
  startRegister: (payload: RegisterPayload) => FlowResult;
  verifyOtp: (code: string) => FlowResult;
  resendOtp: () => void;
  cancelPending: () => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);
const SESSION_KEY = 'epay-auth-session';

function loadSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
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

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(loadSession);
  const [pending, setPending] = React.useState<PendingOtp | null>(null);

  const startLogin = React.useCallback((email: string, password: string): FlowResult => {
    const res = authenticate(email, password);
    if (!res.ok || !res.userId) return { ok: false, error: res.error };
    const acc = getAccountUser(res.userId);
    if (!acc) return { ok: false, error: 'invalid' };
    const code = generateOtp();
    setPending({ kind: 'login', userId: acc.id, email: acc.email, phone: acc.phone, code });
    // eslint-disable-next-line no-console
    console.info('[demo OTP]', code);
    return { ok: true };
  }, []);

  const startRegister = React.useCallback((payload: RegisterPayload): FlowResult => {
    const res = registerAccount(payload);
    if (!res.ok || !res.userId) return { ok: false, error: res.error };
    const code = generateOtp();
    setPending({ kind: 'register', userId: res.userId, email: payload.email, phone: payload.phone, code });
    // eslint-disable-next-line no-console
    console.info('[demo OTP]', code);
    return { ok: true };
  }, []);

  const verifyOtp = React.useCallback(
    (code: string): FlowResult => {
      if (!pending) return { ok: false, error: 'expired' };
      if (code.trim() !== pending.code) return { ok: false, error: 'otp' };

      if (pending.kind === 'register') {
        activateAccount(pending.userId);
        setPending(null);
        return { ok: true };
      }

      const acc = getAccountUser(pending.userId);
      setPending(null);
      if (!acc) return { ok: false, error: 'expired' };
      setUser(acc);
      persistSession(acc);
      return { ok: true };
    },
    [pending],
  );

  const resendOtp = React.useCallback(() => {
    setPending((prev) => {
      if (!prev) return prev;
      const code = generateOtp();
      // eslint-disable-next-line no-console
      console.info('[demo OTP]', code);
      return { ...prev, code };
    });
  }, []);

  const cancelPending = React.useCallback(() => setPending(null), []);

  const logout = React.useCallback(() => {
    setUser(null);
    setPending(null);
    persistSession(null);
  }, []);

  const value = React.useMemo(
    () => ({ user, pending, startLogin, startRegister, verifyOtp, resendOtp, cancelPending, logout }),
    [user, pending, startLogin, startRegister, verifyOtp, resendOtp, cancelPending, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider içinde kullanılmalı');
  return ctx;
}

/** RoleProvider gibi opsiyonel tüketiciler için — provider yoksa null. */
export function useOptionalAuth(): AuthContextValue | null {
  return React.useContext(AuthContext);
}

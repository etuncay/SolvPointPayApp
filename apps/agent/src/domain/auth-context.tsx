/* ──────────────────────────────────────────────────────
 *  AuthProvider — oturum + OTP akış durumu.
 *  Mock: sessionStorage + demo OTP. HTTP: HttpOnly cookie, RBAC sunucuda.
 * ────────────────────────────────────────────────────── */
import * as React from 'react';
import {
  authApi,
  getActiveDataDriver,
  type AuthErrorCode,
  type AuthUser,
  type RegisterPayload,
} from '@epay/data';
import { APP_SESSION_KEY } from '@/config/app';

type OtpKind = 'login' | 'register';

interface PendingOtp {
  kind: OtpKind;
  userId: string;
  email: string;
  phone: string;
  demoCode?: string;
}

export interface FlowResult {
  ok: boolean;
  error?: AuthErrorCode | 'otp' | 'expired';
}

interface AuthContextValue {
  user: AuthUser | null;
  pending: PendingOtp | null;
  startLogin: (email: string, password: string) => Promise<FlowResult>;
  startRegister: (payload: RegisterPayload) => Promise<FlowResult>;
  verifyOtp: (code: string) => Promise<FlowResult>;
  resendOtp: () => Promise<void>;
  cancelPending: () => void;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

function isHttpAuth(): boolean {
  return getActiveDataDriver() === 'http';
}

function loadMockSession(): AuthUser | null {
  try {
    if (sessionStorage.getItem('epay-session-revoked') === '1') {
      sessionStorage.removeItem('epay-session-revoked');
      sessionStorage.removeItem(APP_SESSION_KEY);
      return null;
    }
    const raw = sessionStorage.getItem(APP_SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function persistMockSession(user: AuthUser | null): void {
  if (isHttpAuth()) return;
  try {
    if (user) sessionStorage.setItem(APP_SESSION_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(APP_SESSION_KEY);
  } catch {
    /* private mode */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(() =>
    isHttpAuth() ? null : loadMockSession(),
  );
  const [pending, setPending] = React.useState<PendingOtp | null>(null);

  React.useEffect(() => {
    if (!isHttpAuth()) return;
    void authApi.getSessionUser().then((sessionUser) => {
      if (sessionUser) setUser(sessionUser);
    });
  }, []);

  const startLogin = React.useCallback(async (email: string, password: string): Promise<FlowResult> => {
    const res = await authApi.authenticate(email, password);
    if (!res.ok) return { ok: false, error: res.error };

    if (res.user) {
      setUser(res.user);
      persistMockSession(res.user);
      return { ok: true };
    }

    if (!res.userId) return { ok: false, error: 'invalid' };
    const acc = await authApi.getAccountUser(res.userId);
    setPending({
      kind: 'login',
      userId: res.userId,
      email: acc?.email ?? email.trim(),
      phone: acc?.phone ?? '',
      demoCode: res.demoOtp,
    });
    return { ok: true };
  }, []);

  const startRegister = React.useCallback(async (payload: RegisterPayload): Promise<FlowResult> => {
    const res = await authApi.registerAccount(payload);
    if (!res.ok) return { ok: false, error: res.error };
    if (!res.userId) return { ok: false, error: 'invalid' };
    setPending({
      kind: 'register',
      userId: res.userId,
      email: payload.email,
      phone: payload.phone,
      demoCode: res.demoOtp,
    });
    return { ok: true };
  }, []);

  const verifyOtp = React.useCallback(
    async (code: string): Promise<FlowResult> => {
      if (!pending) return { ok: false, error: 'expired' };
      const r = await authApi.verifyOtp(pending.userId, code, pending.kind);
      if (!r.ok) return { ok: false, error: r.error };

      if (pending.kind === 'register') {
        setPending(null);
        return { ok: true };
      }

      setPending(null);
      if (!r.user) return { ok: false, error: 'expired' };
      setUser(r.user);
      persistMockSession(r.user);
      return { ok: true };
    },
    [pending],
  );

  const resendOtp = React.useCallback(async () => {
    if (!pending) return;
    const r = await authApi.resendOtp(pending.userId, pending.kind);
    if (!r.ok) return;
    setPending((prev) => (prev ? { ...prev, demoCode: r.demoOtp ?? prev.demoCode } : prev));
  }, [pending]);

  const cancelPending = React.useCallback(() => setPending(null), []);

  const logout = React.useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setPending(null);
    persistMockSession(null);
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

export function useOptionalAuth(): AuthContextValue | null {
  return React.useContext(AuthContext);
}

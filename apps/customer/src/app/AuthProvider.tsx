import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { customerPortalApi, getActiveDataDriver, type CustomerProfile } from '@epay/data';
import {
  CUSTOMER_AUTH_SESSION_KEY,
  CUSTOMER_LOGIN_IDENTITY_KEY,
} from '@/config/auth-keys';

interface AuthContextValue {
  authed: boolean;
  bootstrapping: boolean;
  profile: CustomerProfile | null;
  pendingOtp: boolean;
  pendingProfile: CustomerProfile | null;
  login: (identity: string, password: string, taxNo?: string) => Promise<string | null>;
  verifyOtp: (otp: string) => Promise<string | null>;
  logout: () => Promise<void>;
  revokeSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isHttpAuth(): boolean {
  return getActiveDataDriver() === 'http';
}

function loadMockAuthed(): boolean {
  return sessionStorage.getItem(CUSTOMER_AUTH_SESSION_KEY) === '1';
}

function persistMockAuthed(authed: boolean): void {
  if (isHttpAuth()) return;
  if (authed) sessionStorage.setItem(CUSTOMER_AUTH_SESSION_KEY, '1');
  else sessionStorage.removeItem(CUSTOMER_AUTH_SESSION_KEY);
}

function persistMockIdentity(identity: string): void {
  if (isHttpAuth()) return;
  if (identity) sessionStorage.setItem(CUSTOMER_LOGIN_IDENTITY_KEY, identity);
  else sessionStorage.removeItem(CUSTOMER_LOGIN_IDENTITY_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [bootstrapping, setBootstrapping] = useState(() => isHttpAuth());
  const [authed, setAuthed] = useState(() => (isHttpAuth() ? false : loadMockAuthed()));
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [pendingOtp, setPendingOtp] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<CustomerProfile | null>(null);
  const [identity, setIdentity] = useState(
    () => (isHttpAuth() ? '' : sessionStorage.getItem(CUSTOMER_LOGIN_IDENTITY_KEY) ?? ''),
  );

  useEffect(() => {
    if (!isHttpAuth()) return;
    void customerPortalApi
      .getSessionProfile()
      .then((sessionProfile) => {
        if (sessionProfile) {
          setProfile(sessionProfile);
          setAuthed(true);
        }
      })
      .finally(() => setBootstrapping(false));
  }, []);

  useEffect(() => {
    if (isHttpAuth() || !authed || profile) return;
    void customerPortalApi
      .getProfile()
      .then((p) => {
        if (p) setProfile(p);
        else {
          persistMockAuthed(false);
          setAuthed(false);
        }
      })
      .catch(() => {
        persistMockAuthed(false);
        setAuthed(false);
      });
  }, [authed, profile]);

  const login = useCallback(async (id: string, password: string, taxNo?: string) => {
    const res = await customerPortalApi.login({ identity: id, password, taxNo });
    if (!res.ok) {
      if (res.errorCode === 'no_persistent_wallet') {
        return 'Yalnızca kalıcı cüzdanı olan müşteriler giriş yapabilir.';
      }
      return 'Kimlik bilgileri hatalı.';
    }
    setIdentity(id);
    persistMockIdentity(id);
    setPendingProfile(res.profile ?? null);
    setPendingOtp(true);
    return null;
  }, []);

  const verifyOtp = useCallback(
    async (otp: string) => {
      const id = identity || (!isHttpAuth() ? sessionStorage.getItem(CUSTOMER_LOGIN_IDENTITY_KEY) : null) || '';
      const res = await customerPortalApi.verifyOtp({ identity: id, otp });
      if (!res.ok || !res.profile) return 'OTP hatalı.';
      setProfile(res.profile);
      setAuthed(true);
      setPendingOtp(false);
      setPendingProfile(null);
      persistMockAuthed(true);
      return null;
    },
    [identity],
  );

  const logout = useCallback(async () => {
    await customerPortalApi.logout().catch(() => undefined);
    await customerPortalApi.clearPendingTransfer().catch(() => undefined);
    setAuthed(false);
    setProfile(null);
    setPendingOtp(false);
    setPendingProfile(null);
    setIdentity('');
    persistMockIdentity('');
    persistMockAuthed(false);
  }, []);

  const revokeSession = useCallback(async () => {
    await logout();
  }, [logout]);

  const value = useMemo(
    () => ({
      authed,
      bootstrapping,
      profile,
      pendingOtp,
      pendingProfile,
      login,
      verifyOtp,
      logout,
      revokeSession,
    }),
    [authed, bootstrapping, profile, pendingOtp, pendingProfile, login, verifyOtp, logout, revokeSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider içinde kullanılmalı');
  return ctx;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { customerPortalApi, type CustomerProfile } from '@epay/data';

interface AuthContextValue {
  authed: boolean;
  profile: CustomerProfile | null;
  pendingOtp: boolean;
  login: (identity: string, password: string, taxNo?: string) => Promise<string | null>;
  verifyOtp: (otp: string) => Promise<string | null>;
  logout: () => void;
  revokeSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const IDENTITY_KEY = 'epay-customer-login-identity';
const AUTHED_KEY = 'epay-customer-authed';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTHED_KEY) === '1');
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [pendingOtp, setPendingOtp] = useState(false);
  const [identity, setIdentity] = useState(() => sessionStorage.getItem(IDENTITY_KEY) ?? '');

  useEffect(() => {
    if (authed && !profile) {
      void customerPortalApi.getProfile().then(setProfile).catch(() => undefined);
    }
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
    sessionStorage.setItem(IDENTITY_KEY, id);
    setPendingOtp(true);
    return null;
  }, []);

  const verifyOtp = useCallback(
    async (otp: string) => {
      const id = identity || sessionStorage.getItem(IDENTITY_KEY) || '';
      const res = await customerPortalApi.verifyOtp({ identity: id, otp });
      if (!res.ok || !res.profile) return 'OTP hatalı.';
      setProfile(res.profile);
      setAuthed(true);
      setPendingOtp(false);
      sessionStorage.setItem(AUTHED_KEY, '1');
      return null;
    },
    [identity],
  );

  const logout = useCallback(() => {
    setAuthed(false);
    setProfile(null);
    setPendingOtp(false);
    setIdentity('');
    sessionStorage.removeItem(IDENTITY_KEY);
    sessionStorage.removeItem(AUTHED_KEY);
  }, []);

  const revokeSession = useCallback(() => {
    logout();
  }, [logout]);

  const value = useMemo(
    () => ({ authed, profile, pendingOtp, login, verifyOtp, logout, revokeSession }),
    [authed, profile, pendingOtp, login, verifyOtp, logout, revokeSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider içinde kullanılmalı');
  return ctx;
}

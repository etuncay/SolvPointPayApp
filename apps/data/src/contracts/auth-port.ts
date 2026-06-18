import type { AuthOtpResult, AuthResult, AuthUser, RegisterPayload } from '../types/auth';

/**
 * BackOffice kimlik doğrulama yüzeyi.
 * Mock: sessionStorage + istemci OTP. HTTP: HttpOnly cookie / JWT (sunucu RBAC).
 */
export interface AuthPort {
  /** HttpOnly cookie veya bearer ile mevcut oturum */
  getSessionUser(): Promise<AuthUser | null>;
  authenticate(email: string, password: string): Promise<AuthResult>;
  verifyOtp(userId: string, code: string, kind: 'login' | 'register'): Promise<AuthOtpResult>;
  getAccountUser(userId: string): Promise<AuthUser | undefined>;
  registerAccount(payload: RegisterPayload): Promise<AuthResult>;
  activateAccount(userId: string): Promise<void>;
  resendOtp(userId: string, kind: 'login' | 'register'): Promise<{ ok: boolean; demoOtp?: string }>;
  logout(): Promise<void>;
}

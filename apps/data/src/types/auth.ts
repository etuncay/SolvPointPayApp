/** BackOffice oturum rolleri — @epay/ui BackOfficeRole ile uyumlu */
export type BackOfficeRole = 'ops' | 'finance' | 'compliance' | 'management' | 'alltest';

/** Oturumda tutulan kullanıcı özeti (parola yok) */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: BackOfficeRole;
}

/** Mock hesap kaydı — seed + kayıt akışı */
export interface AuthAccountRecord extends AuthUser {
  password: string;
  status: 'active' | 'pending';
}

export type AuthErrorCode = 'invalid' | 'inactive' | 'exists' | 'registration_disabled';

export interface AuthResult {
  ok: boolean;
  error?: AuthErrorCode;
  userId?: string;
  /** Sunucu OTP adımı gerektiriyor (HttpOnly oturum henüz yok) */
  requiresOtp?: boolean;
  /** OTP olmadan tamamlanan giriş (nadir; mock) */
  user?: AuthUser;
  /** Demo modda OTP ipucu (production HTTP yanıtında olmamalı) */
  demoOtp?: string;
}

export interface AuthOtpResult {
  ok: boolean;
  error?: AuthErrorCode | 'otp' | 'expired';
  user?: AuthUser;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: BackOfficeRole;
}

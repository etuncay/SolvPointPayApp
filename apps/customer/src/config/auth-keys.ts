/** Oturum — mock: OTP sonrası `sessionStorage`; production: HttpOnly cookie + `GET /auth/me`. */
export const CUSTOMER_AUTH_SESSION_KEY = 'epay-customer-authed';

export const CUSTOMER_LOGIN_IDENTITY_KEY = 'epay-customer-login-identity';

/** Mock seed müşteri — `apps/data/src/db/seed-customer-portal.ts` */
export const DEMO_CUSTOMER_IDENTITY = 'CUS-4827193';

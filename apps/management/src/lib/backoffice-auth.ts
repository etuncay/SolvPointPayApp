import { isBackOfficeRegisterEnabled } from '@epay/data';

/** Production'da varsayılan kapalı; demo'da açık. VITE_ALLOW_REGISTER ile geçersiz kılınır. */
export function isRegisterEnabled(): boolean {
  return isBackOfficeRegisterEnabled({
    production: import.meta.env.PROD,
    allowRegisterEnv: import.meta.env.VITE_ALLOW_REGISTER,
  });
}

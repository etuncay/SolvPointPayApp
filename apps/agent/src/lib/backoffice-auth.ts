import { isBackOfficeRegisterEnabled } from '@epay/data';

export function isRegisterEnabled(): boolean {
  return isBackOfficeRegisterEnabled({
    production: import.meta.env.PROD,
    allowRegisterEnv: import.meta.env.VITE_ALLOW_REGISTER,
  });
}

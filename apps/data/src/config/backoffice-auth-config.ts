/**
 * BackOffice kayıt ve ortam bayrakları.
 * Production'da varsayılan: kayıt kapalı (sunucu invite-only).
 */
export function isBackOfficeRegisterEnabled(opts: {
  production: boolean;
  /** import.meta.env.VITE_ALLOW_REGISTER */
  allowRegisterEnv?: string;
}): boolean {
  const flag = opts.allowRegisterEnv?.trim().toLowerCase();
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return !opts.production;
}

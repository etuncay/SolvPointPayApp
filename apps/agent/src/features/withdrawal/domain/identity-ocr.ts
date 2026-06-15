/** Mock OCR karşılaştırması — kimlik no '0000' içeriyorsa düşük kalite/eşleşmeme. */
export function runIdentityOcrCompare(idNo: string): { ok: boolean; message?: string } {
  if (idNo.includes('0000')) {
    return { ok: false, message: 'ag_wd_err_ocr_mismatch' };
  }
  return { ok: true };
}

/** TUR uyruğunda kimlik tipi IdentityCard olarak kilitlenir. */
export function isIdentityTypeLocked(country: string): boolean {
  return country === 'TUR';
}

/** Mock OCR — TCKN içinde 0000 ise eşleşmeme. */
export function runIdentityOcrCompare(idNo: string): { ok: boolean; message?: string } {
  if (idNo.includes('0000')) {
    return { ok: false, message: 'ag_tr_err_ocr_mismatch' };
  }
  return { ok: true };
}

export function isIdentityTypeLocked(country: string): boolean {
  return country === 'TUR';
}

/** IBAN normalize + basit mod-97 doğrulama. */
export function normalizeIban(iban: string): string {
  return iban.replace(/\s/g, '').toUpperCase();
}

export function getIbanCountry(iban: string): string {
  return normalizeIban(iban).slice(0, 2);
}

export function isValidIban(iban: string): boolean {
  const clean = normalizeIban(iban);
  if (!/^[A-Z]{2}[0-9A-Z]{13,32}$/.test(clean)) return false;
  const rearranged = clean.slice(4) + clean.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = Number(String(remainder) + numeric.slice(i, i + 7)) % 97;
  }
  return remainder === 1;
}

export function shouldRedirectToAbroad(iban: string): boolean {
  const cc = getIbanCountry(iban);
  return cc.length === 2 && cc !== 'TR';
}

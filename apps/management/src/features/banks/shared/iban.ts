/** IBAN normalize — boşluk kaldır, büyük harf */
export function normalizeIban(raw: string): string {
  return raw.replace(/\s/g, '').toUpperCase();
}

function charToDigits(char: string): string {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) return String(code - 55);
  return char;
}

/** ISO 13616 MOD-97 checksum */
function mod97(ibanRearranged: string): number {
  let remainder = 0;
  for (let i = 0; i < ibanRearranged.length; i++) {
    const chunk = String(remainder) + ibanRearranged[i]!;
    remainder = Number(BigInt(chunk) % 97n);
  }
  return remainder;
}

/** Genel IBAN (max 34) + TR format kontrolü */
export function isValidIban(raw: string): boolean {
  const iban = normalizeIban(raw);
  if (iban.length < 15 || iban.length > 34) return false;
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) return false;

  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = [...rearranged].map(charToDigits).join('');
  if (!/^\d+$/.test(numeric)) return false;

  if (mod97(numeric) !== 1) return false;

  if (iban.startsWith('TR')) {
    return iban.length === 26 && /^TR[0-9]{24}$/.test(iban);
  }

  return true;
}

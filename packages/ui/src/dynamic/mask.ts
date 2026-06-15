/* ──────────────────────────────────────────────────────
 *  Basit giriş maskesi.
 *  Token'lar:  #  → rakam,  A → harf,  * → alfanümerik
 *  Diğer tüm karakterler literal kabul edilir (otomatik eklenir).
 *  Örnek mask: '+90 (###) ### ## ##'  ·  '##.##.####'
 * ────────────────────────────────────────────────────── */

const isDigit = (c: string) => c >= '0' && c <= '9';
const isAlpha = (c: string) => /[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(c);

export function applyMask(raw: string, mask: string): string {
  if (!mask) return raw;
  const input = raw ?? '';
  let out = '';
  let ri = 0;

  for (let mi = 0; mi < mask.length && ri < input.length; mi++) {
    const token = mask[mi];

    if (token === '#' || token === 'A' || token === '*') {
      // İlgili türe uyan bir sonraki karakteri tüket.
      while (ri < input.length) {
        const c = input[ri++];
        const ok =
          token === '#' ? isDigit(c) : token === 'A' ? isAlpha(c) : isDigit(c) || isAlpha(c);
        if (ok) {
          out += c;
          break;
        }
      }
    } else {
      // Literal karakter — otomatik ekle, kullanıcı aynısını yazdıysa atla.
      out += token;
      if (input[ri] === token) ri++;
    }
  }

  return out;
}

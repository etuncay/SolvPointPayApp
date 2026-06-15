export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function flagify(c: string) {
  const A = 0x1f1e6;
  return String.fromCodePoint(...c.toUpperCase().split('').map((ch) => A + ch.charCodeAt(0) - 65));
}

export function fmtNumber(n: number, lang: string) {
  return new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US').format(n);
}

export function fmtMoney(n: number, lang: string) {
  return new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtAge(minutes: number, lang: string) {
  if (minutes < 60) return `${minutes}${lang === 'tr' ? 'dk' : 'm'}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return lang === 'tr' ? `${h}sa ${m}dk` : `${h}h ${m}m`;
}

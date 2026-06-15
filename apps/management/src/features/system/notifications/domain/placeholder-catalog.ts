/** İzinli şablon placeholder anahtarları */
export const ALLOWED_PLACEHOLDERS = [
  'kullanici_adi',
  'islem_no',
  'talep_no',
  'otp_kodu',
  'tutar',
  'para_birimi',
  'vaka_no',
  'is_adi',
  'konu',
  'tarih',
  'link',
] as const;

export type PlaceholderKey = (typeof ALLOWED_PLACEHOLDERS)[number];

const SET = new Set<string>(ALLOWED_PLACEHOLDERS);

export function isAllowedPlaceholder(key: string): boolean {
  return SET.has(key);
}

export function extractPlaceholders(content: string): string[] {
  const found = new Set<string>();
  const re = /\{([a-z0-9_]+)\}/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    found.add(m[1]!.toLowerCase());
  }
  return [...found];
}

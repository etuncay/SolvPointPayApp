export const COUNTRIES = [
  'Türkiye',
  'Almanya',
  'BAE',
  'İngiltere',
  'ABD',
  'Hollanda',
  'Fransa',
  'Suudi Arabistan',
] as const;

export type CountryName = (typeof COUNTRIES)[number];

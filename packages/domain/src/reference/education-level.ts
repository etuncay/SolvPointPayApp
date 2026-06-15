/** Veri Sözlüğü §3.3 — Eğitim Durumu kanonik kodları. */
export const EDUCATION_LEVELS = [
  'None',
  'Primary',
  'Secondary',
  'HighSchool',
  'Associate',
  'Bachelor',
  'Master',
  'Doctorate',
] as const;

export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export function educationLevelI18nKey(code: EducationLevel | string): string {
  return `education_level_${code}`;
}

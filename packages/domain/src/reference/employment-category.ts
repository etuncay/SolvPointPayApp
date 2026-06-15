/** Veri Sözlüğü §3.4 — Çalışma Durumu kanonik kodları. */
export const EMPLOYMENT_CATEGORIES = [
  'Employed',
  'SelfEmployed',
  'Employer',
  'Unemployed',
  'Student',
  'Retired',
  'Homemaker',
] as const;

export type EmploymentCategory = (typeof EMPLOYMENT_CATEGORIES)[number];

export function employmentCategoryI18nKey(code: EmploymentCategory | string): string {
  return `employment_category_${code}`;
}

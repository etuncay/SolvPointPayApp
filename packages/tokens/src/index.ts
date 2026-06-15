/** Tasarım token anahtarları — CSS değişken adlarıyla eşleşir */
export const tokenKeys = {
  bg: '--bg',
  bgElev: '--bg-elev',
  bgSunken: '--bg-sunken',
  accent: '--accent',
  fg: '--fg',
  line: '--line',
} as const;

export type ThemeMode = 'light' | 'dark';
export type Density = 'compact' | 'standard' | 'comfortable';
export type TextSize = 'small' | 'standard' | 'large' | 'xlarge';

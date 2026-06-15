import type { PasswordChangeFrequency } from '@/domain/user-preferences';
import type { UserPreference } from '@/features/dashboard/domain/types';

export type UserPreferenceRecord = UserPreference & {
  password_change_frequency: PasswordChangeFrequency;
};

/** Temsilci demo kullanıcısı (usr-agent) tercih seed'i. */
export const USER_PREFERENCES_SEED: UserPreferenceRecord[] = [
  {
    user_id: 'usr-agent',
    language: 'tr',
    theme: 'light',
    text_size: 'standard',
    welcome_message: 'Mavi köpekbalığı 🦈 — sadece sen bilirsin.',
    password_change_frequency: '3',
    updated_at: '2026-05-20T10:00:00Z',
    updated_by: 'system',
  },
];

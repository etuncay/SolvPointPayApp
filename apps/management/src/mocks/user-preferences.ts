import type { PasswordChangeFrequency } from '@/domain/user-preferences';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import type { UserPreference } from '@/features/dashboard/domain/types';

export type UserPreferenceRecord = UserPreference & {
  password_change_frequency: PasswordChangeFrequency;
};

export const USER_PREFERENCES_SEED: UserPreferenceRecord[] = [
  {
    user_id: MOCK_USER_IDS.ops,
    language: 'tr',
    theme: 'light',
    text_size: 'standard',
    welcome_message: 'Mavi köpekbalığı 🦈 — sadece sen bilirsin.',
    password_change_frequency: '3',
    updated_at: '2026-05-20T10:00:00Z',
    updated_by: 'system',
  },
  {
    user_id: MOCK_USER_IDS.compliance,
    language: 'tr',
    theme: 'dark',
    text_size: 'standard',
    welcome_message: 'Güvenli oturum — Ayşe.',
    password_change_frequency: '3',
    updated_at: '2026-05-20T10:00:00Z',
    updated_by: 'system',
  },
  {
    user_id: MOCK_USER_IDS.management,
    language: 'tr',
    theme: 'light',
    text_size: 'large',
    welcome_message: 'Yönetim paneli — Mehmet.',
    password_change_frequency: '6',
    updated_at: '2026-05-20T10:00:00Z',
    updated_by: 'system',
  },
  {
    user_id: MOCK_USER_IDS.finance,
    language: 'en',
    theme: 'light',
    text_size: 'standard',
    welcome_message: 'Blue shark 🦈 — only you know this.',
    password_change_frequency: '3',
    updated_at: '2026-05-20T10:00:00Z',
    updated_by: 'system',
  },
];

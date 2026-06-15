import {
  USER_PREFERENCES_SEED,
  type UserPreferenceRecord,
} from '@/mocks/user-preferences';
import {
  WELCOME_MESSAGE_PATTERN,
  type PasswordChangeFrequency,
  type UserPreferences,
} from '@/domain/user-preferences';

const STORAGE_KEY = 'epay-user-preferences';

export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  frequency: PasswordChangeFrequency;
};

export type ChangePasswordResult =
  | { ok: true; sessionRevoked: true }
  | { ok: false; error: string; field?: string };

function loadLocal(): Partial<UserPreferences> | null {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<UserPreferences>;
  } catch {
    return null;
  }
}

function persistLocal(value: UserPreferences): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* vitest/node ortamı */
  }
}

function markSessionRevoked(): void {
  try {
    globalThis.sessionStorage?.setItem('epay-session-revoked', '1');
  } catch {
    /* vitest/node ortamı */
  }
}

function seedFor(userId: string): UserPreferenceRecord | undefined {
  return USER_PREFERENCES_SEED.find((p) => p.user_id === userId);
}

function toUi(p: UserPreferenceRecord, local?: Partial<UserPreferences> | null): UserPreferences {
  return {
    welcomeMessage: local?.welcomeMessage ?? p.welcome_message,
    passwordChangeFrequency: local?.passwordChangeFrequency ?? p.password_change_frequency,
  };
}

export const mockUserPreferencesAdapter = {
  getPreferences(userId: string): UserPreferences {
    const seed = seedFor(userId);
    const local = loadLocal();
    if (!seed) {
      return {
        welcomeMessage: local?.welcomeMessage ?? '—',
        passwordChangeFrequency: local?.passwordChangeFrequency ?? '3',
      };
    }
    return toUi(seed, local);
  },

  updatePreferences(
    userId: string,
    draft: Partial<UserPreferences>,
  ): { ok: true } | { ok: false; error: string } {
    const current = this.getPreferences(userId);
    if (draft.welcomeMessage != null) {
      const trimmed = draft.welcomeMessage.trim();
      if (!WELCOME_MESSAGE_PATTERN.test(trimmed)) {
        return { ok: false, error: 'invalid_welcome' };
      }
      current.welcomeMessage = trimmed;
    }
    if (draft.passwordChangeFrequency != null) {
      current.passwordChangeFrequency = draft.passwordChangeFrequency;
    }
    persistLocal(current);
    return { ok: true };
  },

  changePassword(userId: string, payload: ChangePasswordPayload): ChangePasswordResult {
    if (payload.newPassword !== payload.confirmPassword) {
      return { ok: false, error: 'pw_mismatch', field: 'confirmPassword' };
    }
    if (payload.newPassword === payload.oldPassword) {
      return { ok: false, error: 'pw_same', field: 'newPassword' };
    }
    const policy =
      payload.newPassword.length >= 12 &&
      /[A-Z]/.test(payload.newPassword) &&
      /[a-z]/.test(payload.newPassword) &&
      /[0-9]/.test(payload.newPassword) &&
      /[^A-Za-z0-9]/.test(payload.newPassword);
    if (!policy) {
      return { ok: false, error: 'pw_weak', field: 'newPassword' };
    }
    const current = this.getPreferences(userId);
    persistLocal({ ...current, passwordChangeFrequency: payload.frequency });
    markSessionRevoked();
    return { ok: true, sessionRevoked: true };
  },
};

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DynamicForm,
  DynamicTable,
  FormMode,
  type AppLanguage,
  useThemeSettings,
} from '@epay/ui';
import {
  useUserPreferences,
  WELCOME_MESSAGE_PATTERN,
  type PasswordChangeFrequency,
} from '@/domain/user-preferences';
import { dashboardService } from '@/features/dashboard/api/dashboard-service';
import { mockUserPreferencesAdapter } from '@/features/dashboard/api/mock-user-preferences-adapter';
import { useRole } from '@/domain/role-context';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import type { FailedLoginRow } from '@/features/dashboard/domain/types';
import type { SettingsTab } from '@/domain/settings-context';
import {
  buildAppPreferencesFormConfig,
  buildPasswordChangeFormConfig,
  buildWelcomeMessageFormConfig,
} from '@/features/settings/settings-form-config';
import { buildFailedLoginsTableConfig } from '@/features/settings/settings-table-config';

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(12)
      .regex(/[A-Z]/, 'pw_weak')
      .regex(/[a-z]/, 'pw_weak')
      .regex(/[0-9]/, 'pw_weak')
      .regex(/[^A-Za-z0-9]/, 'pw_weak'),
    confirmPassword: z.string().min(1),
    frequency: z.enum(['1', '3', '6']),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'pw_mismatch',
    path: ['confirmPassword'],
  })
  .refine((d) => d.newPassword !== d.oldPassword, {
    message: 'pw_same',
    path: ['newPassword'],
  });

export function SettingsDrawer({
  open,
  onClose,
  initialTab = 'app',
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}) {
  const { t, i18n } = useTranslation();
  const { role } = useRole();
  const userId = getCurrentUser(role).id;
  const { lang, setLang, theme, setTheme, textSize, setTextSize } = useThemeSettings();
  const { preferences, saveWelcomeMessage, setPasswordChangeFrequency } = useUserPreferences();
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [failedLogins, setFailedLogins] = useState<FailedLoginRow[]>([]);
  const [failedLoading, setFailedLoading] = useState(false);
  const [passwordKey, setPasswordKey] = useState(0);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (open && tab === 'failed') {
      setFailedLoading(true);
      void dashboardService.getFailedLogins().then((rows) => {
        setFailedLogins(rows);
        setFailedLoading(false);
      });
    }
  }, [open, tab]);

  const passwordFormConfig = buildPasswordChangeFormConfig(translate);
  const welcomeFormConfig = buildWelcomeMessageFormConfig(translate);
  const appFormConfig = buildAppPreferencesFormConfig(translate);
  const failedLoginsConfig = buildFailedLoginsTableConfig(failedLogins, translate);

  const onSaveApp = () => {
    mockUserPreferencesAdapter.updatePreferences(userId, {
      passwordChangeFrequency: preferences.passwordChangeFrequency,
    });
    toast.success(t('rs_saved'));
  };

  const onPasswordSubmit = (values: Record<string, unknown>) => {
    const parsed = passwordSchema.safeParse(values);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      toast.error(t(String(issue?.message ?? 'pw_policy')));
      return;
    }
    const data = parsed.data;
    const result = mockUserPreferencesAdapter.changePassword(userId, {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
      frequency: data.frequency,
    });
    if (!result.ok) {
      toast.error(t(String(result.error)));
      return;
    }
    setPasswordChangeFrequency(data.frequency);
    toast.success(t('pw_changed_demo'));
    setPasswordKey((k) => k + 1);
    window.setTimeout(() => window.location.reload(), 600);
  };

  const tabs: SettingsTab[] = ['password', 'welcome', 'app', 'failed'];

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <h2>{t('settings')}</h2>
          <DrawerCloseButton onClick={onClose} />
        </DrawerHeader>
        <div className="drawer-tabs">
          {tabs.map((id) => (
            <button
              key={id}
              type="button"
              className={`drawer-tab ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              {t(`s_tab_${id === 'app' ? 'prefs' : id}`)}
            </button>
          ))}
        </div>
        <DrawerBody>
          {tab === 'password' && (
            <>
              <p className="t-mute" style={{ fontSize: 12, marginBottom: 12 }}>
                {t('s_revoke_warn')}
              </p>
              <span className="t-mute" style={{ fontSize: 11, display: 'block', marginBottom: 12 }}>
                {t('s_pw_freq_hint')}
              </span>
              <DynamicForm
                key={passwordKey}
                config={passwordFormConfig}
                mode={FormMode.Create}
                permissions={{ create: true }}
                initialValues={{ frequency: preferences.passwordChangeFrequency }}
                t={translate}
                onButtonClick={(key, values) => {
                  if (key === 'submit') onPasswordSubmit(values);
                }}
              />
            </>
          )}

          {tab === 'welcome' && (
            <DynamicForm
              config={welcomeFormConfig}
              mode={FormMode.Update}
              permissions={{ update: true }}
              initialValues={{ welcomeMessage: preferences.welcomeMessage }}
              t={translate}
              onButtonClick={(key, values) => {
                if (key !== 'save') return;
                const message = String(values.welcomeMessage ?? '');
                if (!WELCOME_MESSAGE_PATTERN.test(message.trim()) && message.length > 0) {
                  toast.error(t('welcome_invalid'));
                  return;
                }
                const result = saveWelcomeMessage(message);
                if (!result.ok) {
                  toast.error(t('welcome_invalid'));
                  return;
                }
                toast.success(t('rs_saved'));
              }}
            />
          )}

          {tab === 'app' && (
            <DynamicForm
              config={appFormConfig}
              mode={FormMode.Update}
              permissions={{ update: true }}
              initialValues={{ lang, theme, textSize }}
              t={translate}
              onButtonClick={(key, values) => {
                if (key !== 'save') return;
                setLang(values.lang as AppLanguage);
                setTheme(values.theme as 'light' | 'dark');
                setTextSize(values.textSize as 'small' | 'standard' | 'large' | 'xlarge');
                onSaveApp();
              }}
            />
          )}

          {tab === 'failed' && (
            <div>
              <p className="t-mute" style={{ fontSize: 12.5, marginBottom: 12 }}>
                {t('s_failed_intro')}
              </p>
              {failedLoading ? (
                <p className="t-mute">{t('loading')}</p>
              ) : (
                <DynamicTable
                  config={failedLoginsConfig}
                  permissions={{}}
                  customFunctions={{}}
                  locale={i18n.language}
                  t={translate}
                />
              )}
            </div>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
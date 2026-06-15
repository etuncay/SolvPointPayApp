import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { customerPortalApi, DEMO_CUSTOMER_PASSWORD } from '@epay/data';
import type { CustomerSettings } from '@epay/data';
import { useThemeSettings, type TextSize, type ThemeMode } from '@/app/ThemeProvider';
import { useAuth } from '@/app/AuthProvider';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Icon, type IconName } from '@/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import type { AppLanguage } from '@/lib/locale';
import { fmtMoney } from '@/lib/format';
import {
  EDUCATION_LEVELS,
  educationLevelI18nKey,
  EMPLOYMENT_CATEGORIES,
  employmentCategoryI18nKey,
} from '@/lib/enums';
import { ContactsSection } from './ContactsSection';

type SettingsSection =
  | 'profile'
  | 'security'
  | 'contact'
  | 'limits'
  | 'notif'
  | 'app'
  | 'receipts';

const NAV: { key: SettingsSection; icon: IconName; labelKey: string }[] = [
  { key: 'profile', icon: 'user', labelKey: 'settings_nav_profile' },
  { key: 'security', icon: 'lock', labelKey: 'settings_nav_security' },
  { key: 'contact', icon: 'mail', labelKey: 'settings_nav_contact' },
  { key: 'limits', icon: 'shield', labelKey: 'settings_nav_limits' },
  { key: 'notif', icon: 'bell', labelKey: 'settings_nav_notif' },
  { key: 'app', icon: 'settings', labelKey: 'settings_nav_app' },
  { key: 'receipts', icon: 'receipt', labelKey: 'settings_nav_receipts' },
];

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function formatThousands(n: number): string {
  if (!n) return '';
  return n.toLocaleString('tr-TR');
}

function SettingsCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <div className="card card-pad settings-card">
      <div className="settings-card-head">
        <h3 className="card-title">{title}</h3>
        {desc ? <p className="settings-card-desc">{desc}</p> : null}
      </div>
      {children}
    </div>
  );
}

function PrefRow({
  icon,
  title,
  desc,
  children,
}: {
  icon?: IconName;
  title: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <div className="settings-pref-row">
      {icon ? (
        <span className="settings-pref-icon">
          <Icon name={icon} style={{ width: 18, height: 18 }} />
        </span>
      ) : null}
      <div className="settings-pref-body">
        <div className="settings-pref-title">{title}</div>
        {desc ? <div className="settings-pref-desc">{desc}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className={`settings-toggle ${on ? 'is-on' : ''}`}
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
    >
      <span className="settings-toggle-knob" />
    </button>
  );
}

function SegmentGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; icon?: IconName }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="settings-segment">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`settings-segment-btn ${value === opt.value ? 'is-active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon ? <Icon name={opt.icon} style={{ width: 15, height: 15 }} /> : null}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const { theme, setTheme, textSize, setTextSize, lang, setLang } = useThemeSettings();
  const { profile, revokeSession } = useAuth();
  const qc = useQueryClient();
  const [section, setSection] = useState<SettingsSection>('profile');
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => customerPortalApi.getSettings(),
  });

  const { data: txPage } = useQuery({
    queryKey: ['transactions', 'receipts'],
    queryFn: () => customerPortalApi.listTransactions({ page: 1, pageSize: 50 }),
    enabled: section === 'receipts',
  });

  const completedTx = useMemo(
    () => (txPage?.items ?? []).filter((tx) => tx.status === 'Completed'),
    [txPage],
  );

  const [welcome, setWelcome] = useState('');
  const [dailyStr, setDailyStr] = useState('');
  const [internetStr, setInternetStr] = useState('');
  const [monthlyIncomeStr, setMonthlyIncomeStr] = useState('');
  const [education, setEducation] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [profession, setProfession] = useState('');
  const [employer, setEmployer] = useState('');
  const [notifyIn, setNotifyIn] = useState(true);
  const [notifyOut, setNotifyOut] = useState(true);
  const [notifyLow, setNotifyLow] = useState(false);
  const [lowThresholdStr, setLowThresholdStr] = useState('');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    setWelcome(settings.welcomeMessage);
    setDailyStr(formatThousands(settings.dailyLimit));
    setInternetStr(formatThousands(settings.internetDailyLimit ?? 0));
    setMonthlyIncomeStr(formatThousands(settings.monthlyIncome ?? 0));
    setEducation(settings.education ?? '');
    setEmploymentStatus(settings.employmentStatus ?? '');
    setProfession(settings.profession ?? '');
    setEmployer(settings.employer ?? '');
    setNotifyIn(settings.notifyMoneyIn ?? settings.pushNotify);
    setNotifyOut(settings.notifyMoneyOut ?? true);
    setNotifyLow(settings.notifyLowBalance ?? false);
    setLowThresholdStr(formatThousands(settings.lowBalanceThreshold ?? 1000));
  }, [settings]);

  async function saveSettings(patch: Partial<CustomerSettings>) {
    await customerPortalApi.updateSettings(patch);
    await qc.invalidateQueries({ queryKey: ['settings'] });
    setSavedFlash(t('settings_saved'));
    window.setTimeout(() => setSavedFlash(null), 2400);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPw !== newPw2) {
      setPwMsg(t('settings_pw_mismatch'));
      return;
    }
    const res = await customerPortalApi.changePassword(currentPw, newPw);
    if (!res.ok) {
      setPwMsg(t('settings_pw_fail'));
      return;
    }
    setPwMsg(t('settings_pw_success'));
    window.setTimeout(() => revokeSession(), 1500);
  }

  function parseLimit(str: string): number {
    return Number(digitsOnly(str)) || 0;
  }

  const educationOptions = EDUCATION_LEVELS.map((code) => ({
    value: code,
    label: t(educationLevelI18nKey(code)),
  }));

  const employmentOptions = EMPLOYMENT_CATEGORIES.map((code) => ({
    value: code,
    label: t(employmentCategoryI18nKey(code)),
  }));

  return (
    <div className="page settings-page">
      <div className="container">
        <div className="page-head">
          <div>
            <div className="eyebrow">{t('settings_eyebrow')}</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>
              {t('settings_title')}
            </h1>
          </div>
        </div>

        {savedFlash ? (
          <div style={{ marginBottom: 16 }}>
            <AlertBanner tone="info" icon="check">
              {savedFlash}
            </AlertBanner>
          </div>
        ) : null}

        <div className="settings-layout">
          <nav className="card settings-nav" aria-label={t('settings_title')}>
            {NAV.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`settings-nav-btn ${section === item.key ? 'is-active' : ''}`}
                onClick={() => setSection(item.key)}
              >
                <Icon name={item.icon} style={{ width: 18, height: 18 }} />
                {t(item.labelKey)}
              </button>
            ))}
          </nav>

          <div>
            {section === 'profile' && profile && (
              <>
                <div className="card card-pad settings-profile-summary">
                  <span className="avatar">{profile.initials}</span>
                  <div>
                    <h3 className="settings-profile-name">{profile.name}</h3>
                    <div className="settings-profile-meta tnum">
                      {t('settings_customer_no')}: {profile.customerNo}
                    </div>
                    <span className="pill pill-completed settings-kyc-pill">
                      <Icon name="shield" style={{ width: 13, height: 13 }} />
                      {t('settings_kyc_badge')}
                    </span>
                  </div>
                </div>

                <SettingsCard title={t('settings_personal_title')} desc={t('settings_personal_desc')}>
                  <div className="form-grid">
                    <Field label={t('settings_monthly_income')}>
                      <div className="input-affix">
                        <span className="pre">₺</span>
                        <input
                          className="input tnum"
                          style={{ paddingLeft: 30 }}
                          value={monthlyIncomeStr}
                          onChange={(e) => setMonthlyIncomeStr(formatThousands(Number(digitsOnly(e.target.value))))}
                        />
                      </div>
                    </Field>
                    <Field label={t('settings_education')}>
                      <select
                        className="select"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                      >
                        {educationOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={t('settings_employment')}>
                      <select
                        className="select"
                        value={employmentStatus}
                        onChange={(e) => setEmploymentStatus(e.target.value)}
                      >
                        {employmentOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={t('settings_profession')}>
                      <input
                        className="input"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                      />
                    </Field>
                    <Field label={t('settings_employer')} full>
                      <input
                        className="input"
                        value={employer}
                        onChange={(e) => setEmployer(e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="settings-actions-end">
                    <Button
                      variant="primary"
                      onClick={() =>
                        saveSettings({
                          monthlyIncome: parseLimit(monthlyIncomeStr),
                          education,
                          employmentStatus,
                          profession,
                          employer,
                        })
                      }
                    >
                      <Icon name="check" /> {t('settings_save')}
                    </Button>
                  </div>
                </SettingsCard>
              </>
            )}

            {section === 'security' && (
              <>
                <SettingsCard title={t('settings_pw_title')} desc={t('settings_pw_desc')}>
                  <form className="settings-security-form" onSubmit={changePassword}>
                    <Field label={t('settings_pw_current')} required>
                      <input
                        type="password"
                        className="input"
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        autoComplete="current-password"
                      />
                    </Field>
                    <Field label={t('settings_pw_new')} required>
                      <input
                        type="password"
                        className="input"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        autoComplete="new-password"
                      />
                    </Field>
                    <Field label={t('settings_pw_repeat')} required>
                      <input
                        type="password"
                        className="input"
                        value={newPw2}
                        onChange={(e) => setNewPw2(e.target.value)}
                        autoComplete="new-password"
                      />
                    </Field>
                    <Field label={t('settings_pw_frequency')}>
                      <select className="select" defaultValue="1">
                        <option value="1">{t('settings_pw_freq_1m')}</option>
                        <option value="3">{t('settings_pw_freq_3m')}</option>
                        <option value="6">{t('settings_pw_freq_6m')}</option>
                      </select>
                    </Field>
                    {pwMsg ? <p className="hint">{pwMsg}</p> : null}
                    <p className="hint">
                      {t('settings_pw_demo_hint', { pw: DEMO_CUSTOMER_PASSWORD })}
                    </p>
                    <Button type="submit" variant="primary" style={{ alignSelf: 'flex-start' }}>
                      <Icon name="lock" /> {t('settings_pw_submit')}
                    </Button>
                  </form>
                </SettingsCard>

                <SettingsCard title={t('settings_welcome_title')} desc={t('settings_welcome_desc')}>
                  <div className="input-affix" style={{ maxWidth: 420 }}>
                    <span className="pre">
                      <Icon name="shield" style={{ width: 16, height: 16 }} />
                    </span>
                    <input
                      className="input"
                      style={{ paddingLeft: 38 }}
                      value={welcome}
                      onChange={(e) => setWelcome(e.target.value)}
                    />
                  </div>
                  <div className="settings-actions-end">
                    <Button variant="primary" onClick={() => saveSettings({ welcomeMessage: welcome })}>
                      <Icon name="check" /> {t('settings_save')}
                    </Button>
                  </div>
                </SettingsCard>

                {profile?.failedAttempt ? (
                  <SettingsCard title={t('settings_failed_logins')}>
                    <div className="settings-failed-row">
                      <span className="settings-failed-icon">
                        <Icon name="warn" style={{ width: 17, height: 17 }} />
                      </span>
                      <div style={{ flex: 1 }}>
                        <div className="tnum" style={{ fontWeight: 600, fontSize: 14 }}>
                          {profile.failedAttempt.when}
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                          {profile.failedAttempt.city} · {profile.failedAttempt.ip}
                        </div>
                      </div>
                      <span className="pill pill-error">{t('settings_failed_status')}</span>
                    </div>
                  </SettingsCard>
                ) : null}
              </>
            )}

            {section === 'contact' && (
              <>
                <ContactsSection />

                {settings ? (
                  <SettingsCard title={t('settings_addresses')}>
                    <PrefRow icon="home" title={t('settings_home_address')} desc={settings.address ?? '—'}>
                      <button type="button" className="icon-btn" aria-label={t('settings_edit_address')}>
                        <Icon name="edit" />
                      </button>
                    </PrefRow>
                    <div style={{ marginTop: 16 }}>
                      <button type="button" className="btn btn-ghost">
                        <Icon name="plus" /> {t('settings_add_address')}
                      </button>
                    </div>
                  </SettingsCard>
                ) : null}
              </>
            )}

            {section === 'limits' && settings && (
              <SettingsCard title={t('settings_limits_title')} desc={t('settings_limits_desc')}>
                <AlertBanner tone="info" icon="info">
                  {t('settings_limits_info', {
                    max: fmtMoney(settings.corporateDailyMax, '₺'),
                  })}
                </AlertBanner>
                <div className="form-grid" style={{ marginTop: 16 }}>
                  <Field label={t('settings_limit_daily')} hint={t('settings_limit_daily_hint')}>
                    <div className="input-affix">
                      <span className="pre">₺</span>
                      <input
                        className="input tnum"
                        style={{ paddingLeft: 30 }}
                        value={dailyStr}
                        onChange={(e) =>
                          setDailyStr(formatThousands(Number(digitsOnly(e.target.value))))
                        }
                      />
                    </div>
                  </Field>
                  <Field label={t('settings_limit_internet')} hint={t('settings_limit_internet_hint')}>
                    <div className="input-affix">
                      <span className="pre">₺</span>
                      <input
                        className="input tnum"
                        style={{ paddingLeft: 30 }}
                        value={internetStr}
                        onChange={(e) =>
                          setInternetStr(formatThousands(Number(digitsOnly(e.target.value))))
                        }
                      />
                    </div>
                  </Field>
                </div>
                <div className="settings-actions-end">
                  <Button
                    variant="primary"
                    onClick={() => {
                      const daily = Math.min(parseLimit(dailyStr), settings.corporateDailyMax);
                      const internet = Math.min(
                        parseLimit(internetStr),
                        settings.corporateDailyMax,
                      );
                      void saveSettings({ dailyLimit: daily, internetDailyLimit: internet });
                    }}
                  >
                    <Icon name="check" /> {t('settings_limits_submit')}
                  </Button>
                </div>
              </SettingsCard>
            )}

            {section === 'notif' && (
              <SettingsCard title={t('settings_notif_title')} desc={t('settings_notif_desc')}>
                <PrefRow icon="arrowDownLeft" title={t('settings_notif_in')} desc={t('settings_notif_in_desc')}>
                  <Toggle
                    on={notifyIn}
                    onChange={(v) => {
                      setNotifyIn(v);
                      void saveSettings({ notifyMoneyIn: v });
                    }}
                  />
                </PrefRow>
                <PrefRow icon="arrowUpRight" title={t('settings_notif_out')} desc={t('settings_notif_out_desc')}>
                  <Toggle
                    on={notifyOut}
                    onChange={(v) => {
                      setNotifyOut(v);
                      void saveSettings({ notifyMoneyOut: v });
                    }}
                  />
                </PrefRow>
                <PrefRow icon="wallet" title={t('settings_notif_low')} desc={t('settings_notif_low_desc')}>
                  <div className="settings-notif-threshold">
                    {notifyLow ? (
                      <div className="input-affix">
                        <span className="pre">₺</span>
                        <input
                          className="input tnum"
                          value={lowThresholdStr}
                          onChange={(e) =>
                            setLowThresholdStr(formatThousands(Number(digitsOnly(e.target.value))))
                          }
                          onBlur={() =>
                            saveSettings({
                              lowBalanceThreshold: parseLimit(lowThresholdStr),
                            })
                          }
                        />
                      </div>
                    ) : null}
                    <Toggle
                      on={notifyLow}
                      onChange={(v) => {
                        setNotifyLow(v);
                        void saveSettings({
                          notifyLowBalance: v,
                          lowBalanceThreshold: parseLimit(lowThresholdStr),
                        });
                      }}
                    />
                  </div>
                </PrefRow>
              </SettingsCard>
            )}

            {section === 'app' && (
              <SettingsCard title={t('settings_app_title')} desc={t('settings_app_desc')}>
                <PrefRow icon="globe" title={t('settings_app_lang')} desc={t('settings_app_lang_desc')}>
                  <select
                    className="select"
                    style={{ width: 160 }}
                    value={lang}
                    onChange={(e) => {
                      const l = e.target.value as AppLanguage;
                      setLang(l);
                      void saveSettings({ language: l });
                    }}
                  >
                    <option value="tr">{t('lang_tr')}</option>
                    <option value="en">{t('lang_en')}</option>
                    <option value="ar">{t('lang_ar')}</option>
                  </select>
                </PrefRow>
                <PrefRow
                  icon={theme === 'dark' ? 'moon' : 'sun'}
                  title={t('settings_app_theme')}
                  desc={t('settings_app_theme_desc')}
                >
                  <SegmentGroup<ThemeMode>
                    value={theme}
                    onChange={(k) => {
                      setTheme(k);
                      void saveSettings({ theme: k });
                    }}
                    options={[
                      { value: 'light', icon: 'sun', label: t('theme_light') },
                      { value: 'dark', icon: 'moon', label: t('theme_dark') },
                    ]}
                  />
                </PrefRow>
                <PrefRow icon="sparkle" title={t('settings_app_text')} desc={t('settings_app_text_desc')}>
                  <SegmentGroup<TextSize>
                    value={textSize}
                    onChange={(k) => {
                      setTextSize(k);
                      void saveSettings({ textSize: k });
                    }}
                    options={[
                      { value: 's', label: t('settings_text_s') },
                      { value: 'm', label: t('settings_text_m') },
                      { value: 'l', label: t('settings_text_l') },
                      { value: 'xl', label: t('settings_text_xl') },
                    ]}
                  />
                </PrefRow>
              </SettingsCard>
            )}

            {section === 'receipts' && (
              <SettingsCard title={t('settings_receipts_title')} desc={t('settings_receipts_desc')}>
                <div className="table-wrap settings-receipts-table" style={{ boxShadow: 'none' }}>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>{t('settings_receipts_col_id')}</th>
                        <th>{t('settings_receipts_col_date')}</th>
                        <th style={{ textAlign: 'right' }}>{t('settings_receipts_col_amount')}</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {completedTx.map((tx) => (
                        <tr key={tx.id} style={{ cursor: 'default' }}>
                          <td className="tnum">{tx.id}</td>
                          <td className="tnum">{tx.date}</td>
                          <td className="tnum" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--ink)' }}>
                            {fmtMoney(tx.amount, tx.symbol)}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button type="button" className="btn btn-soft" style={{ padding: '7px 14px' }}>
                              <Icon name="download" style={{ width: 15, height: 15 }} />{' '}
                              {t('settings_receipt_btn')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SettingsCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

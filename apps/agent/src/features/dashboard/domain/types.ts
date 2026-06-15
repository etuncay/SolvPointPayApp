/** Agent ayarları ve ana sayfa için kullanılan dashboard tipleri. */
export type UserPreference = {
  user_id: string;
  language: 'tr' | 'en' | 'ar';
  theme: 'light' | 'dark';
  text_size: 'small' | 'standard' | 'large' | 'xlarge';
  welcome_message: string;
  password_change_frequency: '1' | '3' | '6';
  updated_at: string;
  updated_by: string;
};

export type FailedLoginRow = {
  ip: string;
  loc: string;
  when: string;
  ua: string;
};

export type DashboardService = {
  getFailedLogins(): Promise<FailedLoginRow[]>;
};

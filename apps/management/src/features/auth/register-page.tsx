import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { Button, Field, Input, PasswordInput, Select, type BackOfficeRole } from '@epay/ui';
import { useAuth } from '@/domain/auth-context';
import { AuthLayout, AuthError, authButtonStyle } from './auth-layout';
import { OtpStep } from './otp-step';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ROLE_OPTS: BackOfficeRole[] = ['ops', 'finance', 'compliance', 'management'];

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  role: BackOfficeRole | '';
  password: string;
  confirm: string;
}

type FormErrors = Partial<Record<keyof FormState | 'form', string>>;

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pending, startRegister, verifyOtp, resendOtp, cancelPending } = useAuth();

  const [values, setValues] = React.useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [done, setDone] = React.useState(false);

  const set = (key: keyof FormState, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    const req = t('auth_err_required', 'Bu alan zorunludur');
    if (!values.fullName.trim()) e.fullName = req;
    if (!values.email.trim()) e.email = req;
    else if (!EMAIL_RE.test(values.email.trim())) e.email = t('auth_err_email', 'Geçerli bir e-posta girin');
    if (!values.phone.trim()) e.phone = req;
    if (!values.role) e.role = req;
    if (!values.password) e.password = req;
    else if (values.password.length < 6) e.password = t('auth_err_pw_len', 'En az 6 karakter');
    if (values.confirm !== values.password) e.confirm = t('auth_err_pw_match', 'Parolalar eşleşmiyor');
    return e;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const r = startRegister({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      password: values.password,
      role: values.role as BackOfficeRole,
    });
    if (!r.ok) {
      setErrors({ form: r.error === 'exists' ? t('auth_err_exists', 'Bu e-posta zaten kayıtlı') : t('auth_err_invalid', 'İşlem başarısız') });
    }
  };

  // Başarı ekranı
  if (done) {
    return (
      <AuthLayout title={t('auth_reg_done_title', 'Hesabınız oluşturuldu')}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'grid', placeItems: 'center', marginBottom: 12, color: 'var(--ok-fg)' }}>
            <CheckCircle2 size={42} />
          </div>
          <p className="t-mute fs-12" style={{ marginBottom: 18 }}>
            {t('auth_reg_done_desc', 'E-postanız doğrulandı ve hesabınız aktifleştirildi. Artık giriş yapabilirsiniz.')}
          </p>
          <Button type="button" variant="primary" style={authButtonStyle} onClick={() => navigate('/login')}>
            {t('auth_go_login', 'Giriş ekranına dön')}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // OTP doğrulama adımı
  if (pending?.kind === 'register') {
    return (
      <OtpStep
        title={t('auth_otp_title', 'Doğrulama kodu')}
        subtitle={t('auth_reg_otp_subtitle', 'E-posta adresinize gönderilen 6 haneli kodu girin')}
        destination={pending.email}
        demoCode={pending.code}
        onVerify={(code) => {
          const r = verifyOtp(code);
          if (r.ok) setDone(true);
          return r;
        }}
        onResend={resendOtp}
        onCancel={cancelPending}
      />
    );
  }

  return (
    <AuthLayout
      title={t('auth_register_title', 'Hesap oluştur')}
      subtitle={t('auth_register_subtitle', 'BackOffice erişimi için kayıt olun')}
      footer={
        <>
          {t('auth_have_account', 'Zaten hesabın var mı?')}{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>
            {t('auth_login_link', 'Giriş yap')}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <AuthError message={errors.form} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label={t('auth_fullname', 'Ad Soyad')} htmlFor="fullName" error={errors.fullName}>
            <Input id="fullName" value={values.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Ad Soyad" />
          </Field>
          <Field label={t('auth_email', 'E-posta')} htmlFor="email" error={errors.email}>
            <Input id="email" type="email" autoComplete="email" value={values.email} onChange={(e) => set('email', e.target.value)} placeholder="ornek@epay.demo" />
          </Field>
          <Field label={t('auth_phone', 'Telefon')} htmlFor="phone" error={errors.phone}>
            <Input id="phone" value={values.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+90 5xx xxx xx xx" />
          </Field>
          <Field label={t('auth_role', 'Rol')} htmlFor="role" error={errors.role}>
            <Select id="role" value={values.role} onChange={(e) => set('role', e.target.value)}>
              <option value="">{t('auth_role_ph', '— Rol seçin —')}</option>
              {ROLE_OPTS.map((r) => (
                <option key={r} value={r}>
                  {t(`auth_role_${r}`, r)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('auth_password', 'Parola')} htmlFor="password" error={errors.password}>
            <PasswordInput id="password" autoComplete="new-password" value={values.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" />
          </Field>
          <Field label={t('auth_confirm', 'Parola (tekrar)')} htmlFor="confirm" error={errors.confirm}>
            <PasswordInput id="confirm" autoComplete="new-password" value={values.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="••••••••" />
          </Field>
        </div>
        <Button type="submit" variant="primary" style={{ ...authButtonStyle, marginTop: 16 }}>
          {t('auth_register_btn', 'Kayıt ol')}
        </Button>
      </form>
    </AuthLayout>
  );
}

import type { NotificationTemplate } from './types';

const BASE = '2026-05-22T09:00:00Z';

export const DEFAULT_NOTIFICATION_TEMPLATES: Omit<
  NotificationTemplate,
  'id' | 'lastTriggeredAt' | 'createdAt' | 'updatedAt'
>[] = [
  {
    code: 'support_case_opened',
    name: 'support_case_opened',
    notificationType: 'SMS',
    subject: '',
    content: 'Sayın {kullanici_adi}, {talep_no} numaralı talebiniz alındı.',
    description: '10.1 — yeni destek talebi SMS',
  },
  {
    code: 'support_case_opened_email',
    name: 'support_case_opened_email',
    notificationType: 'Email',
    subject: 'Talep {talep_no} — {konu}',
    content: 'Merhaba {kullanici_adi},\n\n{talep_no} kayıtlı talebiniz oluşturuldu.\n{link}',
    description: '10.1 — yeni destek talebi e-posta',
  },
  {
    code: 'approval_pending',
    name: 'approval_pending',
    notificationType: 'Email',
    subject: 'Onay bekliyor — {islem_no}',
    content: 'Sayın {kullanici_adi}, {islem_no} işlemi onayınızı bekliyor.',
    description: '8.1 — onay havuzu bildirimi',
  },
  {
    code: 'job_result',
    name: 'job_result',
    notificationType: 'Email',
    subject: 'Zamanlanmış iş sonucu — {is_adi}',
    content: 'İş {is_adi} tamamlandı. Detay: {link}',
    description: '12.5 — iş geri bildirim e-postası',
  },
  {
    code: 'otp_login',
    name: 'otp_login',
    notificationType: 'SMS',
    subject: '',
    content: 'EPay giriş kodunuz: {otp_kodu}. {tutar} {para_birimi}',
    description: 'Auth OTP stub',
  },
];

export function seedDefaultTemplate(
  def: (typeof DEFAULT_NOTIFICATION_TEMPLATES)[number],
  index: number,
): NotificationTemplate {
  return {
    ...def,
    id: `ntpl-${String(index + 1).padStart(3, '0')}`,
    lastTriggeredAt: null,
    createdAt: BASE,
    updatedAt: BASE,
  };
}

import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';

export type UserActivityLogEntry = {
  id: string;
  userId: string;
  at: string;
  action: string;
  module: string;
  detail: string;
  ip: string;
};

export const USER_ACTIVITY_LOG_SEED: UserActivityLogEntry[] = [
  {
    id: 'ual-001',
    userId: 'usr-005',
    at: '2026-05-24T08:12:00Z',
    action: 'login_failed',
    module: 'auth',
    detail: 'Hatalı parola denemesi',
    ip: '185.22.44.91',
  },
  {
    id: 'ual-002',
    userId: 'usr-005',
    at: '2026-05-23T14:05:00Z',
    action: 'role_changed',
    module: 'system.users',
    detail: 'Rol: Operasyon → Uyum',
    ip: '10.0.4.12',
  },
  {
    id: 'ual-003',
    userId: 'usr-005',
    at: '2026-05-22T09:30:00Z',
    action: 'module_access',
    module: 'transfers',
    detail: 'Para transferleri listesi görüntülendi',
    ip: '10.0.4.12',
  },
  {
    id: 'ual-004',
    userId: MOCK_USER_IDS.ops,
    at: '2026-05-24T07:55:00Z',
    action: 'login_success',
    module: 'auth',
    detail: 'Başarılı giriş',
    ip: '10.0.2.18',
  },
  {
    id: 'ual-005',
    userId: MOCK_USER_IDS.compliance,
    at: '2026-05-23T11:20:00Z',
    action: 'module_access',
    module: 'kyc',
    detail: 'KYC inceleme detayı açıldı',
    ip: '10.0.3.44',
  },
];

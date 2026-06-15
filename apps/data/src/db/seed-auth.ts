import type { AuthAccountRecord } from '../types/auth';

/** Ortak demo parolası — login ekranında ipucu olarak gösterilir. */
export const DEMO_PASSWORD = 'Epay.1234';

/** Önceden tanımlı demo hesaplar (mock kimlik doğrulama seed). */
export const AUTH_SEED_ACCOUNTS: AuthAccountRecord[] = [
  {
    id: 'usr-ops',
    fullName: 'Ahmet Yılmaz',
    email: 'ops@epay.demo',
    phone: '+90 532 100 0001',
    role: 'ops',
    password: DEMO_PASSWORD,
    status: 'active',
  },
  {
    id: 'usr-fin',
    fullName: 'Fatma Kaya',
    email: 'finance@epay.demo',
    phone: '+90 532 100 0004',
    role: 'finance',
    password: DEMO_PASSWORD,
    status: 'active',
  },
  {
    id: 'usr-comp',
    fullName: 'Ayşe Demir',
    email: 'compliance@epay.demo',
    phone: '+90 532 100 0002',
    role: 'compliance',
    password: DEMO_PASSWORD,
    status: 'active',
  },
  {
    id: 'usr-mgmt',
    fullName: 'Mehmet Şahin',
    email: 'management@epay.demo',
    phone: '+90 532 100 0003',
    role: 'management',
    password: DEMO_PASSWORD,
    status: 'active',
  },
  {
    id: 'usr-agent',
    fullName: 'Demo Temsilci',
    email: 'agent@epay.demo',
    phone: '+90 532 100 0010',
    role: 'ops',
    password: DEMO_PASSWORD,
    status: 'active',
  },
  {
    id: 'usr-alltest',
    fullName: 'All Test',
    email: 'alltest@epay.demo',
    phone: '+90 532 100 0099',
    role: 'alltest',
    password: DEMO_PASSWORD,
    status: 'active',
  },
];

/** Login ekranında gösterilecek demo hesap özeti (parola DEMO_PASSWORD). */
export const DEMO_ACCOUNTS = AUTH_SEED_ACCOUNTS.map((a) => ({
  email: a.email,
  role: a.role,
}));

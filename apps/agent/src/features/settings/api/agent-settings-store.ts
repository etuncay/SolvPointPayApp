/** 1.3 Ayarlar — iletişim/adres/kullanıcı mock veri katmanı. */

export type ContactChannel = 'email' | 'phone';

export type ContactRow = {
  id: number;
  channel: ContactChannel;
  value: string;
  verified: boolean;
  isPrimary: boolean;
};

export type AddressRow = {
  id: number;
  title: string;
  line: string;
  city: string;
  country: string;
};

export type AgentUserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  dailyLimit: number;
  active: boolean;
};

/** Temsilci global günlük limiti — Kullanıcı Yönetimi limitleri bunu aşamaz (§8). */
export const AGENT_GLOBAL_DAILY_LIMIT = 250_000;

/** Mock: oturumdaki yetkili Admin Temsilci mi. */
export const IS_AGENT_ADMIN = true;

let contactId = 3;
let addressId = 2;

const contacts: ContactRow[] = [
  { id: 1, channel: 'email', value: 'yetkili@acmedoviz.com.tr', verified: true, isPrimary: true },
  { id: 2, channel: 'phone', value: '+90 532 111 22 33', verified: true, isPrimary: false },
];

const addresses: AddressRow[] = [
  { id: 1, title: 'Merkez Şube', line: 'Bağdat Cad. No:120 Kat:3', city: 'İstanbul', country: 'Türkiye' },
];

const users: AgentUserRow[] = [
  { id: 1, name: 'Mehmet Yetkili', email: 'mehmet@acmedoviz.com.tr', role: 'Admin Temsilci', dailyLimit: 250_000, active: true },
  { id: 2, name: 'Ayşe Operatör', email: 'ayse@acmedoviz.com.tr', role: 'Temsilci', dailyLimit: 80_000, active: true },
  { id: 3, name: 'Can Gişe', email: 'can@acmedoviz.com.tr', role: 'Temsilci', dailyLimit: 50_000, active: false },
];

export const agentSettingsStore = {
  listContacts: (): ContactRow[] => contacts.map((c) => ({ ...c })),

  hasContact: (value: string): boolean =>
    contacts.some((c) => c.value.toLowerCase() === value.toLowerCase()),

  addContact(channel: ContactChannel, value: string): ContactRow {
    const row: ContactRow = { id: ++contactId, channel, value, verified: false, isPrimary: false };
    contacts.push(row);
    return row;
  },

  verifyContact(id: number): void {
    const row = contacts.find((c) => c.id === id);
    if (row) row.verified = true;
  },

  setPrimary(id: number): void {
    const target = contacts.find((c) => c.id === id);
    if (!target || !target.verified) return;
    for (const c of contacts) c.isPrimary = c.channel === target.channel ? c.id === id : c.isPrimary;
  },

  removeContact(id: number): void {
    const idx = contacts.findIndex((c) => c.id === id);
    if (idx >= 0 && !contacts[idx]!.isPrimary) contacts.splice(idx, 1);
  },

  listAddresses: (): AddressRow[] => addresses.map((a) => ({ ...a })),

  addAddress(input: Omit<AddressRow, 'id'>): AddressRow {
    const row: AddressRow = { id: ++addressId, ...input };
    addresses.push(row);
    return row;
  },

  removeAddress(id: number): void {
    const idx = addresses.findIndex((a) => a.id === id);
    if (idx >= 0) addresses.splice(idx, 1);
  },

  listUsers: (): AgentUserRow[] => users.map((u) => ({ ...u })),

  userCount: (): number => users.length,

  updateUserLimit(id: number, limit: number): { ok: boolean; error?: string } {
    if (limit > AGENT_GLOBAL_DAILY_LIMIT) return { ok: false, error: 'ag_us_err_limit' };
    const row = users.find((u) => u.id === id);
    if (row) row.dailyLimit = limit;
    return { ok: true };
  },
};

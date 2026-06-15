import { simulateNetworkLatency } from './latency';
import { getDb } from '../../db/dexie';
import {
  ensureCustomerPortalSeeded,
  DEMO_CUSTOMER_PASSWORD,
  getCustomerPortalSeed,
} from '../../db/seed-customer-portal';
import type { CustomerPortalApi } from '../../contracts/customer-portal-api';
import type {
  CustomerProfile,
  CustomerSettings,
  CustomerTransaction,
  CustomerWallet,
  CurrencyCode,
  CustomerContact,
  SavedRecipient,
  TransferDraftInput,
  TransactionsListQuery,
} from '../../types/customer-portal';

const FX_RATES: Record<string, number> = {
  'USD>TRY': 32.84,
  'EUR>TRY': 35.6,
  'TRY>USD': 0.0304,
  'TRY>EUR': 0.0281,
  'USD>EUR': 0.922,
  'EUR>USD': 1.085,
  'GBP>TRY': 41.5,
};

let pendingTransfer: {
  transactionId: string;
  referenceNo: string;
  draft: TransferDraftInput;
} | null = null;

/** Demo referans — işlem başına bir kez */
function createReferenceNo(): string {
  return `REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
let sessionProfile: CustomerProfile | null = null;

/** İletişim doğrulama "Tekrar Gönder" rate-limit kaydı: adres başına timestamp listesi */
const contactResendLog: Record<string, number[]> = {};
const RESEND_MIN_INTERVAL_MS = 1000; // saniyede 1
const RESEND_MAX_PER_CONTACT = 5; // bir adres için 5

function symFor(cur: CurrencyCode): string {
  const map: Record<CurrencyCode, string> = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' };
  return map[cur];
}

const SETTINGS_DEFAULTS = getCustomerPortalSeed().settings;

/** Eski Dexie kayıtlarında eksik alanları seed varsayılanlarıyla tamamlar */

function normalizeSettings(row: CustomerSettings): CustomerSettings {
  const seed = SETTINGS_DEFAULTS;
  return {
    ...seed,
    ...row,
    internetDailyLimit: row.internetDailyLimit ?? seed.internetDailyLimit,
    monthlyIncome: row.monthlyIncome ?? seed.monthlyIncome,
    education: row.education ?? seed.education,
    employmentStatus: row.employmentStatus ?? seed.employmentStatus,
    profession: row.profession ?? seed.profession,
    employer: row.employer ?? seed.employer,
    notifyMoneyIn: row.notifyMoneyIn ?? row.pushNotify ?? seed.notifyMoneyIn,
    notifyMoneyOut: row.notifyMoneyOut ?? seed.notifyMoneyOut,
    notifyLowBalance: row.notifyLowBalance ?? seed.notifyLowBalance,
    lowBalanceThreshold: row.lowBalanceThreshold ?? seed.lowBalanceThreshold,
  };
}

/** "DD.MM.YYYY ..." → "YYYY-MM-DD" (tarih aralığı karşılaştırması için) */
function txDateIso(date: string): string {
  const day = date.split(' ')[0] ?? '';
  const parts = day.split('.');
  if (parts.length !== 3) return '';
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/** "DD.MM.YYYY HH:mm" → "YYYY-MM-DD HH:mm" (kronolojik sıralama anahtarı) */
function txDateSortKey(date: string): string {
  const [day, time = '00:00'] = date.split(' ');
  return `${txDateIso(day)} ${time}`;
}

function filterTransactions(
  rows: CustomerTransaction[],
  query: TransactionsListQuery,
): CustomerTransaction[] {
  let out = [...rows];
  if (query.direction && query.direction !== 'all') {
    out = out.filter((t) => t.direction === query.direction);
  }
  if (query.walletId && query.walletId !== 'all') {
    out = out.filter((t) => t.walletId === query.walletId);
  }
  if (query.type && query.type !== 'all') {
    out = out.filter((t) => t.type === query.type);
  }
  if (query.amountMin != null) {
    out = out.filter((t) => t.amount >= query.amountMin!);
  }
  if (query.amountMax != null) {
    out = out.filter((t) => t.amount <= query.amountMax!);
  }
  if (query.dateFrom) {
    out = out.filter((t) => txDateIso(t.date) >= query.dateFrom!);
  }
  if (query.dateTo) {
    out = out.filter((t) => txDateIso(t.date) <= query.dateTo!);
  }
  if (query.search?.trim()) {
    const s = query.search.trim().toLowerCase();
    out = out.filter(
      (t) =>
        t.counterparty.toLowerCase().includes(s) ||
        t.id.toLowerCase().includes(s) ||
        t.type.toLowerCase().includes(s) ||
        (t.description ?? '').toLowerCase().includes(s),
    );
  }
  const sortBy = query.sortBy ?? 'date';
  const sortDir = query.sortDir ?? 'desc';
  out.sort((a, b) => {
    if (sortBy === 'amount') {
      return sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    const ka = txDateSortKey(a.date);
    const kb = txDateSortKey(b.date);
    return sortDir === 'asc' ? ka.localeCompare(kb) : kb.localeCompare(ka);
  });
  return out;
}

export function createDexieCustomerPortalAdapter(): CustomerPortalApi {
  return {
    async login(input) {
      await ensureCustomerPortalSeeded();
      await simulateNetworkLatency();
      const db = getDb();
      const profile = await db.customerProfile.toCollection().first();
      if (!profile) {
        return { ok: false, errorCode: 'invalid_credentials' };
      }
      const wallets = await db.customerWallets.toArray();
      const hasPersistent = wallets.some((w) => w.type === 'CustomerPersistent');
      if (!hasPersistent) {
        return { ok: false, errorCode: 'no_persistent_wallet' };
      }
      const identityOk =
        input.identity === profile.customerNo ||
        input.identity === '4827193' ||
        input.identity.toLowerCase() === 'elif.demir@ornek.com';
      if (!identityOk || input.password !== DEMO_CUSTOMER_PASSWORD) {
        return { ok: false, errorCode: 'invalid_credentials' };
      }
      return { ok: true, requiresOtp: true, profile };
    },

    async verifyOtp(input) {
      await simulateNetworkLatency();
      const db = getDb();
      const profile = await db.customerProfile.toCollection().first();
      if (!profile) return { ok: false, errorCode: 'invalid_credentials' };
      if (input.otp !== '123456' && input.otp !== '000000') {
        return { ok: false, errorCode: 'invalid_credentials' };
      }
      sessionProfile = profile;
      return { ok: true, profile };
    },

    async requestPasswordReset() {
      await simulateNetworkLatency();
      return { ok: true };
    },

    async getProfile() {
      await ensureCustomerPortalSeeded();
      await simulateNetworkLatency();
      if (sessionProfile) return sessionProfile;
      const p = await getDb().customerProfile.toCollection().first();
      if (!p) throw new Error('Profil bulunamadı');
      return p;
    },

    async listWallets() {
      await ensureCustomerPortalSeeded();
      await simulateNetworkLatency();
      return getDb().customerWallets.toArray();
    },

    async listTransactions(query) {
      await ensureCustomerPortalSeeded();
      await simulateNetworkLatency();
      const all = await getDb().customerTransactions.toArray();
      const filtered = filterTransactions(all, query);
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 20;
      const start = (page - 1) * pageSize;
      return {
        items: filtered.slice(start, start + pageSize),
        total: filtered.length,
        page,
        pageSize,
      };
    },

    async getTransactionById(id) {
      await ensureCustomerPortalSeeded();
      await simulateNetworkLatency();
      return getDb().customerTransactions.get(id);
    },

    async recentTransactions(limit = 7) {
      await ensureCustomerPortalSeeded();
      await simulateNetworkLatency();
      const all = await getDb().customerTransactions.toArray();
      return all
        .sort((a, b) => txDateSortKey(b.date).localeCompare(txDateSortKey(a.date)))
        .slice(0, limit);
    },

    async listRecipients() {
      await ensureCustomerPortalSeeded();
      await simulateNetworkLatency();
      const rows = await getDb().customerRecipients.toArray();
      return rows.filter((r) => r.recordStatus === 1);
    },

    async createRecipient(input) {
      await simulateNetworkLatency();
      const now = new Date().toISOString();
      const id = `r-${Date.now()}`;
      const row: SavedRecipient = {
        ...input,
        id,
        recordStatus: 1,
        createdAt: now,
        updatedAt: now,
      };
      await getDb().customerRecipients.put(row);
      return row;
    },

    async updateRecipient(id, input) {
      await simulateNetworkLatency();
      const existing = await getDb().customerRecipients.get(id);
      if (!existing || existing.recordStatus === 0) return undefined;
      const updated: SavedRecipient = {
        ...existing,
        ...input,
        updatedAt: new Date().toISOString(),
      };
      await getDb().customerRecipients.put(updated);
      return updated;
    },

    async deleteRecipient(id) {
      await simulateNetworkLatency();
      const existing = await getDb().customerRecipients.get(id);
      if (!existing) return false;
      await getDb().customerRecipients.put({
        ...existing,
        recordStatus: 0,
        updatedAt: new Date().toISOString(),
      });
      return true;
    },

    async listIbans() {
      await ensureCustomerPortalSeeded();
      await simulateNetworkLatency();
      return getDb().customerIbans.toArray();
    },

    async listFees() {
      await ensureCustomerPortalSeeded();
      await simulateNetworkLatency();
      return getDb().customerFees.toArray();
    },

    async getFxQuote(src, dst) {
      await simulateNetworkLatency();
      const pair = `${src}>${dst}`;
      const rate = FX_RATES[pair] ?? 1;
      const expiresAt = new Date(Date.now() + 90_000).toISOString();
      return { pair, rate, expiresAt };
    },

    async getSettings() {
      await ensureCustomerPortalSeeded();
      await simulateNetworkLatency();
      const s = await getDb().customerSettings.toCollection().first();
      if (!s) throw new Error('Ayarlar bulunamadı');
      return normalizeSettings(s);
    },

    async updateSettings(patch) {
      await simulateNetworkLatency();
      const db = getDb();
      const current = await db.customerSettings.toCollection().first();
      if (!current) throw new Error('Ayarlar bulunamadı');
      const next: CustomerSettings = { ...current, ...patch };
      await db.customerSettings.put(next);
      if (patch.welcomeMessage && sessionProfile) {
        sessionProfile = { ...sessionProfile, welcomeMessage: patch.welcomeMessage };
        await db.customerProfile.put(sessionProfile);
      }
      return normalizeSettings(next);
    },

    async changePassword(currentPassword, newPassword) {
      await simulateNetworkLatency();
      if (currentPassword !== DEMO_CUSTOMER_PASSWORD) {
        return { ok: false, errorCode: 'invalid_current' };
      }
      if (newPassword.length < 8) {
        return { ok: false, errorCode: 'weak_password' };
      }
      return { ok: true };
    },

    async listReceipts() {
      await ensureCustomerPortalSeeded();
      await simulateNetworkLatency();
      return getDb().customerReceipts.toArray();
    },

    async listContacts() {
      await ensureCustomerPortalSeeded();
      await simulateNetworkLatency();
      const order: Record<CustomerContact['kind'], number> = { email: 0, mobile: 1, landline: 2 };
      const rows = await getDb().customerContacts.toArray();
      return rows.sort(
        (a, b) => order[a.kind] - order[b.kind] || a.createdAt.localeCompare(b.createdAt),
      );
    },

    async addContact(input) {
      await simulateNetworkLatency();
      const now = new Date().toISOString();
      const row: CustomerContact = {
        id: `ct-${Date.now()}`,
        kind: input.kind,
        value: input.value.trim(),
        isPrimary: false,
        // Sabit telefon doğrulanmaz; e-posta/mobil doğrulama bekler.
        verified: input.kind === 'landline',
        createdAt: now,
        updatedAt: now,
      };
      await getDb().customerContacts.put(row);
      return row;
    },

    async updateContact(id, value) {
      await simulateNetworkLatency();
      const existing = await getDb().customerContacts.get(id);
      if (!existing) return undefined;
      const changed = existing.value !== value.trim();
      const updated: CustomerContact = {
        ...existing,
        value: value.trim(),
        // Adres değişti ise yeniden doğrulama gerekir (sabit telefon hariç).
        verified: changed && existing.kind !== 'landline' ? false : existing.verified,
        isPrimary: changed && existing.kind !== 'landline' ? false : existing.isPrimary,
        updatedAt: new Date().toISOString(),
      };
      await getDb().customerContacts.put(updated);
      return updated;
    },

    async deleteContact(id) {
      await simulateNetworkLatency();
      const existing = await getDb().customerContacts.get(id);
      if (!existing) return false;
      await getDb().customerContacts.delete(id);
      delete contactResendLog[id];
      return true;
    },

    async setPrimaryContact(id) {
      await simulateNetworkLatency();
      const db = getDb();
      const target = await db.customerContacts.get(id);
      // Sabit telefon ve doğrulanmamış adres asıl seçilemez.
      if (!target || target.kind === 'landline' || !target.verified) {
        return db.customerContacts.toArray();
      }
      const sameKind = await db.customerContacts.where('kind').equals(target.kind).toArray();
      const now = new Date().toISOString();
      await Promise.all(
        sameKind.map((c) =>
          db.customerContacts.put({ ...c, isPrimary: c.id === id, updatedAt: now }),
        ),
      );
      return db.customerContacts.toArray();
    },

    async resendContactVerification(id) {
      await simulateNetworkLatency();
      const existing = await getDb().customerContacts.get(id);
      if (!existing) return { ok: false };
      if (existing.verified) return { ok: false, alreadyVerified: true };
      const now = Date.now();
      const log = contactResendLog[id] ?? [];
      const recent = log.filter((ts) => now - ts < 60_000);
      const lastTs = recent[recent.length - 1];
      if (lastTs != null && now - lastTs < RESEND_MIN_INTERVAL_MS) {
        return { ok: false, rateLimited: true };
      }
      if (recent.length >= RESEND_MAX_PER_CONTACT) {
        return { ok: false, rateLimited: true };
      }
      recent.push(now);
      contactResendLog[id] = recent;
      return { ok: true };
    },

    async verifyContact(id, code) {
      await simulateNetworkLatency();
      const existing = await getDb().customerContacts.get(id);
      if (!existing) return { ok: false };
      if (code !== '123456' && code !== '000000') return { ok: false };
      await getDb().customerContacts.put({
        ...existing,
        verified: true,
        updatedAt: new Date().toISOString(),
      });
      delete contactResendLog[id];
      return { ok: true };
    },

    async getTopupInstructions() {
      await ensureCustomerPortalSeeded();
      await simulateNetworkLatency();
      const t = await getDb().customerTopup.toCollection().first();
      if (!t) throw new Error('Talimat bulunamadı');
      return {
        companyName: t.companyName ?? 'Epay Ödeme Hizmetleri A.Ş.',
        companyBank: t.companyBank,
        companyIban: t.companyIban,
        customerReference: t.customerReference,
        note: t.note,
      };
    },

    async createSupportCase(input) {
      await simulateNetworkLatency();
      const id = `SC-${Date.now()}`;
      const row = {
        ...input,
        id,
        caseNo: `CASE-${id.slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: 'Open',
      };
      await getDb().customerSupportCases.put(row);
      return row;
    },

    async createTransferDraft(draft) {
      await simulateNetworkLatency();
      const transactionId = `TRX-${Date.now()}`;
      const referenceNo = createReferenceNo();
      const foreignReferenceNo =
        draft.kind === 'intl' ? `FT-${Math.random().toString(36).slice(2, 8).toUpperCase()}` : undefined;
      pendingTransfer = { transactionId, referenceNo, draft };
      const requiresDeclaration = draft.amount >= 20000 || draft.kind === 'intl';
      return {
        transactionId,
        referenceNo,
        foreignReferenceNo,
        draft,
        requiresDeclaration,
        otpSent: true,
      };
    },

    async approveTransfer(transactionId, otp, _idempotencyKey, _declaration) {
      await simulateNetworkLatency();
      if (!pendingTransfer || pendingTransfer.transactionId !== transactionId) {
        throw new Error('Geçersiz işlem');
      }
      if (otp !== '123456' && otp !== '000000') {
        throw new Error('OTP hatalı');
      }
      const { draft } = pendingTransfer;
      const status = draft.kind === 'intl' ? 'Sent' : 'Completed';
      const tx: CustomerTransaction = {
        id: transactionId,
        date: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
        // Tüm self-servis akışları (yurt içi/dışı + Para Al) cüzdandan çıkıştır.
        // Para Al = cüzdandan kendi IBAN'a aktarım (Veri analizi §19 yorum a); bakiye azalır.
        direction: 'out',
        type:
          draft.kind === 'domestic'
            ? 'Yurt İçi Transfer'
            : draft.kind === 'intl'
              ? 'Yurt Dışı Transfer'
              : 'Para Al',
        counterparty: draft.recipientName,
        referenceNo: pendingTransfer.referenceNo,
        currency: draft.currency,
        symbol: draft.symbol,
        amount: draft.amount,
        balanceAfter: 0,
        status,
        description: draft.description,
        purpose: draft.purpose,
        country: draft.country,
        walletId: draft.sourceWalletId,
      };
      await getDb().customerTransactions.put(tx);
      await getDb().customerReceipts.put({
        transactionId,
        fileName: `dekont-${transactionId}.pdf`,
        createdAt: new Date().toISOString(),
      });
      const wallet = await getDb().customerWallets.get(draft.sourceWalletId);
      if (wallet && wallet.editable) {
        const next: CustomerWallet = {
          ...wallet,
          balance: Math.max(0, wallet.balance - draft.total),
        };
        await getDb().customerWallets.put(next);
      }
      // "Kişiyi Kayıtlı Kişilerime Kaydet" (4.2/4.3) — onay sonrası alıcı kalıcılaşır.
      if (draft.saveRecipient && draft.kind !== 'receive') {
        const now = new Date().toISOString();
        const recipient: SavedRecipient = {
          id: `r-${Date.now()}`,
          label: draft.recipientName,
          name: draft.recipientName,
          country: draft.country,
          isIntl: draft.kind === 'intl',
          phone: draft.phone,
          email: draft.email,
          purpose: draft.purpose,
          description: draft.description,
          recordStatus: 1,
          createdAt: now,
          updatedAt: now,
        };
        await getDb().customerRecipients.put(recipient);
      }
      const referenceNo = pendingTransfer.referenceNo;
      pendingTransfer = null;
      return { transactionId, referenceNo, status, receiptAvailable: true };
    },

    async cancelTransfer(transactionId) {
      await simulateNetworkLatency();
      if (pendingTransfer?.transactionId === transactionId) {
        pendingTransfer = null;
        return true;
      }
      return false;
    },

    async getReceipt(transactionId) {
      await ensureCustomerPortalSeeded();
      await simulateNetworkLatency();
      return getDb().customerReceipts.get(transactionId);
    },
  };
}

export function clearCustomerPortalSession(): void {
  sessionProfile = null;
  pendingTransfer = null;
  for (const key of Object.keys(contactResendLog)) delete contactResendLog[key];
}

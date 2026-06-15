/** 6.3 — geçici alıcı kayıtları (kayıtsız kimlik ile). */
export type ReceiverInfoRecord = {
  id: string;
  idNo: string;
  displayName: string;
  phone: string;
  email: string;
  maskedName: string;
  maskedPhone: string;
  maskedEmail: string;
  walletId: number;
  walletNo: string;
};

const store = new Map<string, ReceiverInfoRecord>();
let nextWalletId = 88000;

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return `${name.slice(0, 1)}***`;
  return `${parts[0]!.slice(0, 1)}*** ${parts[parts.length - 1]!.slice(0, 1)}***`;
}

function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length < 4) return '***';
  return `*** *** ${d.slice(-4)}`;
}

function maskEmail(email: string): string {
  const [u, domain] = email.split('@');
  if (!domain) return '***@***';
  return `${u!.slice(0, 1)}***@${domain}`;
}

export const receiverInfoStore = {
  findByIdNo(idNo: string): ReceiverInfoRecord | null {
    return store.get(idNo.trim()) ?? null;
  },

  create(input: { idNo: string; name: string; phone: string; email: string }): ReceiverInfoRecord {
    const id = input.idNo.trim();
    const existing = store.get(id);
    if (existing) return existing;

    const walletId = nextWalletId++;
    const row: ReceiverInfoRecord = {
      id: `ri-${id}`,
      idNo: id,
      displayName: input.name,
      phone: input.phone,
      email: input.email,
      maskedName: maskName(input.name),
      maskedPhone: maskPhone(input.phone),
      maskedEmail: maskEmail(input.email),
      walletId,
      walletNo: `RI-${id.slice(-4)}-TX`,
    };
    store.set(id, row);
    return row;
  },
};

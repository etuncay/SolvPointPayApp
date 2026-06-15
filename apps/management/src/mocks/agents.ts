import { mulberry32 } from '@/lib/format';
import { buildLegacyAgentGroups } from '@/mocks/agent-groups';
import { SAMPLE_AGENT } from '@/mocks/sample-agent';

const rand = mulberry32(101);
const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)]!;

const PREFIXES = [
  'Acme',
  'Yıldız',
  'Mavi',
  'Anadolu',
  'Boğaz',
  'Aksaray',
  'Ankara',
  'Bursa',
  'Antalya',
  'Trabzon',
  'Kuzey',
  'Güney',
  'Doğu',
  'Batı',
  'Marmara',
  'Ege',
  'Karadeniz',
  'Akdeniz',
  'Beyaz',
  'Altın',
  'Gümüş',
  'Pamukkale',
  'Galata',
  'Beyoğlu',
  'Üsküdar',
  'Kadıköy',
];
const TYPES = ['Döviz', 'Para Transfer', 'Bayi', 'Exchange', 'Finans', 'Hızlı Para', 'Transfer'];
const SUFFIXES = ['Merkez', 'Şube', 'Acentesi', 'Ofisi', null, null] as const;
const ORG = ['A.Ş.', 'Ltd. Şti.', 'Ltd. Şti.', 'A.Ş.'];
const CITIES = [
  'İstanbul / Kadıköy',
  'İstanbul / Beşiktaş',
  'İstanbul / Üsküdar',
  'İstanbul / Beyoğlu',
  'Ankara / Çankaya',
  'Ankara / Keçiören',
  'İzmir / Konak',
  'İzmir / Karşıyaka',
  'Bursa / Nilüfer',
  'Antalya / Muratpaşa',
  'Adana / Seyhan',
  'Gaziantep / Şahinbey',
  'Konya / Selçuklu',
  'Kayseri / Melikgazi',
  'Trabzon / Ortahisar',
  'Eskişehir / Tepebaşı',
];

export const AGENT_GROUPS = buildLegacyAgentGroups();

export type AgentGroup = {
  key: string;
  label: string;
  commission: number;
};
export type SettlementFrequency = 'realtime' | 'daily' | 'weekly' | 'monthly';

export type Agent = {
  id: number;
  name: string;
  city: string;
  email: string;
  phone: string;
  vkn: string;
  mersis: string;
  group: AgentGroup;
  settlement: SettlementFrequency;
  balance: { TRY: number; USD: number; EUR: number };
  createdAt: string;
  lastTxAt: string | 'today';
  status: 'active' | 'inactive' | 'blocked' | 'closed';
  blockReason: string | null;
  closeReason: string | null;
  txToday: number;
  branches: number;
  recordStatus: 0 | 1;
};

const SETTLEMENT: SettlementFrequency[] = ['realtime', 'daily', 'weekly', 'monthly'];
const STATUSES = [
  { v: 'active' as const, weight: 70 },
  { v: 'inactive' as const, weight: 10 },
  { v: 'blocked' as const, weight: 12 },
  { v: 'closed' as const, weight: 8 },
];

function pickWeighted() {
  const total = STATUSES.reduce((a, b) => a + b.weight, 0);
  let r = rand() * total;
  for (const s of STATUSES) {
    if ((r -= s.weight) <= 0) return s.v;
  }
  return STATUSES[0]!.v;
}

const BLOCK = ['Mutabakat Açık', 'Sanksiyon İncelemesi', 'Limit Aşımı', 'Kasa Açığı', 'Belge Eksik'];
const CLOSE = ['Sözleşme Feshi', 'Tüm Şubeler Kapalı', 'İrtibat Kesilmiş', 'Lisans İptali'];

function vkn() {
  return String(1000000000 + Math.floor(rand() * 9000000000)).slice(0, 10);
}

function mersis() {
  return Array.from({ length: 4 }, () => String(Math.floor(rand() * 10000)).padStart(4, '0')).join('-');
}

function phone() {
  const a = pick([212, 216, 232, 312, 322, 224, 342, 352, 442, 462]);
  const b = 100 + Math.floor(rand() * 900);
  const c = 10 + Math.floor(rand() * 90);
  const d = 10 + Math.floor(rand() * 90);
  return `+90 ${a} ${b} ${c} ${d}`;
}

function makeName(i: number) {
  const pre = PREFIXES[i % PREFIXES.length]!;
  const ty = pick(TYPES);
  const sx = pick([...SUFFIXES]);
  const og = pick(ORG);
  const parts = [pre, ty];
  if (sx) parts.push(sx);
  parts.push(og);
  return parts.join(' ');
}

function emailFromName(name: string) {
  const slug = name
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/a\.ş\.|ltd\.|şti\./g, '')
    .replace(/[^a-z0-9]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');
  const dom = slug.split('.').slice(0, 2).join('');
  return `mutabakat@${dom}.com.tr`;
}

function dateStr(daysAgo: number) {
  const d = new Date(2026, 4, 23);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function makeAgent(i: number): Agent {
  const name = makeName(i);
  const grp = AGENT_GROUPS[Math.floor(rand() * AGENT_GROUPS.length)]!;
  const status = pickWeighted();
  const tryBal = Math.floor((rand() - 0.15) * 850000);
  const usd = Math.floor(rand() * 24000);
  const eur = Math.floor(rand() * 18000);
  const lastTxDays =
    status === 'active'
      ? Math.floor(rand() * 4)
      : status === 'inactive'
        ? 14 + Math.floor(rand() * 60)
        : status === 'blocked'
          ? 1 + Math.floor(rand() * 30)
          : 90 + Math.floor(rand() * 180);
  const createdDays = lastTxDays + 30 + Math.floor(rand() * 1200);

  return {
    id: 99901 + i,
    name,
    city: pick(CITIES),
    email: emailFromName(name),
    phone: phone(),
    vkn: vkn(),
    mersis: mersis(),
    group: grp,
    settlement: pick(SETTLEMENT),
    balance: { TRY: tryBal, USD: usd, EUR: eur },
    createdAt: dateStr(createdDays),
    lastTxAt: lastTxDays === 0 ? 'today' : dateStr(lastTxDays),
    status,
    blockReason: status === 'blocked' ? pick(BLOCK) : null,
    closeReason: status === 'closed' ? pick(CLOSE) : null,
    txToday: status === 'active' ? Math.floor(rand() * 180) : 0,
    branches: 1 + Math.floor(rand() * 6),
    recordStatus: 1,
  };
}

function alignDemoListAgent(a: Agent): Agent {
  if (a.id !== 99901) return a;
  const grp = AGENT_GROUPS.find((g) => g.key === SAMPLE_AGENT.groupKey) ?? a.group;
  const email = SAMPLE_AGENT.contacts.find((c) => c.type === 'email')?.value ?? a.email;
  const phone = SAMPLE_AGENT.contacts.find((c) => c.type === 'phone')?.value ?? a.phone;
  const addr = SAMPLE_AGENT.addresses[0];
  return {
    ...a,
    name: SAMPLE_AGENT.name,
    vkn: SAMPLE_AGENT.taxNo,
    email,
    phone,
    mersis: SAMPLE_AGENT.mersisNo.replace(/(\d{4})(?=\d)/g, '$1-').slice(0, 19),
    group: grp,
    settlement: SAMPLE_AGENT.settlement,
    city: addr ? `${addr.city} / ${addr.district}` : a.city,
    balance: {
      TRY: SAMPLE_AGENT.financialWallets.find((w) => w.type === 'agent_advance')?.balance ?? a.balance.TRY,
      USD: a.balance.USD,
      EUR: a.balance.EUR,
    },
    status: SAMPLE_AGENT.status as Agent['status'],
    blockReason: null,
    closeReason: null,
  };
}

export const AGENTS: Agent[] = Array.from({ length: 42 }, (_, i) => makeAgent(i))
  .map((a, i) => ({
    ...a,
    id: 99901 + i,
    recordStatus: i === 2 || i === 7 ? 0 : a.recordStatus,
  }))
  .map(alignDemoListAgent);

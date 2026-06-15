import type { CustomerRecord } from '../types/customer';
import { getDb } from './dexie';
import seedMeta from './seed.meta.json';

const FIRST_NAMES = [
  'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Ali', 'Zeynep', 'Hasan', 'Elif', 'İbrahim', 'Merve',
  'Mustafa', 'Emine', 'Osman', 'Hatice', 'Yusuf', 'Selin', 'Burak', 'Derya', 'Emre', 'Gizem',
];

const LAST_NAMES = [
  'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Arslan', 'Doğan', 'Koç', 'Yıldız', 'Aydın',
  'Öztürk', 'Kılıç', 'Çetin', 'Güneş', 'Erdoğan', 'Aktaş', 'Korkmaz', 'Uçar', 'Aksoy', 'Polat',
];

const STATUSES = ['Active', 'Passive', 'Blocked', 'Pending'] as const;
const TYPES = ['individual', 'corporate'] as const;
const CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
];

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString();
}

function randomPhone(seed: number): string {
  const a = (seed * 17) % 100;
  const b = (seed * 31) % 10000000;
  return `+90 5${String(a).padStart(2, '0')} ${String(b).padStart(7, '0')}`;
}

function buildName(i: number): string {
  const first = FIRST_NAMES[i % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
  const suffix = Math.floor(i / (FIRST_NAMES.length * LAST_NAMES.length));
  return suffix > 0 ? `${first} ${last} ${suffix + 1}` : `${first} ${last}`;
}

export function generateCustomerRows(count: number, startId = 10001): CustomerRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const id = String(startId + i);
    const type = TYPES[i % 2];
    const name = buildName(i);
    const [firstName, ...rest] = name.split(' ');
    return {
      id,
      name,
      type,
      status: STATUSES[i % 4],
      email: `musteri.${id}@example.com`,
      phone: randomPhone(i),
      city: CITIES[i % CITIES.length],
      kycLevel: String(i % 4),
      riskScore: (i * 7 + 13) % 100,
      balance: Math.round(((i * 1337) % 500000) * 100) / 100,
      createdAt: randomDate(new Date('2023-06-01'), new Date('2026-05-30')),
      customerType: type,
      firstName,
      lastName: rest.join(' '),
      country: 'TR',
      language: 'tr',
      smsNotify: true,
      emailNotify: true,
    };
  });
}

/** Tarayıcı IndexedDB — boşsa seed.meta.json count kadar kayıt üretir */
export async function ensurePlaygroundCustomersSeeded(): Promise<void> {
  const db = getDb();
  const count = await db.customers.count();
  if (count > 0) return;

  const target = seedMeta.customerCount ?? 320;
  const rows = generateCustomerRows(target);
  await db.customers.bulkPut(rows);
  await db.meta.put({ key: 'nextCustomerId', value: 10001 + target });
}

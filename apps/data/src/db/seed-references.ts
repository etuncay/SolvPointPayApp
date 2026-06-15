import type { RefOptionRow } from '../types/reference';
import { getDb } from './dexie';

/** Ülke kodu → şehir listesi (mock referans verisi) */
const CITIES_BY_COUNTRY: Record<string, Array<{ label: string; value: string }>> = {
  TR: [
    { label: 'İstanbul', value: 'istanbul' },
    { label: 'Ankara', value: 'ankara' },
    { label: 'İzmir', value: 'izmir' },
    { label: 'Bursa', value: 'bursa' },
    { label: 'Antalya', value: 'antalya' },
    { label: 'Adana', value: 'adana' },
    { label: 'Konya', value: 'konya' },
    { label: 'Gaziantep', value: 'gaziantep' },
    { label: 'Kayseri', value: 'kayseri' },
    { label: 'Trabzon', value: 'trabzon' },
    { label: 'Eskişehir', value: 'eskisehir' },
    { label: 'Diyarbakır', value: 'diyarbakir' },
    { label: 'Samsun', value: 'samsun' },
    { label: 'Mersin', value: 'mersin' },
  ],
  DE: [
    { label: 'Berlin', value: 'berlin' },
    { label: 'München', value: 'munich' },
    { label: 'Hamburg', value: 'hamburg' },
    { label: 'Frankfurt', value: 'frankfurt' },
    { label: 'Köln', value: 'cologne' },
    { label: 'Düsseldorf', value: 'dusseldorf' },
  ],
  UK: [
    { label: 'London', value: 'london' },
    { label: 'Manchester', value: 'manchester' },
    { label: 'Birmingham', value: 'birmingham' },
    { label: 'Edinburgh', value: 'edinburgh' },
    { label: 'Leeds', value: 'leeds' },
  ],
  FR: [
    { label: 'Paris', value: 'paris' },
    { label: 'Lyon', value: 'lyon' },
    { label: 'Marseille', value: 'marseille' },
    { label: 'Toulouse', value: 'toulouse' },
  ],
  NL: [
    { label: 'Amsterdam', value: 'amsterdam' },
    { label: 'Rotterdam', value: 'rotterdam' },
    { label: 'Den Haag', value: 'den-haag' },
  ],
  BE: [
    { label: 'Brüssel', value: 'brussels' },
    { label: 'Antwerpen', value: 'antwerp' },
    { label: 'Gent', value: 'ghent' },
  ],
  AT: [
    { label: 'Wien', value: 'vienna' },
    { label: 'Graz', value: 'graz' },
    { label: 'Salzburg', value: 'salzburg' },
  ],
  US: [
    { label: 'New York', value: 'new-york' },
    { label: 'Los Angeles', value: 'los-angeles' },
    { label: 'Chicago', value: 'chicago' },
    { label: 'Houston', value: 'houston' },
  ],
  AE: [
    { label: 'Dubai', value: 'dubai' },
    { label: 'Abu Dhabi', value: 'abu-dhabi' },
    { label: 'Sharjah', value: 'sharjah' },
  ],
  AZ: [
    { label: 'Bakü', value: 'baku' },
    { label: 'Gence', value: 'ganja' },
  ],
  SE: [
    { label: 'Stockholm', value: 'stockholm' },
    { label: 'Göteborg', value: 'gothenburg' },
  ],
  BG: [
    { label: 'Sofya', value: 'sofia' },
    { label: 'Plovdiv', value: 'plovdiv' },
  ],
};

function buildCityRows(): RefOptionRow[] {
  const rows: RefOptionRow[] = [];
  for (const [country, cities] of Object.entries(CITIES_BY_COUNTRY)) {
    cities.forEach((city, index) => {
      rows.push({
        id: `cities:${country}:${city.value}`,
        group: 'cities',
        parentKey: country,
        label: city.label,
        value: city.value,
        sortOrder: index,
      });
    });
  }
  return rows;
}

/** Form optionsFromApi — şehir vb. referans kayıtları */
export async function ensureReferenceDataSeeded(): Promise<void> {
  const db = getDb();
  const count = await db.refOptions.where('group').equals('cities').count();
  if (count > 0) return;
  await db.refOptions.bulkPut(buildCityRows());
}

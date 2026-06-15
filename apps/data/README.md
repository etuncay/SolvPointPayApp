# @epay/data — Mock backend katmanı

Gerçek .NET / API’ye geçmeden önce projenin **tarayıcı içi mock backend** paketidir. UI (`DynamicTable`, formlar) gerçek sunucu gibi `async` API çağrıları yapar; mock aşamada yanıtlar Dexie (IndexedDB) üzerinden üretilir.

## Sorumluluklar

| Dahil | Hariç |
|--------|--------|
| Veri modeli, seed, IndexedDB | Table/Form JSON config |
| `CustomersApi` sözleşmesi | React bileşenleri |
| Dexie adapter (varsayılan) | `@epay/ui` |
| HTTP adapter iskeleti | |
| Form referans verisi (`getCities` → `refOptions`) | |

Paylaşılan enum/tipler: **`@epay/domain`** (bu paket import eder ve gerektiğinde re-export eder).

Config dosyaları feature modülünde kalır (ör. `apps/management/.../playground/config/`).

## Mock kullanımı (şu an)

```ts
import { initMockDataLayer, customersApi, fetchCustomersList } from '@epay/data';

// Uygulama açılışında (bir kez)
await initMockDataLayer();

// DynamicTable api.method
await fetchCustomersList({ page: 1, pageSize: 15, ... });

// CRUD
await customersApi.getById('10001');
await customersApi.create({ ... });

// Form cascade (ülke → şehir)
await fetchFormReferenceOptions('getCities', 'TR');
```

Varsayılan: `configureDataLayer` çağrılmasa bile ilk istekte **Dexie** adapter devreye girer.

## Gerçek backend’e geçiş

1. `main.tsx` (veya auth sonrası bootstrap):

```ts
import { configureDataLayer } from '@epay/data';

configureDataLayer({
  driver: 'http',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
});
```

2. `createHttpCustomersAdapter` içindeki uçları (.NET API) sözleşmeye göre güncelleyin.
3. UI tarafında **değişmeyenler**: `config.api.method`, `fetchCustomersList`, form submit’te `createCustomer` / `updateCustomer`.
4. Liste yanıtı `TableApiResponse` ile uyumlu kalmalı:

```ts
{ data: [], total: number, success: true, meta?: { page, pageSize, count, totalPages, ... } }
```

## Port deseni

Diğer feature’lardaki `setXxxPort` ile aynı model:

```ts
import { setCustomersApiPort, createHttpCustomersAdapter } from '@epay/data';

setCustomersApiPort(createHttpCustomersAdapter('https://api.example.com'));
```

## HTTP uç yolları (iskelet)

`configureDataLayer({ driver: 'http', apiBaseUrl })` ile bağlanan adapter’lar:

### Müşteri portalı (`createHttpCustomerPortalAdapter`)

Base: `{apiBaseUrl}/customer-portal`

| Yöntem | Uç | Açıklama |
|--------|-----|----------|
| POST | `/customer-portal/auth/login` | Giriş |
| POST | `/customer-portal/auth/verify-otp` | OTP doğrulama |
| POST | `/customer-portal/auth/password-reset` | Parola sıfırlama |
| GET | `/customer-portal/profile` | Profil |
| GET | `/customer-portal/wallets` | Cüzdanlar |
| GET | `/customer-portal/transactions` | İşlem listesi (query params) |
| GET | `/customer-portal/transactions/:id` | İşlem detayı |
| GET | `/customer-portal/transactions/recent` | Son N işlem |
| GET/POST/PATCH/DELETE | `/customer-portal/recipients` | Kayıtlı alıcılar |
| GET | `/customer-portal/ibans` | Kendi IBAN'larım |
| GET | `/customer-portal/fees` | Ücret tablosu |
| GET | `/customer-portal/fx/quote` | FX kotasyonu |
| GET/PATCH | `/customer-portal/settings` | Ayarlar |
| POST | `/customer-portal/settings/change-password` | Parola değiştir |
| GET | `/customer-portal/receipts` | Dekont listesi |
| GET | `/customer-portal/receipts/:transactionId` | Dekont |
| GET | `/customer-portal/topup/instructions` | Para yükle talimatı |
| POST | `/customer-portal/support-cases` | Şikâyet/öneri |
| POST | `/customer-portal/transfers/draft` | Transfer taslağı |
| POST | `/customer-portal/transfers/approve` | OTP + onay |
| POST | `/customer-portal/transfers/:id/cancel` | İptal |

Tam liste: `apps/data/src/adapters/http/customer-portal-http.adapter.ts`

### Backoffice işlemler (`createHttpTransactionsAdapter`)

| Yöntem | Uç | Açıklama |
|--------|-----|----------|
| GET | `/transactions` | Aktif işlemler (`recordStatus === 1`) |
| GET | `/transactions?includeDeleted=1` | Tüm kayıtlar |
| GET | `/transactions/:id` | Tek işlem |
| PATCH | `/transactions/:id` | Durum güncelleme |
| PUT | `/transactions/:id` | Upsert |
| PUT | `/transactions/bulk` | Toplu seed/replace |
| GET | `/transactions/notes` veya `/transactions/:id/notes` | Not listesi |
| GET | `/transactions/documents` veya `/transactions/:id/documents` | Belge listesi |
| GET | `/transactions/blocks` veya `/transactions/:id/blocks` | Bloke listesi |
| GET | `/transactions/:id/blocks/active` | Aktif bloke |
| PUT | `/transactions/:txId/notes/:noteId` | Not upsert |
| PUT | `/transactions/:txId/blocks/:blockId` | Bloke upsert |

### Backoffice cüzdanlar (`createHttpWalletsAdapter`)

| Yöntem | Uç | Açıklama |
|--------|-----|----------|
| GET | `/wallets` | Aktif cüzdanlar (`recordStatus === 1`) |
| GET | `/wallets?includeDeleted=1` | Tüm kayıtlar |
| GET | `/wallets/:id` | Tek cüzdan |
| PUT | `/wallets/:id` | Upsert |
| PUT | `/wallets/bulk` | Toplu seed/replace |
| GET | `/wallets/notes` veya `/wallets/:id/notes` | Not listesi |
| GET | `/wallets/limits` veya `/wallets/:id/limits` | Limit listesi |
| GET | `/wallets/limit-history` veya `/wallets/:id/limit-history` | Limit geçmişi |
| GET | `/wallets/movements` veya `/wallets/:id/movements` | Hesap hareketleri |
| PUT | `/wallets/:walletId/notes/:noteId` | Not upsert |
| PUT | `/wallets/:walletId/limits/:limitId` | Limit upsert |
| POST | `/wallets/:walletId/limit-history` | Limit geçmişi ekle |

### Playground mock seed

Management/agent ortak fixture:

```ts
import { CUSTOMERS, TOP_AGENTS, buildBackOfficeWallets } from '@epay/data';

const wallets = buildBackOfficeWallets({ customers: CUSTOMERS, agents: TOP_AGENTS });
```

Alternatif alt yol: `@epay/data/seed-playground-mock-data`

## Geliştirme

```ts
import { resetPlaygroundDatabase } from '@epay/data';
await resetPlaygroundDatabase();
```

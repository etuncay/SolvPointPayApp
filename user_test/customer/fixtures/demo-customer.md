# Demo müşteri (Customer portal)

Kaynak: `apps/data/src/db/seed-customer-portal.ts`

| Alan | Değer |
|------|--------|
| Müşteri no | `CUS-4827193` |
| Parola | `Demo123!` |
| OTP (mock) | Herhangi 6 hane (ör. `123456`) |

## Cüzdanlar (özet)

- TRY ana cüzdan + USD/EUR cüzdanlar seed’de tanımlı
- Ana sayfada bakiye kartları ve son işlemler listelenir

## Notlar

- Oturum: `localStorage` + `AuthProvider` (mock Dexie adapter)
- `VITE_DATA_DRIVER=http` → `VITE_API_BASE_URL` gerekir; uçlar `customer-portal-http.adapter` ile hizalı

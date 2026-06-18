# Demo müşteri (Customer portal)

Kaynak: `apps/data/src/db/seed-customer-portal.ts`

| Alan | Değer |
|------|--------|
| Müşteri no | `CUS-4827193` |
| Parola | `Demo123!` |
| OTP (mock) | `123456` (birincil; `000000` da kabul) |

Login ve transfer onayında aynı `DemoOtpHint` bileşeni (`apps/customer/src/components/DemoOtpHint.tsx`).

## Cüzdanlar (özet)

- TRY ana cüzdan + USD/EUR cüzdanlar seed’de tanımlı
- Ana sayfada bakiye kartları ve son işlemler listelenir

## Oturum (demo)

| Anahtar | Depo | Ne zaman |
|---------|------|----------|
| `epay-customer-authed` | `sessionStorage` | OTP başarılı → `'1'` |
| `epay-customer-login-identity` | `sessionStorage` | Login adımı sonrası |

**Geliştirici notu:** `sessionStorage.setItem('epay-customer-authed', '1')` ile bypass edilebilir — yalnızca mock ortamı; üretimde API oturumu.

Login ekranında demo modda bu uyarı `LoginDevDemoNote` ile gösterilir.

## Notlar

- Oturum: `sessionStorage` + `AuthProvider` (mock Dexie adapter)
- `VITE_DATA_DRIVER=http` + `VITE_API_BASE_URL` → demo notları gizlenir; varsayılan parola boş

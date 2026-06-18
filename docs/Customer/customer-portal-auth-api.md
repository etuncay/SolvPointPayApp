# Müşteri portalı — kimlik doğrulama API sözleşmesi

Production (`driver: 'http'`) modunda OTP doğrulama, oturum yönetimi ve parola hash işlemleri **yalnızca sunucuda** yapılır. Tarayıcı mock (Dexie) modunda sabit OTP ve düz metin demo parolası kullanılır; bu davranış production'da devre dışıdır.

Base path: `{apiBaseUrl}/customer-portal`

Tüm isteklerde `credentials: 'include'` (HttpOnly session cookie).

## Oturum

| Yöntem | Uç | Açıklama |
|--------|-----|----------|
| GET | `/auth/me` | Aktif oturum profili. 401 → oturum yok. |
| POST | `/auth/logout` | Oturumu sonlandırır; cookie temizlenir. |

Uygulama açılışında `GET /auth/me` ile oturum bootstrap edilir (`AuthProvider.getSessionProfile`). Mock modda `sessionStorage` bayrağı kullanılır.

## Giriş akışı

### 1. POST `/auth/login`

```json
{ "identity": "CUS-4827193", "password": "…", "taxNo": "…" }
```

| HTTP | Gövde | Anlam |
|------|-------|-------|
| 200 | `{ "ok": true, "requiresOtp": true }` | Parola doğru; OTP gönderildi |
| 401 | — | Kimlik veya parola hatalı |
| 403 | `{ "errorCode": "no_persistent_wallet" }` | Kalıcı cüzdanı olmayan müşteri |

**Sunucu sorumlulukları**

- Parolayı veritabanındaki **bcrypt veya argon2** hash ile karşılaştır; düz metin saklama.
- Başarısız girişlerde rate limit / lockout.
- OTP kanalına (SMS/e-posta) tek kullanımlık kod üret; süre ve deneme limiti uygula.
- OTP kodunu istemciye veya loglara yazma.

### 2. POST `/auth/verify-otp`

```json
{ "identity": "CUS-4827193", "otp": "123456" }
```

| HTTP | Gövde | Anlam |
|------|-------|-------|
| 200 | `{ "ok": true, "profile": { … } }` | OTP doğru; HttpOnly session cookie set |
| 401 | — | OTP hatalı veya süresi dolmuş |

Doğrulama sonrası sunucu güvenli session cookie set eder (`Secure`, `HttpOnly`, `SameSite=Lax` veya `Strict`).

### 3. POST `/auth/password-reset`

```json
{ "email": "musteri@ornek.com" }
```

Her zaman `{ "ok": true }` (kullanıcı var/yok bilgisi sızdırma).

## Korunan uçlar

`/profile`, `/wallets`, transfer ve ayar uçları geçerli session cookie gerektirir. 401 → istemci login'e yönlendirir.

## Parola değiştirme

`POST /settings/change-password` — mevcut parola sunucuda hash ile doğrulanır; yeni parola hash'lenerek saklanır.

## Mock vs production

| Konu | Mock (Dexie) | Production (HTTP) |
|------|--------------|-------------------|
| Parola | `DEMO_CUSTOMER_PASSWORD` düz metin | Sunucu hash |
| OTP | Sabit `123456` / `000000` | Sunucu üretimi |
| Oturum | Bellek + `sessionStorage` | HttpOnly cookie |
| Bootstrap | `epay-customer-authed` bayrağı | `GET /auth/me` |

İstemci: `apps/customer/src/app/AuthProvider.tsx`, `apps/data/src/adapters/http/customer-portal-http.adapter.ts`.

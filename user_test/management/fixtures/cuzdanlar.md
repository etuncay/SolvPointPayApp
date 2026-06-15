---
app: management
slug: cuzdanlar
purpose: Dijital Cüzdanlar modülü (4, 4.1, 4.2) manuel ekran testleri için ortak mock veri ve rol referansı
source: apps/management/src/mocks + features/wallets/api
updated: 2026-06-01
---

# Fixture — Dijital Cüzdanlar (4, 4.1, 4.2)

Gerçek TCKN/IBAN **kullanmayın**; aşağıdaki değerler yalnızca mock seed içindir.

## Ortam

| Alan | Değer |
|------|-------|
| Uygulama | `@epay/management` |
| Dev komutu | `pnpm --filter @epay/management dev` |
| Varsayılan URL | `http://localhost:5173` (meşgulse Vite `5174+` seçer; terminal çıktısına bakın) |
| Oturum | `sessionStorage` `epay-auth-session` — demo: `compliance@epay.demo` / `Epay.1234` |
| Rol depolama | `epay-backoffice-role` |
| Rol URL override | `?role=ops` \| `finance` \| `compliance` \| `management` |

## Roller — liste görünürlüğü (§3)

| Rol | Müşteri cüzdanı | Temsilci cüzdanı | Sistem cüzdanı | Export (4) |
|-----|------------------|------------------|----------------|------------|
| `ops` | Evet | Evet | Hayır | Evet |
| `finance` | Hayır | Hayır | Evet (~10) | Rol matrisine göre |
| `compliance` | Evet | Evet | Evet | Evet |
| `management` | Evet | Evet | Evet | Evet |

## Örnek cüzdanlar

| ID | Hesap No | Kategori | Sahip | Not |
|----|----------|----------|-------|-----|
| `11` | `MS-9901-01` | customer | Müşteri `#99901` (Caner Avcı) | Menü deep-link; detay/aktivite testi |
| `1`–`10` | `SYS-*` | system | — | Finance listesinde görünür; kişi alanları `—` |
| `DELETED-*` | — | — | — | `recordStatus=0`; listede **görünmez** (vitest) |

## Detay (4.1) — yetki özeti

| Rol | Limit düzenle | Bakiye blokesi | Not ekle |
|-----|---------------|----------------|----------|
| `ops` | Evet (müşteri/temsilci) | Evet | Evet |
| `finance` | Hayır | Hayır | Hayır |
| `compliance` | Evet | Evet | Evet |
| `management` | Evet | Evet | Evet |

Tam bloke: `blockedAmount = -1` → `available = 0` (domain + adapter test).

## Aktiviteler (4.2)

| Senaryo | Beklenen |
|---------|----------|
| `walletId=11` | Yalnızca 11 numaralı cüzdan hareketleri |
| Inflow | `direction=Inflow`, `amount > 0` |
| `postBalance` | Sayısal, movement ile uyumlu |
| Finance + sistem cüzdanı | Erişim var |
| Ops + yasak cüzdan | `wa_wallet_forbidden` |

## Menü deep-link

`config/wallet-menu-demo.ts` → ilk müşteri cüzdanı (`id` genelde `11`):

- Detay: `/wallets/11`
- Aktiviteler: `/wallets/11/activities`

## Otomasyon

```bash
pnpm --filter @epay/management exec vitest run src/features/wallets
```

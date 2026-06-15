---
app: management
slug: para-transferleri
purpose: Para Transferleri modülü (5, 5.1, 5.2) manuel ekran testleri için ortak mock veri ve rol referansı
source: apps/management/src/mocks/transactions.ts + features/transfers/api
updated: 2026-06-01
---

# Fixture — Para Transferleri (5, 5.1, 5.2)

## Ortam

| Alan | Değer |
|------|-------|
| Uygulama | `@epay/management` |
| Dev komutu | `pnpm --filter @epay/management dev` |
| Varsayılan URL | `http://localhost:5173` (meşgulse Vite `5174+`) |
| Oturum | Demo: `compliance@epay.demo` / `ops@epay.demo` — parola `Epay.1234` |
| Rol | `sessionStorage` `epay-backoffice-role` veya `?role=...` |

## Roller — özet

| Rol | 5 Liste | 5.1 Müdahale | 5.2 Form |
|-----|---------|--------------|----------|
| `ops` | list, export | hold/unblock/cancel | insert, submit |
| `finance` | list, export | **view only** | **yok** |
| `compliance` | list, export | hold/unblock/cancel | **yok** |
| `management` | list, export | tam | insert, submit |

## Örnek işlemler

| ID | İşlem No | Durum | Not |
|----|----------|-------|-----|
| `1` | `TX-2026050001` | Pending | Detay: Bloke Et + İptal; menü deep-link |
| Demo | `TX-2024-001` | Completed | Uluslararası / IBAN dolu senaryo |
| — | `TX-DELETED-002` | — | `recordStatus=0`; listede görünmez |

## Dashboard deep link

| URL | Filtre |
|-----|--------|
| `/transfers?status=pending` | Pending |
| `/transfers?status=aml` | OnHold |
| `/transfers?status=rejected` | Cancelled |

## 5.2 düzeltme

| Alan | Değer |
|------|-------|
| Reserve max (TRY) | `500_000` — `cr_reserve_max_exceeded` |
| Onay eşiği | `100_000` TRY eşdeğeri → 2 onay |
| `correction_reason` | Refund, Cancellation, OperationalError, … |

## Cüzdan / aktivite bağlantısı

- 4.2 satır tıklama → `/transfers/:transactionId`
- 5.1 cüzdan link → `/wallets/:walletId` (ör. `MS-9901-01` → id `11`)

## Otomasyon

```bash
pnpm --filter @epay/management exec vitest run src/features/transfers
```

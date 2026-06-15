---
app: management
slug: bankalar
purpose: Bankalar modülü (6, 6.1–6.4) manuel ekran testleri için ortak mock veri ve rol referansı
source: apps/management/src/mocks/integrated-banks.ts, company-bank-accounts.ts, bank-account-movements.ts, bank-reconciliations.ts
updated: 2026-06-01
---

# Fixture — Bankalar (6, 6.1–6.4)

## Ortam

| Alan | Değer |
|------|-------|
| Uygulama | `@epay/management` |
| Dev komutu | `pnpm --filter @epay/management dev` |
| Varsayılan URL | `http://localhost:5173` (meşgulse Vite `5174+`) |
| Oturum | Demo: `finance@epay.demo` / `ops@epay.demo` — parola `Epay.1234` |
| Rol | Oturum açıkken **hesap rolü** esas; test için `finance@epay.demo` veya `ops@epay.demo` |

## Menü görünürlüğü (plan 6)

| Rol | 6.1 | 6.2 | 6.3 | 6.4 |
|-----|-----|-----|-----|-----|
| `finance` / `management` | ✓ | ✓ | ✓ | ✓ |
| `ops` | — | — | ✓ | ✓ |
| `compliance` | — | — | — | — (grup gizli) |

## 6.1 — Entegre bankalar (seed)

| Banka | Senaryo |
|-------|---------|
| Ziraat Bankası | Varsayılan EFT + IBAN check |
| Garanti BBVA | Varsayılan Fast |
| Türkiye İş Bankası | Aktif, varsayılan değil |
| VakıfBank | `Inactive` |
| Halkbank | EFT saatleri 09:00–17:00 |

## 6.2 — Firma hesapları

| ID | Banka | IBAN (kısaltılmış) | Tip |
|----|-------|-------------------|-----|
| 1 | Ziraat | `TR33…1326` | Current TRY |
| 2 | Garanti | `TR32…4567` | Current USD |
| 3 | Koruma | Protection | Pasif demo |

Geçerli TR IBAN örneği (checksum): `TR330006100519786457841326`

## 6.3 — Hareketler

- Salt-okunur; `payment_status` chip filtreleri: Beklemede, Tamamlandı, Başarısız, İade
- Cüzdan hareketleri (`wallet-account-movements`) **ayrı** mock — karıştırılmaz

## 6.4 — Mutabakat

| Talep No | Durum | Not |
|----------|-------|-----|
| `SC-6001` | Unmatched | Uyarı satırı + destek linki |
| `SC-6002` | PendingReview | — |
| `Mutabakat Çalıştır` | finance/management | ops’ta buton yok |

Destek detay: `/support/cases/:caseId` (stub)

## Otomasyon

```bash
pnpm --filter @epay/management exec vitest run src/features/banks   # 50 passed
pnpm --filter @epay/management build
```

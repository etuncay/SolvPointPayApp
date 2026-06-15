---
app: management
slug: operasyonel-surecler
purpose: Operasyonel Süreç Yönetimi (8, 8.1–8.6) manuel testleri için ortak mock veri ve rol referansı
source: apps/management/src/features/operational-processes + approval-pool + kyc-management
updated: 2026-06-01
---

# Fixture — Operasyonel Süreçler (8.x)

## Ortam

| Alan | Değer |
|------|-------|
| Uygulama | `@epay/management` |
| Dev | `pnpm --filter @epay/management dev` |
| URL | `http://localhost:5173` (meşgulse `5174+`) |
| Oturum | `ops@epay.demo`, `compliance@epay.demo`, `finance@epay.demo` — parola `Epay.1234` |

## Menü görünürlüğü (plan 8)

| Rol | 8.1 Onay | 8.2 KYC | 8.3 Muhasebe | 8.4 BTRANS | 8.5 Fin. Mutabakat | 8.6 FX |
|-----|----------|---------|--------------|------------|-------------------|--------|
| `ops` | ✓ | — | — | — | — | — |
| `compliance` | — | ✓ (badge) | — | — | — | — |
| `finance` / `management` | — | — | ✓ | ✓ | ✓ | ✓ |

`/ops` → ilk görünür alt menüye yönlendirir.

## Örnek kayıtlar

| Modül | Route | Not |
|-------|-------|-----|
| 8.1 | `/approvals`, `/approvals/:id` | Maker-checker kuyruk |
| 8.2 | `/ops/kyc`, `/ops/kyc/:reviewId` | Açık KYC badge menüde |
| 8.3 | `/ops/accounting` | Entegrasyon yaşam döngüsü |
| 8.4 | `/ops/btrans` | BTRANS rapor entegrasyonu |
| 8.5 | `/ops/reconciliation` | Finansal mutabakat |
| 8.6 | `/ops/fx` | Kur + marj + onay köprüsü |

## Otomasyon

```bash
pnpm --filter @epay/management exec vitest run src/features/operational-processes src/features/approval-pool src/features/kyc-management   # 75 passed
pnpm --filter @epay/management build
```

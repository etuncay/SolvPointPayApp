---
app: management
module: operasyonel-surecler
date: 2026-06-01
tester: agent
environment: local dev (build verified)
---

# Run — Operasyonel Süreçler (8, 8.1–8.6)

## Kod değişikliği

| Dosya | Değişiklik |
|-------|------------|
| `features/operational-processes/index.ts` | Sayfa export'ları eklendi |
| `features/approval-pool/index.ts` | Barrel (yeni) |
| `routes.tsx` | Tüm 8.x placeholder → gerçek sayfalar |

## Otomasyon

| Komut | Sonuç |
|-------|-------|
| `vitest run operational-processes approval-pool kyc-management` | **75/75** |
| `pnpm --filter @epay/management build` | Başarılı |

## Manuel (özet)

| Rol | Route | Beklenen |
|-----|-------|----------|
| ops | `/approvals` | Onay havuzu listesi |
| compliance | `/ops/kyc` | KYC kuyruk |
| finance | `/ops/accounting`, `/ops/btrans`, `/ops/reconciliation`, `/ops/fx` | Finans modülleri |

## Sonuç

**Kabul edildi**

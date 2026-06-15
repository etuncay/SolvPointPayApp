---
app: management
module: para-transferleri
date: 2026-06-01
tester: agent
environment: local dev (port 5176)
---

# Run — Para Transferleri (5, 5.1, 5.2)

## Kod değişikliği

| Dosya | Değişiklik |
|-------|------------|
| `features/transfers/index.ts` | Barrel export |
| `routes.tsx` | Placeholder → `TransfersPage`, `TransactionDetailPage`, `ManualCorrectionPage` |

## Otomasyon

| Komut | Sonuç |
|-------|-------|
| `vitest run src/features/transfers` | **27/27** geçti |
| `pnpm --filter @epay/management build` | Başarılı |

## Manuel

| Senaryo | Sonuç |
|---------|-------|
| `/transfers` — başlık + status chip | Geçti |
| `/transfers?status=pending` | Geçti |
| `/transfers/1` — Pending, Bloke/İptal, paneller | Geçti |
| `/transfers/manual` compliance | Erişim Yok (beklenen) |
| `/transfers/manual` ops | Form + Onaya Gönder | Geçti |

## Sonuç

**Kabul edildi**

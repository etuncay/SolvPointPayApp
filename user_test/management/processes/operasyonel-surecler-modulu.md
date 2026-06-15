---
app: management
screen: operasyonel-surecler-modulu-index
route: /ops
updated: 2026-06-01
status: ready
---

# Operasyonel Süreçler — İndeks (8, 8.1–8.6)

## Genel ön koşullar

- [x] `pnpm --filter @epay/management dev`
- [x] Fixture: [`fixtures/operasyonel-surecler.md`](../fixtures/operasyonel-surecler.md)

## Süreç dosyaları

| No | Ekran | Süreç | Route |
|----|-------|-------|-------|
| 8 Menü | [08-operasyonel-surec-yonetimi.md](08-operasyonel-surec-yonetimi.md) | `/ops` → redirect |
| 8.1 | [08.1-onay-havuzu.md](08.1-onay-havuzu.md) | `/approvals` |
| 8.2 | [08.2-kyc-yonetimi.md](08.2-kyc-yonetimi.md) | `/ops/kyc` |
| 8.3 | [08.3-muhasebe-entegrasyon.md](08.3-muhasebe-entegrasyon.md) | `/ops/accounting` |
| 8.4 | [08.4-btrans-raporlari.md](08.4-btrans-raporlari.md) | `/ops/btrans` |
| 8.5 | [08.5-finansal-mutabakat.md](08.5-finansal-mutabakat.md) | `/ops/reconciliation` |
| 8.6 | [08.6-kur-fx-yonetimi.md](08.6-kur-fx-yonetimi.md) | `/ops/fx` |

Run: [`runs/2026-06-01-operasyonel-surecler.md`](../runs/2026-06-01-operasyonel-surecler.md)

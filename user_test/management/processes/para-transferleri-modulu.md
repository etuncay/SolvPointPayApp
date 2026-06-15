---
app: management
screen: para-transferleri-modulu-index
route: /transfers
updated: 2026-06-01
status: ready
---

# Para Transferleri — İndeks (5, 5.1, 5.2)

Modül bazlı süreç dosyalarına giriş.

## Genel ön koşullar

- [x] `pnpm --filter @epay/management dev`
- [x] Fixture: [`fixtures/para-transferleri.md`](../fixtures/para-transferleri.md)

## Süreç dosyaları

| No | Ekran | Süreç | Route |
|----|-------|-------|-------|
| 5 | Para transferleri listesi | [05-para-transferleri.md](05-para-transferleri.md) | `/transfers` |
| 5.1 | İşlem detay | [05.1-islem-detay.md](05.1-islem-detay.md) | `/transfers/:transactionId` |
| 5.2 | İade / iptal / düzeltme | [05.2-iade-iptal-duzeltme.md](05.2-iade-iptal-duzeltme.md) | `/transfers/manual` |

Menü: **Operasyon → Para Transferleri** (5.1 deep-link, 5.2 alt link).

## Uçtan uca akış

1. [05-para-transferleri.md](05-para-transferleri.md) — liste + `?status=pending`
2. [05.1-islem-detay.md](05.1-islem-detay.md) — Pending müdahale
3. [05.2-iade-iptal-duzeltme.md](05.2-iade-iptal-duzeltme.md) — `ops` rolü; draft → 5.1 → onay

## Otomasyon

```bash
pnpm --filter @epay/management exec vitest run src/features/transfers   # 27 passed
pnpm --filter @epay/management build
```

Run: [`runs/2026-06-01-para-transferleri.md`](../runs/2026-06-01-para-transferleri.md)

## Kod kökü

`apps/management/src/features/transfers/`

---
app: management
screen: dokuman-yonetim-sistemi-modulu-index
route: /documents
updated: 2026-06-01
status: ready
---

# Doküman Yönetim Sistemi — İndeks (9, 9.1–9.4)

## Genel ön koşullar

- [x] `pnpm --filter @epay/management dev`
- [x] Fixture: [`fixtures/dokuman-yonetim-sistemi.md`](../fixtures/dokuman-yonetim-sistemi.md)

## Süreç dosyaları

| No | Ekran | Süreç | Route |
|----|-------|-------|-------|
| 9 | Merkezi liste | [09-dokuman-yonetim-sistemi.md](09-dokuman-yonetim-sistemi.md) | `/documents` |
| 9.1 | Yeni doküman | [09.1-yeni-dokuman-ekle.md](09.1-yeni-dokuman-ekle.md) | `/documents/new` |
| 9.2 | Doküman detay | [09.2-dokuman-detay.md](09.2-dokuman-detay.md) | `/documents/:documentId` |
| 9.3 | Doküman tipleri | [09.3-dokuman-tipleri.md](09.3-dokuman-tipleri.md) | `/documents/types` |
| 9.4 | Tip tanımlama | [09.4-yeni-dokuman-tipi-tanimlama.md](09.4-yeni-dokuman-tipi-tanimlama.md) | `/documents/types/new`, `.../edit` |

Menü: **Doküman Yönetim Sistemi**

## Otomasyon

```bash
pnpm --filter @epay/management exec vitest run src/features/dms
pnpm --filter @epay/management build
```

Run: [`runs/2026-06-01-dokuman-yonetim-sistemi.md`](../runs/2026-06-01-dokuman-yonetim-sistemi.md)

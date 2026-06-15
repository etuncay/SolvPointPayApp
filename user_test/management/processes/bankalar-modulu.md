---
app: management
screen: bankalar-modulu-index
route: /banks
updated: 2026-06-01
status: ready
---

# Bankalar — İndeks (6, 6.1–6.4)

Modül bazlı süreç dosyalarına giriş.

## Genel ön koşullar

- [x] `pnpm --filter @epay/management dev`
- [x] Fixture: [`fixtures/bankalar.md`](../fixtures/bankalar.md)

## Süreç dosyaları

| No | Ekran | Süreç | Route |
|----|-------|-------|-------|
| 6 | Menü grubu | [06-bankalar-menu.md](06-bankalar-menu.md) | `/banks` → ilk alt |
| 6.1 | Entegre bankalar | [06.1-entegre-bankalar.md](06.1-entegre-bankalar.md) | `/banks/integrated` |
| 6.2 | Hesap bilgileri | [06.2-banka-hesap-bilgileri.md](06.2-banka-hesap-bilgileri.md) | `/banks/accounts` |
| 6.3 | Hesap hareketleri | [06.3-banka-hesap-hareketleri.md](06.3-banka-hesap-hareketleri.md) | `/banks/movements` |
| 6.4 | Banka mutabakatı | [06.4-banka-mutabakati.md](06.4-banka-mutabakati.md) | `/banks/reconciliation` |

Menü: **Operasyon → Bankalar**

## Uçtan uca akış (finance)

1. [06.1-entegre-bankalar.md](06.1-entegre-bankalar.md) — entegre banka tanımı
2. [06.2-banka-hesap-bilgileri.md](06.2-banka-hesap-bilgileri.md) — firma IBAN + bakiye
3. [06.3-banka-hesap-hareketleri.md](06.3-banka-hesap-hareketleri.md) — salt-okunur hareket listesi
4. [06.4-banka-mutabakati.md](06.4-banka-mutabakati.md) — mutabakat batch + talep linki

## Otomasyon

```bash
pnpm --filter @epay/management exec vitest run src/features/banks   # 50 passed
pnpm --filter @epay/management build
```

Run kaydı: [`runs/2026-06-01-bankalar.md`](../runs/2026-06-01-bankalar.md)

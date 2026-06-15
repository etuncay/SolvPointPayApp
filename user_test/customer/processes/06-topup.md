---
app: customer
screen: topup
route: /topup
updated: 2026-06-02
status: ready
---

# Para yükle

## Amaç

Banka havalesi talimat adımları, IBAN/kopyalama ve uyarı metinleri.

## Ön koşullar

- [ ] Oturum açık
- [ ] Fixture: [demo-customer.md](../fixtures/demo-customer.md)

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/topup` aç | 4 adımlı akış (stepper) |
| 2 | Talimat alanlarını incele | IBAN, alıcı unvanı, referans |
| 3 | Kopyala butonuna tıkla | Panoya kopya (veya sessiz hata) |
| 4 | Adımlar arası ilerle | Her adımda içerik güncellenir |

## Checklist

- [x] Talimat + kopyala (run 2026-06-02)
- [ ] 4 adım stepper tam tur
- [ ] Referans no müşteri no ile ilişkili

## İlgili kod

- `apps/customer/src/features/topup/TopupPage.tsx`

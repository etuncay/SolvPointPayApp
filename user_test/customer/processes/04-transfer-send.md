---
app: customer
screen: send-hub
route: /send
updated: 2026-06-02
status: ready
---

# Para gönder (hub + yurt içi)

## Amaç

Gönder hub menüsü, yurt içi transfer formu, onay akışına (`/confirm`) geçiş.

## Ön koşullar

- [ ] Oturum açık
- [ ] Fixture: [demo-customer.md](../fixtures/demo-customer.md)

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/send` aç | Yurt içi / yurt dışı / kayıtlı kişiler linkleri |
| 2 | Yurt içi → `/send/domestic` | Kaynak cüzdan, alıcı, tutar |
| 3 | Form doldur, devam | `/confirm` özet |
| 4 | Onayla — **Demo OTP: 123456** kutusu | `/success` |

## Checklist

- [x] Form → confirm → success (run 2026-06-02, ₺100)
- [ ] Ücret tablosu görünür (özet paneli)
- [ ] Yetersiz bakiye uyarısı (düşük tutar testi)

## İlgili kod

- `apps/customer/src/features/transfer/SendHubPage.tsx`
- `apps/customer/src/features/transfer/DomesticTransferPage.tsx`
- `apps/customer/src/features/transfer/ConfirmPage.tsx`

---
app: customer
screen: intl-transfer
route: /send/intl
updated: 2026-06-02
status: ready
---

# Yurt dışına para gönder

## Amaç

Ülke/para birimi, FX önizleme, riskli ülke uyarısı ve onay akışı.

## Ön koşullar

- [ ] Oturum açık
- [ ] Fixture: [demo-customer.md](../fixtures/demo-customer.md)

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | Para Gönder → Yurt Dışına | `/send/intl` |
| 2 | Kaynak cüzdan + ülke seç | Kur/satır güncellenir |
| 3 | Alıcı ve tutar doldur | Ücret tablosu |
| 4 | Devam | `/confirm` |
| 5 | (Opsiyonel) BAE/Suudi seç | Risk uyarı banner |

## Checklist

- [x] FX + Şimdi yenile + BAE risk banner (run 2026-06-02)
- [x] Form → `/confirm` (run 2026-06-02, BAE)
- [ ] confirm → success (tam OTP)

## İlgili kod

- `apps/customer/src/features/transfer/IntlTransferPage.tsx`

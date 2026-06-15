---
app: customer
screen: receive
route: /receive
updated: 2026-06-02
status: ready
---

# Para al (talep)

## Amaç

Kayıtlı IBAN seçimi, tutar girişi ve onay akışına (`/confirm`) geçiş.

## Ön koşullar

- [ ] Oturum açık
- [ ] Fixture: [demo-customer.md](../fixtures/demo-customer.md)

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/receive` aç | IBAN listesi + tutar alanı |
| 2 | IBAN seç, tutar gir | Devam butonu aktif |
| 3 | İncelemeye gönder | `/confirm` (receive tipi) |

## Checklist

- [x] IBAN seçimi + `/confirm` (run 2026-06-02)
- [ ] Geçersiz tutarda buton pasif

## İlgili kod

- `apps/customer/src/features/transfer/ReceivePage.tsx`

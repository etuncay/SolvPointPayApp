---
app: customer
screen: recipients
route: /send/recipients
updated: 2026-06-02
status: ready
---

# Kayıtlı kişilerim

## Amaç

Kayıtlı alıcı listesi, arama ve yurt içi gönderime yönlendirme.

## Ön koşullar

- [ ] Oturum açık

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/send/recipients` aç | Alıcı kartları / liste |
| 2 | Ara | Filtrelenmiş sonuç |
| 3 | Gönder → seçili alıcı | `/send/domestic` prefill |

## İlgili kod

- `apps/customer/src/features/transfer/RecipientsPage.tsx`

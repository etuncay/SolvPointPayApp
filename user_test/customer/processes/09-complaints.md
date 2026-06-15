---
app: customer
screen: complaints
route: /complaints
updated: 2026-06-02
status: ready
---

# Dilek, şikâyet ve öneriler

## Amaç

Destek talebi formu, konu seçimi ve gönderim onayı.

## Ön koşullar

- [ ] Oturum açık

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/complaints` aç | Form alanları |
| 2 | Konu + açıklama doldur | Gönder aktif |
| 3 | Gönder | Başarı mesajı / toast |

## İlgili kod

- `apps/customer/src/features/complaints/ComplaintPage.tsx`

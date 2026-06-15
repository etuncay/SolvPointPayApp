---
app: customer
screen: activity
route: /activity
updated: 2026-06-02
status: ready
---

# Hesap hareketleri

## Amaç

İşlem listesi, filtreler, satır detayı (modal).

## Ön koşullar

- [ ] Oturum açık
- [ ] Fixture: [demo-customer.md](../fixtures/demo-customer.md)

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/activity` aç | Tablo / kart listesi |
| 2 | Yön filtresi (gelen/giden) | Liste güncellenir |
| 3 | Satır detayı aç | TxDetailModal alanları dolu |

## Checklist

- [ ] Boş filtre sonucu uygun mesaj
- [ ] Referans no / tutar görünür

## İlgili kod

- `apps/customer/src/features/activity/ActivityPage.tsx`
- `apps/customer/src/features/activity/TxDetailModal.tsx`

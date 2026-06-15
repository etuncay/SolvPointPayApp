---
app: customer
screen: home
route: /
updated: 2026-06-02
status: ready
---

# Ana sayfa

## Amaç

Cüzdan kartları, hızlı aksiyonlar (yükle / gönder / al), son işlemler özeti.

## Ön koşullar

- [ ] Oturum açık ([01-login.md](01-login.md))
- [ ] Fixture: [demo-customer.md](../fixtures/demo-customer.md)

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/` aç | Karşılama + cüzdan carousel |
| 2 | Para Yükle | `/topup` |
| 3 | Para Gönder | `/send` hub |
| 4 | Son işlem satırına tıkla | Detay modal veya activity’ye link |

## Checklist

- [ ] TRY bakiye formatı (locale)
- [ ] Nav: Activity, Settings erişilebilir

## İlgili kod

- `apps/customer/src/features/home/HomePage.tsx`

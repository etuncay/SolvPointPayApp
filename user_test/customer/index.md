---
app: customer
code: apps/customer
dev_url: http://localhost:5174
updated: 2026-06-02
status: ready
---

# Customer — ekran testleri

Müşteri self-servis portalı (`apps/customer`). Veri katmanı: `@epay/data` (Dexie mock; `VITE_DATA_DRIVER=http` ile HTTP iskelet).

```text
customer/
├── processes/     # Ekran süreçleri
├── fixtures/      # Demo müşteri / OTP
└── runs/          # Koşu kayıtları
```

## Dev sunucu

```bash
pnpm --filter @epay/customer dev
```

Varsayılan URL: **http://localhost:5174** (meşgulse Vite 5175+ seçer; terminal çıktısına bakın)

## Süreçler

| Ekran | Route | Süreç |
|-------|-------|--------|
| Giriş / OTP | `/login` | [processes/01-login.md](processes/01-login.md) |
| Ana sayfa | `/` | [processes/02-home.md](processes/02-home.md) |
| Hesap hareketleri | `/activity` | [processes/03-activity.md](processes/03-activity.md) |
| Para gönder (hub) | `/send` | [processes/04-transfer-send.md](processes/04-transfer-send.md) |
| Ayarlar | `/settings` | [processes/05-settings.md](processes/05-settings.md) |
| Para yükle | `/topup` | [processes/06-topup.md](processes/06-topup.md) |
| Para al | `/receive` | [processes/07-receive.md](processes/07-receive.md) |
| Yurt dışına | `/send/intl` | [processes/08-transfer-intl.md](processes/08-transfer-intl.md) |
| Dilek & şikâyet | `/complaints` | [processes/09-complaints.md](processes/09-complaints.md) |
| Kayıtlı kişiler | `/send/recipients` | [processes/10-recipients.md](processes/10-recipients.md) |

## Fixture

- [fixtures/demo-customer.md](fixtures/demo-customer.md)

## Son koşular

- [runs/2026-06-02-customer-portal.md](runs/2026-06-02-customer-portal.md) — auth, activity, domestic, settings
- [runs/2026-06-02-topup-receive-intl.md](runs/2026-06-02-topup-receive-intl.md) — topup, receive, intl
- [runs/2026-06-02-complaints-recipients.md](runs/2026-06-02-complaints-recipients.md) — complaints, recipients

## Şablon

[`../_templates/customer/process.template.md`](../_templates/customer/process.template.md)

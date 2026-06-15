---
app: agent
code: apps/agent
dev_url: http://localhost:5176
dev_command: pnpm --filter @epay/agent dev
updated: 2026-05-31
---

# Agent — ekran testleri

Temsilci uygulaması (`@epay/agent`) manuel test süreçleri.

## Süreçler

| Ekran | Route | Dosya | Feature |
|-------|-------|-------|---------|
| Ana sayfa | `/` | [processes/dashboard.md](processes/dashboard.md) | `features/dashboard` |
| Hesaplarım | `/accounts` | [processes/accounts.md](processes/accounts.md) | `features/accounts` |
| Bireysel müşteri kaydı | `/customers/new` | [processes/customer-registration.md](processes/customer-registration.md) | `features/customer-registration` |
| Müşteri arama & görüntüleme | `/customers` | [processes/customer-search.md](processes/customer-search.md) | `features/customer-search` |
| Para çekme | `/withdrawal` | [processes/withdrawal.md](processes/withdrawal.md) | `features/withdrawal` |
| İşlem onay / detay | `/transactions/:id` | [processes/transaction-confirmation.md](processes/transaction-confirmation.md) | `features/transaction-confirmation` |

## Fixture'lar (müşteri)

| Slug | TCKN | Amaç |
|------|------|------|
| [demo-caner-avci](fixtures/customers/demo-caner-avci.md) | 75683988090 | Lookup — normal |
| [demo-hatice-acar](fixtures/customers/demo-hatice-acar.md) | 99988877760 | Pending transfer kilidi |
| [demo-yeni-kayit-ocr](fixtures/customers/demo-yeni-kayit-ocr.md) | 12345678901 | Yeni kayıt + OCR |

Seed: `apps/data/src/db/seed-registration.ts`

## Run kayıtları

`runs/YYYY-MM-DD-{screen-slug}.md`

## Şablon

- Süreç: [`../_templates/agent/process.template.md`](../_templates/agent/process.template.md)
- Müşteri fixture: [`../_templates/agent/customer-fixture.template.md`](../_templates/agent/customer-fixture.template.md)

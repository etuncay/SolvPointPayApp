---
app: agent
code: apps/agent
dev_url: http://localhost:5176
dev_command: pnpm --filter @epay/agent dev
updated: 2026-06-18
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
| Para transferi | `/transfers/*` | [processes/agent-transfers.md](processes/agent-transfers.md) | `features/agent-transfers` |
| İşlem onay / detay | `/transactions/:id` | [processes/transaction-confirmation.md](processes/transaction-confirmation.md) | `features/transaction-confirmation` |

## Uyumluluk (sanction / blocked / KYC)

Merkezi senaryo listesi: [fixtures/compliance-scenarios.md](fixtures/compliance-scenarios.md)

## Çoklu temsilci (DEMO_AGENT_ID)

Seed ve refactor planı: [fixtures/demo-agents-seed-plan.md](fixtures/demo-agents-seed-plan.md)

## Fixture'lar (müşteri)

| Slug | TCKN | Amaç |
|------|------|------|
| [demo-caner-avci](fixtures/customers/demo-caner-avci.md) | 75683988090 | Lookup — normal / L1 KYC |
| [demo-hatice-acar](fixtures/customers/demo-hatice-acar.md) | 99988877760 | Pending transfer kilidi |
| [demo-yeni-kayit-ocr](fixtures/customers/demo-yeni-kayit-ocr.md) | 12345678901 | Yeni kayıt + OCR |
| [demo-sanction-test-kisi](fixtures/customers/demo-sanction-test-kisi.md) | 20000000147 | Tüzel yetkili — sanction OnHold |
| [demo-yusuf-avci-blocked](fixtures/customers/demo-yusuf-avci-blocked.md) | 36338154452 | Bloklu müşteri + risk uyarısı |
| [demo-sila-yildiz-tier0](fixtures/customers/demo-sila-yildiz-tier0.md) | 84590344827 | Tier 0 — düşük KYC + 10k limit |

Seed: `apps/data/src/db/seed-registration.ts`

## Run kayıtları

`runs/YYYY-MM-DD-{screen-slug}.md`

## Şablon

- Süreç: [`../_templates/agent/process.template.md`](../_templates/agent/process.template.md)
- Müşteri fixture: [`../_templates/agent/customer-fixture.template.md`](../_templates/agent/customer-fixture.template.md)

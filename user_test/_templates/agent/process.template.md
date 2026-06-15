---
app: agent
screen: {{SCREEN_NAME}}
route: {{ROUTE}}
updated: {{YYYY-MM-DD}}
status: draft | ready | deprecated
---

# {{SCREEN_TITLE}}

## Amaç

Kısa cümle: bu ekranda ne doğrulanır?

## Ön koşullar

- [ ] Uygulama: **Agent** — `pnpm --filter @epay/agent dev` → `http://localhost:5176`
- [ ] Mock seed yüklü (IndexedDB — ilk ziyarette otomatik)
- [ ] Test müşterisi: [`fixtures/customers/{{CUSTOMER_SLUG}}.md`](../fixtures/customers/{{CUSTOMER_SLUG}}.md)

## Test verisi

| Alan | Değer | Not |
|------|-------|-----|
| TCKN (lookup) | | `@epay/data` seed |
| Beklenen toast | | |

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | | |
| 2 | | |

## Checklist (son durum)

- [ ] Adım 1
- [ ] Adım 2

## Bilinen sorunlar

- (yok)

## İlgili kod

- Feature: `apps/agent/src/features/...`
- Plan: `.cursor/plans/agent/...`

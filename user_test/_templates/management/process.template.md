---
app: management
screen: {{SCREEN_NAME}}
route: {{ROUTE}}
updated: {{YYYY-MM-DD}}
status: draft | ready | deprecated
---

# {{SCREEN_TITLE}}

## Amaç

Kısa cümle: bu ekranda ne doğrulanır?

## Ön koşullar

- [ ] Uygulama: **Management** — `pnpm --filter @epay/management dev` → `http://localhost:5173`
- [ ] Mock seed / oturum hazır
- [ ] Test verisi: [`fixtures/{{FIXTURE_SLUG}}.md`](../fixtures/{{FIXTURE_SLUG}}.md) *(varsa)*

## Test verisi

| Alan | Değer | Not |
|------|-------|-----|
| | | |

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

- Feature: `apps/management/src/features/...`
- Plan: `.cursor/plans/management/...`

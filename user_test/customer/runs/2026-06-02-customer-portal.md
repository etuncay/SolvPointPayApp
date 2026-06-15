---
app: customer
module: portal-bootstrap
date: 2026-06-02
tester: agent
environment: local dev (Vite port 5175 — 5174 meşgul)
---

# Run — Customer portal (giriş, ana sayfa, activity)

## Uygulama değişiklikleri

| Alan | Değişiklik |
|------|------------|
| `apps/customer` | React portal; `@epay/data` Dexie bootstrap |
| `apps/data` | `customer-portal` seed + HTTP adapter iskelet |
| `user_test/customer` | Süreç + fixture + bu run |

## Otomasyon

| Komut | Sonuç |
|-------|-------|
| `pnpm --filter @epay/customer test` | **5/5** (validators + data-layer http) |
| `pnpm --filter @epay/customer build` | Başarılı |
| `pnpm --filter @epay/data test` | HTTP adapter **4/4** |

## Manuel (browser) — 2026-06-02

| Senaryo | Sonuç |
|---------|-------|
| `/login` → Demo OTP → `/` | Geçti |
| `/activity` filtre + liste | Geçti |
| Para Gönder → yurt içi → `/send/domestic` | Geçti |
| Form → `/confirm` → OTP → `/success` | Geçti |
| `/settings` → Uygulama Ayarları (dil/tema) | Geçti |
| AR RTL tam regresyon | Kısmi (yalnızca dil combobox görüldü) |

## Notlar

- Demo: `CUS-4827193` / `Demo123!`
- Port çakışmasında Vite **5175** kullandı; `dev_url` varsayılan 5174, run’da gerçek port not edildi.

## Sonuç

**Kabul edildi** — auth, activity, domestic transfer→confirm→success, settings uygulama sekmesi; HTTP driver birim testleri yeşil.

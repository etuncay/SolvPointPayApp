# SolvPoint Pay App

Turborepo monorepo: tasarım tokenları, UI bileşen kütüphanesi ve React web uygulamaları.

## Yapı

```
apps/
  management/   @epay/management — BackOffice (port 5173)
  agent/        @epay/agent — Temsilci portalı (port 5176)
  customer/     @epay/customer — Müşteri portalı
  data/         @epay/data — mock veri ve servisler (Dexie)
packages/
  domain/       @epay/domain — ortak domain tipleri
  tokens/       @epay/tokens — OKLCH CSS değişkenleri
  ui/           @epay/ui — shadcn/Radix bileşenleri
  tsconfig/     @epay/tsconfig — paylaşılan TS config
docs/           spesifikasyon ve tasarım dokümanları
user_test/      ekran test dokümantasyonu
```

## Gereksinimler

- Node.js 20+
- pnpm 10+

## Kurulum

```bash
pnpm install
pnpm dev              # BackOffice (management)
pnpm dev:agent        # Temsilci portalı
pnpm dev:customer     # Müşteri portalı
```

| Uygulama | URL |
|----------|-----|
| BackOffice | http://localhost:5173 |
| Agent Portal | http://localhost:5176 |

## Komutlar

| Komut | Açıklama |
|--------|----------|
| `pnpm dev` | BackOffice uygulamasını geliştirme modunda çalıştırır |
| `pnpm dev:agent` | Temsilci portalını geliştirme modunda çalıştırır |
| `pnpm dev:customer` | Müşteri portalını geliştirme modunda çalıştırır |
| `pnpm build` | Tüm paketleri derler |
| `pnpm typecheck` | TypeScript kontrolü |
| `pnpm lint` | ESLint |

## Agent kit

Cursor agent orchestration: `.cursor/config/project.defaults.yaml`

---
app: management
module: risk-ve-uyum
date: 2026-06-01
tester: agent
environment: local dev (port 5178)
---

# Run — Risk ve Uyum (7, 7.1–7.6)

## Kod değişikliği

| Dosya | Değişiklik |
|-------|------------|
| `features/risk-compliance/index.ts` | Barrel export (yeni) |
| `routes.tsx` | Placeholder → tüm risk sayfaları |

**Not:** Domain, mock adapter ve UI modülleri önceden mevcuttu; bu turda **route bağlantısı** tamamlandı.

## Otomasyon

| Komut | Sonuç |
|-------|-------|
| `vitest run src/features/risk-compliance` | **103/103** geçti |
| `pnpm --filter @epay/management build` | Başarılı |

## Manuel (`compliance@epay.demo`)

| Senaryo | Sonuç |
|---------|-------|
| `/risk` — 6 panel + Vaka Yaşı | Geçti |
| Menü 7.1–7.6 sıra + vaka badge | Geçti |
| `/risk/fraud-rules` — liste + filtre | Geçti |
| `/risk/cases` — Dolandırıcılık Bildir | Geçti |
| Breadcrumb Risk ve Uyum › alt | Geçti |

## Rol (otomasyon)

| Senaryo | Sonuç |
|---------|-------|
| `nav-permissions` compliance → 6 alt menü | Vitest |
| `nav-permissions` management → 7.2, 7.6 | Vitest |
| `report-permissions` finance → dashboard yok | Vitest |

## Sonuç

**Kabul edildi**

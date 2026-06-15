---
app: management
slug: risk-ve-uyum
purpose: Risk ve Uyum modülü (7, 7.1–7.6) manuel testleri için ortak mock veri ve rol referansı
source: apps/management/src/features/risk-compliance + mocks
updated: 2026-06-01
---

# Fixture — Risk ve Uyum (7.x)

## Ortam

| Alan | Değer |
|------|-------|
| Uygulama | `@epay/management` |
| Dev komutu | `pnpm --filter @epay/management dev` |
| URL | `http://localhost:5173` (meşgulse `5174+`) |
| Oturum | `compliance@epay.demo` / `management@epay.demo` — parola `Epay.1234` |

## Menü görünürlüğü (plan 7)

| Rol | Dashboard `/risk` | 7.1 | 7.2 | 7.3 | 7.4 | 7.5 | 7.6 |
|-----|-------------------|-----|-----|-----|-----|-----|-----|
| `compliance` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (badge) | ✓ |
| `management` | ✓ | — | ✓ | — | — | — | ✓ |
| `finance` / `ops` | — | — | — | — | — | — | — |

## Örnek kayıtlar

| Tür | ID | Not |
|-----|-----|-----|
| Dolandırıcılık kuralı | `FR-001` | Detay: `/risk/fraud-rules/FR-001` |
| Vaka | `C-1` | Detay: `/risk/cases/C-1` (seed sırasına göre) |
| Açık vaka sayısı | ~28 | Menü badge `7.5 Vaka İnceleme` |

## Dashboard panelleri (7)

1. Vaka yaşı (tek aralık KPI)
2. Müşteriler — ilk 10 satır
3. Temsilciler
4. Kural performans
5. Personel performans
6. Yüksek riskli onaylanan

Tutarlar **TRY**; tam ekran overlay ana dashboard deseni.

## Otomasyon

```bash
pnpm --filter @epay/management exec vitest run src/features/risk-compliance   # 103 passed
pnpm --filter @epay/management build
```

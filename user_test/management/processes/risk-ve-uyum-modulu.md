---
app: management
screen: risk-ve-uyum-modulu-index
route: /risk
updated: 2026-06-01
status: ready
---

# Risk ve Uyum — İndeks (7, 7.1–7.6)

## Genel ön koşullar

- [x] `pnpm --filter @epay/management dev`
- [x] Fixture: [`fixtures/risk-ve-uyum.md`](../fixtures/risk-ve-uyum.md)

## Süreç dosyaları

| No | Ekran | Süreç | Route |
|----|-------|-------|-------|
| 7 | Dashboard | [07-risk-ve-uyum.md](07-risk-ve-uyum.md) | `/risk` |
| 7.1 | Risk skor tanım | [07.1-risk-skor-tanimlama.md](07.1-risk-skor-tanimlama.md) | `/risk/score-definition` |
| 7.2 | Risk bazlı limitler | [07.2-risk-bazli-limitler.md](07.2-risk-bazli-limitler.md) | `/risk/limits` |
| 7.3 | Risk skorları | [07.3-risk-skorlari.md](07.3-risk-skorlari.md) | `/risk/scores` |
| 7.4 | Dolandırıcılık kuralları | [07.4-dolandiricilik-kurallari.md](07.4-dolandiricilik-kurallari.md) | `/risk/fraud-rules` |
| 7.4.1 | Kural detay | [07.4.1-kural-tanimlama-detay.md](07.4.1-kural-tanimlama-detay.md) | `/risk/fraud-rules/:ruleId` |
| 7.5 | Vaka inceleme | [07.5-vaka-inceleme.md](07.5-vaka-inceleme.md) | `/risk/cases` |
| 7.5.1 | Dolandırıcılık bildir | [07.5.1-dolandiricilik-bildir.md](07.5.1-dolandiricilik-bildir.md) | Modal (7.5) |
| 7.5.2 | Vaka detay | [07.5.2-vaka-detaylari.md](07.5.2-vaka-detaylari.md) | `/risk/cases/:caseId` |
| 7.6 | Yönetim | [07.6-yonetim.md](07.6-yonetim.md) | `/risk/admin` |

Menü: **Risk ve Uyum**

## Otomasyon

```bash
pnpm --filter @epay/management exec vitest run src/features/risk-compliance
pnpm --filter @epay/management build
```

Run: [`runs/2026-06-01-risk-ve-uyum.md`](../runs/2026-06-01-risk-ve-uyum.md)

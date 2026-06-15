---
app: customer
module: complaints-recipients
date: 2026-06-02
tester: agent
environment: local dev (port 5175)
---

# Run — Dilek/şikâyet + kayıtlı kişiler

| Senaryo | Sonuç |
|---------|-------|
| `/complaints` form | Geçti |
| `/send/recipients` liste + aksiyonlar | Geçti |

## Management (typecheck düzeltmesi)

| Alan | Sonuç |
|------|--------|
| fraud-rules import döngüsü | Düzeltildi |
| risk-score mock/adapter | Düzeltildi |
| vitest fraud + score-definition | **18/18** |
| Toplam typecheck | **206** hata (önce ~226) |

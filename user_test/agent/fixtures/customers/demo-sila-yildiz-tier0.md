---
app: agent
id: "99913"
slug: demo-sila-yildiz-tier0
purpose: compliance-kyc-low-limit
source: apps/data/src/db/seed-playground-mock-data.ts
updated: 2026-06-18
---

# Sıla Yıldız — Tier 0 (düşük KYC + sıkı limit)

## Kimlik

| Alan | Değer |
|------|-------|
| Müşteri no | `99913` / `MUS-00099913` |
| TCKN | `84590344827` |
| Ad | Sıla Yıldız |
| KYC | **Tier 0** |
| Durum | active |
| riskSeg | low |

## Demo kullanımı

| Akış | Beklenen |
|------|----------|
| Müşteri arama | Uyarı bandı: `kyc_low` |
| Transfer (kişi / IBAN) | Uyarı `kyc_low`; **10.001 TRY** ve üzeri → toast `ag_limit_exceeded` |
| Para çekme (persistent cüzdan) | Uyarı `kyc_low`; aynı limit eşiği |

Mock limit: tek işlem / günlük / aylık **10.000 TRY** (`mock-agent-remaining-limit.adapter.ts` — L1/L2/L3 dışı profiller).

## İlgili

- [compliance-scenarios.md](../compliance-scenarios.md) — S2, S18
- [agent-transfers.md](../../processes/agent-transfers.md) — § E, § F
- [withdrawal.md](../../processes/withdrawal.md) — § I, § J

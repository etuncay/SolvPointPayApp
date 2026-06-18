---
app: agent
id: "99910"
slug: demo-yusuf-avci-blocked
purpose: compliance-blocked
source: apps/data/src/db/seed-playground-mock-data.ts
updated: 2026-06-18
---

# Yusuf Avcı (bloklu + yüksek risk)

## Kimlik

| Alan | Değer |
|------|-------|
| Müşteri no | `99910` / `MUS-00099910` |
| TCKN | `36338154452` |
| Ad soyad | Yusuf Avcı |
| Tip | Bireysel |

## Uyumluluk profili

| Alan | Değer |
|------|-------|
| KYC | L2 |
| Durum | **blocked** |
| Blok nedeni | AML İncelemesi |
| riskSeg | high |

## Beklenen uyarılar

| Kod | Mesaj anahtarı |
|-----|----------------|
| `blocked` | `ag_cs_warn_blocked` |
| `risk_high` | `ag_cs_warn_risk` |

## Kullanım

1. `/customers` → TCKN `36338154452` — pembe uyarı bandı (iki satır).
2. `/withdrawal` → aynı TCKN — lookup uyarı bandı.

## İlgili

- [compliance-scenarios.md](../compliance-scenarios.md) — S3, S10, senaryo B
- [customer-search.md](../../processes/customer-search.md)

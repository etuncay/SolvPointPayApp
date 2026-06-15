---
app: agent
id: "200002"
slug: demo-hatice-acar
purpose: pending-transfer
source: apps/data/src/db/seed-registration.ts
updated: 2026-05-31
---

# Hatice Acar (lookup — pending transfer kilidi)

## Kimlik

| Alan | Değer |
|------|-------|
| TCKN | `99988877760` |
| Ad | Hatice |
| Soyad | Acar |
| Uyruk | TUR |
| Kimlik tipi | TCKN |
| Müşteri no | MUS-0200002 |

## Kullanım senaryosu

Bekleyen transfer kilidi ve kısıtlı alan davranışını test etmek için lookup.

## Beklenen sistem davranışı

- Lookup: **bulundu**
- Pending transfer: **evet** — uyarı banner, iletişim/adres alanları kilitli
- Toast: `ag_cust_pending_tx_block` (uyarı)

## Notlar

- `DEMO_PENDING_TRANSFER_IDNO` sabiti ile aynı TCKN.

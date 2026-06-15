---
app: agent
id: "200001"
slug: demo-caner-avci
purpose: lookup
source: apps/data/src/db/seed-registration.ts
updated: 2026-05-31
---

# Caner Avcı (lookup — normal)

## Kimlik

| Alan | Değer |
|------|-------|
| TCKN | `75683988090` |
| Ad | Caner |
| Soyad | Avcı |
| Uyruk | TUR |
| Kimlik tipi | TCKN |
| Müşteri no | MUS-0200001 |

## Kullanım senaryosu

`/customers/new` → **Sorgula** alanına TCKN yaz → form mevcut kayıtla dolar; bilinen müşteri banner'ı görünür.

## Form alanları (beklenen)

| Alan | Değer |
|------|-------|
| Doğum tarihi | 1990-04-12 |
| Doğum yeri | Bursa |
| Cinsiyet | Erkek (male) |
| Şüpheli işlem | Kapalı |

### Belgeler

| Belge | Mock dosya |
|-------|------------|
| Kimlik ön | kimlik-on.jpg |
| Kimlik arka | kimlik-arka.jpg |

### İletişim

| Tür | Değer | Birincil |
|-----|-------|----------|
| Telefon | +90 532 000 00 00 | evet |
| E-posta | caner.avci@example.com | hayır |

## Beklenen sistem davranışı

- Lookup: **bulundu** — toast: `ag_cust_lookup_found`
- OCR: kimlik zaten yüklü → nüfus alanları dolu, TUR için kilitli olabilir
- Pending transfer: **yok**

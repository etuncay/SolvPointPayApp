---
app: agent
id: {{CUSTOMER_ID}}
slug: {{CUSTOMER_SLUG}}
purpose: lookup | new-registration | pending-transfer | ocr-mock
source: apps/data/src/db/seed-registration.ts | manual | generated
updated: {{YYYY-MM-DD}}
---

# {{DISPLAY_NAME}}

## Kimlik

| Alan | Değer |
|------|-------|
| TCKN | |
| Ad | |
| Soyad | |
| Uyruk | TUR |
| Kimlik tipi | TCKN |

## Kullanım senaryosu

Hangi **Agent** ekranında, hangi adımda kullanılır? (1–2 cümle)

## Form alanları (doldurulacak / beklenen)

### Müşteri bilgileri

| Alan | Değer |
|------|-------|
| Doğum tarihi | |
| Şüpheli işlem | false |

### Belgeler

| Belge | Dosya adı (mock) |
|-------|------------------|
| Kimlik ön | |
| Kimlik arka | |

### İletişim (varsa)

| Tür | Değer | Birincil |
|-----|-------|----------|
| Telefon | | evet |
| E-posta | | |

## Beklenen sistem davranışı

- Lookup: bulundu / bulunamadı
- OCR: doldurulur / kilitlenir
- Pending transfer: kilit / banner

## Notlar

- Gerçek kişi verisi kullanılmaz.
- Konum: `user_test/agent/fixtures/customers/`

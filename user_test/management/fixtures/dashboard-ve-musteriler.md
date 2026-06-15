---
app: management
slug: dashboard-ve-musteriler
purpose: Dashboard (1) ve Müşteriler modülü (2, 2.1–2.6) manuel testleri için ortak mock veri ve rol referansı
source: apps/management/src/mocks + features/*
updated: 2026-06-01
---

# Fixture — Dashboard ve Müşteriler (1, 2.x)

Gerçek TCKN/VKN/telefon **kullanmayın**; değerler yalnızca mock seed içindir.

## Ortam

| Alan | Değer |
|------|-------|
| Uygulama | `@epay/management` |
| Dev | `pnpm --filter @epay/management dev` → `http://localhost:5173` |
| Rol | `sessionStorage` → `epay-backoffice-role` veya `?role=ops\|finance\|compliance\|management` |

## Dashboard (1) — widget / ayarlar

| Öğe | Not |
|-----|-----|
| Route | `/` |
| Mutual exclusion | Aynı TRX hem `pending_xfer` hem `aml_held` listesinde **olmamalı** |
| Hata simülasyonu | `refreshAll` sayacı **3’ün katı** → `sys_health` `SERVICE_UNAVAILABLE` |
| Ayarlar drawer | Parola politikası, karşılama metni, hatalı giriş listesi |

## Müşteri listesi (2) — örnek kayıtlar

| ID | Tip | Ad | Kimlik | Status | Not |
|----|-----|-----|--------|--------|-----|
| `99901` | individual | Caner Avcı | TCKN `75683988090` | active | Bireysel form / belge kuyruğu |
| `99902` | individual | Hatice Acar | TCKN `78568632556` | active | Kampanya `PREMIUM_TR` |
| `99903` | corporate | Anadolu Gıda Üretim A.Ş. | VKN `1792956117` | active | Tüzel form (`SAMPLE_CORPORATE` VKN) |
| `99904` | individual | Mustafa Karaca | TCKN `71582839943` | active | Kampanya `WELCOME2026` |

Varsayılan liste filtresi: **Aktif** (`record_status=0` kayıtlar görünmez).

## Bireysel form (2.1) — KPS demo

| Alan | Değer | Kaynak |
|------|-------|--------|
| Demo TCKN | `12345678901` | `SAMPLE_PERSON` |
| Doğum tarihi | `1991-04-18` | KPS blur sonrası nüfus kilit |
| Yeni kayıt route | `/customers/new-individual` | |
| Düzenle route | `/customers/99901/individual` | `?mode=view` salt okunur |

## Tüzel form (2.2)

| Alan | Değer |
|------|-------|
| VKN demo | `1792956117` → mevcut kayıt yönlendirme |
| Route yeni | `/customers/new-corporate` |
| Route düzenle | `/customers/99903/corporate` |
| Sanction test | Yetkili/UBO adında `sanction` geçen isim → blok |

## Müşteri notları (2.3)

| Not ID | Müşteri | Senaryo |
|--------|---------|---------|
| `3` | `99902` | `displayLimit: 3`, `displayCount: 3` → gösterim limiti dolu |
| PII | Metin içinde 11 haneli TCKN | `cn_text_pii` validation |

Route: `/customers/notes`

## Belge inceleme (2.4 / 2.4.1)

| Belge ID | Müşteri | Kategori | Öncelik notu |
|----------|---------|----------|--------------|
| `5001` | `99901` Caner | Identity | DEU + şüpheli |
| `5002` | `99902` Hatice | ProofOfAddress | şüpheli |
| `5003` | `99904` Mustafa | Identity | DEU |
| `5004` | `99903` Anadolu | LegalEntity | tüzel |

| Route | Açıklama |
|-------|----------|
| `/customers/documents/review` | Kuyruk |
| `/customers/documents/5001/review` | Detay / karar |

**Rol:** `ops` → `Identity` kategorisi **görünmez**; `compliance` görür.

## Ücret ve komisyon (2.5)

| Senaryo | Kayıt | Beklenen |
|---------|-------|----------|
| Kademe 15.000 TRY | `WalletToPerson` + `TRY`, limit 0/10000/20000 | %2 (`id` 1002) |
| Ülke önceliği | `DEU`→`TUR` (`id` 1004) vs `ALL`→`ALL` | Spesifik ülke önce |
| Base tier zorunlu | Alt limit `0` + tüm ülkeler | `cfe_no_base_tier` yoksa hesaplanır |

Route: `/customers/fees` — **finance** inline CRUD; **ops** list + export.

## Kampanya (2.6)

| Kampanya ID | Kod | Not |
|-------------|-----|-----|
| `3001` | `PREMIUM_TR` | Aktif; atama testi |
| `3008` | `EXPIRED_BATCH` | Batch sonrası `Passive` |
| `3006` | `OLD_WINTER` | Zaten pasif tarihçe |

Route: `/customers/campaigns` — kampanya kodu update’te **kilitli**.

Form entegrasyonu: bireysel müşteri formunda kampanya değişimi → onay → `campaignEndDate` güncellenir.

## Roller — özet (müşteri alt modülleri)

| Rol | 2 Liste | 2.1 Form | 2.2 Form | 2.3 Not | 2.4 Belge | 2.5 Ücret | 2.6 Kampanya |
|-----|---------|----------|----------|---------|-----------|-----------|--------------|
| `ops` | list+export+insert | insert+update+block | insert+update+block | CRUD | list (Identity hariç) | list+export | list+export |
| `finance` | list+view | view | view | list | list | list+export+CRUD | list+export+CRUD |
| `compliance` | list+export+update | update+block | update+block | CRUD | full+karar | list | list |
| `management` | tam | tam | tam | tam | tam | tam | tam |

## Otomasyon (isteğe bağlı)

```bash
pnpm --filter @epay/management test -- \
  src/features/dashboard \
  src/features/customers \
  src/features/individual-form \
  src/features/corporate-form \
  src/features/customer-notes \
  src/features/document-review \
  src/features/customer-fees \
  src/features/customer-campaigns
pnpm --filter @epay/management build
```

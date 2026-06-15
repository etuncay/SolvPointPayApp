---
app: management
screen: dms-list
route: /documents
updated: 2026-06-02
status: ready
plan: 9.dokuman_yonetim_sistemi.plan.md
---

# Doküman Yönetim Sistemi — Liste (9)

## Amaç

6 kolonlu merkezi belge grid, kategori/tür/durum filtreleri, rol bazlı satır görünürlüğü, satırdan 9.2 detaya geçiş.

## Ön koşullar

- [x] Management dev
- [x] Fixture: [`fixtures/dokuman-yonetim-sistemi.md`](../fixtures/dokuman-yonetim-sistemi.md)

## Adımlar (§20)

| # | Aksiyon | Beklenen | Sonuç |
|---|---------|----------|-------|
| 1 | `compliance` → `/documents` | Başlık «Doküman Yönetim Sistemi», FilterBar + grid | Geçti (5177) |
| 2 | Kategori «Kimlik» | Tür combobox aktif, türe göre filtre | UI |
| 3 | Durum «Active» | Yalnızca Active satırlar | UI |
| 4 | Arama «DOC-001» | Eşleşen satır | UI |
| 5 | Satır tıkla | `/documents/:id` detay | Route wire |
| 6 | «Yeni Doküman Ekle» | `/documents/new` | Geçti |
| 7 | «Doküman Tipleri» | `/documents/types` (compliance) | Rol bazlı |
| 8 | `ops` → `/documents` | Liste görünür; yetkisiz tür satırları gizli | `doc-type-permissions` vitest |
| 9 | Deep link | `?relationType=Customer&relationId=10042` ön filtre | Hook |

## Checklist

- [x] Placeholder yerine `DocumentsPage`
- [x] Menü 9.1 / 9.3 alt linkleri
- [x] Breadcrumb Ana Sayfa › DMS
- [x] `vitest run src/features/dms` — 54/54

## Ekran Bazlı Dokümantasyon

### 9 DMS Liste (`/documents`)
- Amaç: Belgeleri merkezi listede filtreleyip yönetmek.
- Görsel doğrulama: kategori/tür/durum filtreleri, arama alanı ve satır navigasyonu görünür.
- Temel aksiyonlar: detay açma, yeni belge ekranına geçiş, doküman tipleri ekranına yönlenme.
- Doğrulama notu: liste ekranı `DynamicTable` + config binder yapısıyla çalışır.

### 9.1 Yeni Doküman Ekle (`/documents/new`)
- Amaç: Yeni belge kaydı oluşturmak ve dosya doğrulama/scan sürecini işletmek.
- Görsel doğrulama: kategori-tür bağımlılığı, dosya alanı ve validasyon mesajları görünür.
- Temel aksiyonlar: yükleme, submit, hata/success akışı.
- Doğrulama notu: yükleme adımı hash/uzantı/boyut kontrolü ile korunur.

### 9.2 Doküman Detay (`/documents/:id`)
- Amaç: Belge metadata ve ilişki detaylarını incelemek.
- Görsel doğrulama: ilişki linkleri, durum alanları ve panel bölümleri tam render olur.
- Temel aksiyonlar: detay inceleme, ilişkili kayıtlara geçiş.
- Doğrulama notu: ilişki linkleri domain projection katmanı üzerinden türetilir.

### 9.3 Doküman Tipleri (`/documents/types`)
- Amaç: Doküman tip tanımlarını yönetmek.
- Görsel doğrulama: tip listesi, kategori/approval alanları ve aksiyonlar görünür.
- Temel aksiyonlar: tip ekleme/güncelleme, aktiflik değişimi.
- Doğrulama notu: tip listesi config tabanlı tablo standardındadır.

### 9.4 Yeni Doküman Tipi Tanımlama
- Amaç: Yeni belge tipi için kural/limit/approval parametrelerini tanımlamak.
- Görsel doğrulama: zorunlu alanlar, max boyut/format validasyonu ve hata mesajları doğru.
- Temel aksiyonlar: kayıt oluşturma ve listeye yansıma kontrolü.
- Doğrulama notu: form validasyonu domain kuralları ve adapter testleriyle desteklenir.

## İlgili kod

- `features/dms/documents-page.tsx`
- `features/dms/hooks/use-documents.tsx`
- `features/dms/api/mock-documents-adapter.ts`
- `routes.tsx` — `/documents`

---
app: management
screen: support-cases
route: /support/cases
updated: 2026-06-02
status: ready
plan: 10.destek_merkezi.plan.md
---

# Destek Merkezi (10)

## Amaç

Destek Merkezi taleplerini listelemek, filtrelemek ve Yeni Talep akışına geçişi doğrulamak.

## Ön koşullar

- [x] Dev sunucu çalışıyor (`http://localhost:5175`)
- [x] Demo oturum aktif (`management`, `finance`, `ops`)

## Adımlar (§20)

| # | Aksiyon | Beklenen | Sonuç |
|---|---------|----------|-------|
| 1 | `/support/cases` aç | 10 kolonlu liste, filtre çubukları, sayaçlar | Geçti |
| 2 | `Tarafıma Atanmış Talepler` filtresi aç | Liste yalnız atanmışları gösterir/boş durum metni çıkar | Geçti |
| 3 | `Yeni Talep` butonu | `/support/cases/new` formu açılır | Geçti |
| 4 | `finance` rolü ile aç | Liste erişimi var, raporlama erişimi yok | Geçti |
| 5 | `ops` rolü ile aç | Liste erişimi var, raporlama erişimi yok | Geçti |

## Checklist

- [x] Route gerçek sayfaya bağlı (placeholder yok)
- [x] Filtre aç/kapat ve assigned toggle çalışıyor
- [x] Rol bazlı görünürlük temel senaryoları doğrulandı

## Ekran Bazlı Dokümantasyon

### 10 Destek Talepleri Listesi (`/support/cases`)

- Amaç: Destek taleplerini listelemek, öncelik/durum/atanan kişi gibi alanlara göre hızlı aksiyon almak.
- Görsel doğrulama: Kolonlu liste yapısı, arama/filtre bileşenleri ve sayısal sayaçlar görünür.
- Temel aksiyonlar: filtreleme, “Tarafıma Atanmış Talepler” toggle, satır bazlı detay/form geçişi.
- Doğrulama notu: Sayfa gerçek route’a bağlı ve placeholder içermez.

### 10.1 Yeni Talep Girişi (`/support/cases/new`)

- Amaç: Yeni destek kaydı oluşturmak ve doğru iş akışına düşmesini sağlamak.
- Görsel doğrulama: Form alanları, zorunlu alanlar ve kayıt aksiyonları erişilebilir.
- Temel aksiyonlar: talep konusu/tipi doldurma, öncelik seçme, kayıt oluşturma.
- Doğrulama notu: Liste ekranındaki `Yeni Talep` aksiyonu doğrudan bu forma yönlendirir.

### 10.2 Destek Raporlama (`/support/reports/*`)

- Amaç: Destek taleplerinden operasyonel rapor çıktıları üretmek.
- Görsel doğrulama: Rolü uygun kullanıcıda rapor ekranı/akışı erişilebilir.
- Temel aksiyonlar: rapor kapsamı seçimi, çıktı üretimi, metriklerin izlenmesi.
- Doğrulama notu: `finance` ve `ops` rolleri için raporlama erişiminin kısıtlı olması beklenen davranıştır.

## İlgili kod

- `apps/management/src/features/support/support-cases-page.tsx`
- `apps/management/src/features/support/hooks/use-support-cases.tsx`
- `apps/management/src/features/support/api/mock-support-cases-adapter.ts`

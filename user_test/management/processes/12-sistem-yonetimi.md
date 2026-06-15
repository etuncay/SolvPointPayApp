---
app: management
screen: system-management
route: /system, /system/*
updated: 2026-06-02
status: ready
plan: 12.sistem_yonetimi.plan.md
---

# Sistem Yönetimi (12)

## Amaç

Sistem Yönetimi menü grubundaki 12.1–12.7 alt ekranlarının gerçek route'lara bağlı olduğunu ve temel ekran görünürlüğünü doğrulamak.

## Ön koşullar

- [x] Dev sunucu çalışıyor (`http://127.0.0.1:4173`)
- [x] Demo oturum aktif (`management`)

## Adımlar (§20)

| # | Aksiyon | Beklenen | Sonuç |
|---|---------|----------|-------|
| 1 | `/system` aç | `/system/users` route'una yönlendirme | Geçti |
| 2 | `/system/users` aç | 12.1 kullanıcı listesi + filtreler görünür | Geçti |
| 3 | `/system/approval-rules` aç | 12.2 onay kuralları paneli görünür | Geçti |
| 4 | `/system/roles` aç | 12.3 roller listesi ve `Yeni Rol` görünür | Geçti |
| 5 | `/system/parameters` aç | 12.4 parametre listesi görünür, `Yeni Parametre` yok | Geçti |
| 6 | `/system/jobs` aç | 12.5 zamanlanmış işler tablosu + `Yeni İş` görünür | Geçti |
| 7 | `/system/notifications` aç | 12.6 bildirim gönderimleri ekranı + `Yeni Şablon` görünür | Geçti |
| 8 | `/system/integrations` aç | 12.7 entegrasyonlar ekranı + `Yeni Entegrasyon` görünür | Geçti |
| 9 | Sol menü Sistem Yönetimi grubu | 12.1 → 12.7 sırası korunur | Geçti |

## Checklist

- [x] `system/*` route'ları placeholder yerine gerçek sayfalara bağlı
- [x] `/system` redirect davranışı doğru
- [x] 12.1–12.7 menü sırası ve görünürlük doğrulandı
- [x] İlgili run kaydı oluşturuldu: `user_test/management/runs/2026-06-02-sistem-yonetimi.md`

## Ekran Bazlı Dokümantasyon

### 12.1 Kullanıcılar (`/system/users`)

- Amaç: Sistem kullanıcılarını listelemek, filtrelemek ve kullanıcı yaşam döngüsü işlemlerini yönetmek.
- Görsel doğrulama: Tablo, arama/filtre alanları ve satır aksiyonlarının görünür olması.
- Temel aksiyonlar: kullanıcı ekleme, düzenleme, aktif/pasif durum güncelleme, liste export.
- Doğrulama notu: Sayfa `users-page` üzerinden gerçek veri kaynağına bağlı.

### 12.2 Onay Kuralları (`/system/approval-rules`)

- Amaç: Ekran/senaryo bazlı onay kurallarını görüntülemek ve yönetmek.
- Görsel doğrulama: Kural listesi, kural kriterleri ve aksiyon alanları erişilebilir.
- Temel aksiyonlar: kural ekleme, güncelleme, etkinlik durumu değiştirme.
- Doğrulama notu: Route açılışında placeholder yerine gerçek kural paneli render olur.

### 12.3 Roller (`/system/roles`)

- Amaç: Rol tanımları ve yetki matrisinin yönetimi.
- Görsel doğrulama: Rol tablosu ve `Yeni Rol` aksiyonu görünür.
- Temel aksiyonlar: rol oluşturma, rol detayına gitme, rol yetkisi güncelleme.
- Doğrulama notu: Roller sayfası menüden ve doğrudan route ile tutarlı açılır.

### 12.4 Parametreler (`/system/parameters`)

- Amaç: Sistem parametre değerlerini ve durumlarını merkezi olarak yönetmek.
- Görsel doğrulama: Parametre listesi, arama ve filtreler (`group`, `status`) çalışır.
- Temel aksiyonlar: satır bazlı değer güncelleme, durum değişimi, kritik onay gerektiren değişikliklerde confirm akışı.
- Doğrulama notu: Sayfa `DynamicTable` tabanlıdır, legacy `FilterBar` bağımlılığı kaldırılmıştır.

### 12.5 Zamanlanmış İşler (`/system/jobs`)

- Amaç: Scheduler/cron işlerini listelemek ve iş konfigürasyonlarını yönetmek.
- Görsel doğrulama: İş tablosu ve `Yeni İş` aksiyonu görünür.
- Temel aksiyonlar: iş ekleme, düzenleme, tetikleme/aktiflik yönetimi.
- Doğrulama notu: Job listesi route seviyesinde gerçek ekrana bağlıdır.

### 12.6 Bildirim Şablonları (`/system/notifications`)

- Amaç: Bildirim şablonlarını kanal ve olay bazında yönetmek.
- Görsel doğrulama: Şablon listesi ve `Yeni Şablon` aksiyonu görünür.
- Temel aksiyonlar: şablon ekleme, şablon düzenleme, etkinlik/durum yönetimi.
- Doğrulama notu: Liste ekranı config tabanlı tablo yapısıyla çalışır.

### 12.7 Entegrasyonlar (`/system/integrations`)

- Amaç: Harici sistem entegrasyonlarının tanım ve durumlarının yönetimi.
- Görsel doğrulama: Entegrasyon listesi ve `Yeni Entegrasyon` aksiyonu görünür.
- Temel aksiyonlar: entegrasyon ekleme, konfigürasyon güncelleme, aktif/pasif yönetimi.
- Doğrulama notu: Sayfa menü sırasına uygun şekilde erişilebilir ve route doğrudan açılabilir.

## İlgili kod

- `apps/management/src/routes.tsx`
- `apps/management/src/features/system/index.ts`
- `apps/management/src/features/system/users/users-page.tsx`
- `apps/management/src/features/system/approval-rules/approval-rules-page.tsx`
- `apps/management/src/features/system/roles/roles-page.tsx`
- `apps/management/src/features/system/parameters/parameters-page.tsx`
- `apps/management/src/features/system/scheduled-jobs/scheduled-jobs-page.tsx`
- `apps/management/src/features/system/notifications/notification-templates-page.tsx`
- `apps/management/src/features/system/integrations/integrations-page.tsx`

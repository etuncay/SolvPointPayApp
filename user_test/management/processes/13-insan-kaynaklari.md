---
app: management
screen: hr-management
route: /hr/employees, /hr/employees/new, /hr/leave, /hr/leave/new
updated: 2026-06-02
status: ready
plan: 13.insan_kaynaklari.plan.md
---

# İnsan Kaynakları (13)

## Amaç

İnsan Kaynakları modülünde 13, 13.1, 13.2 ve 13.3 ekranlarının gerçek route'lara bağlı olduğunu ve ana akışların çalıştığını doğrulamak.

## Ön koşullar

- [x] Dev sunucu çalışıyor (`http://127.0.0.1:4173`)
- [x] Demo oturum aktif (`management`)

## Adımlar (§20)

| # | Aksiyon | Beklenen | Sonuç |
|---|---------|----------|-------|
| 1 | `/hr/employees` aç | 13 personel listesi + filtreler + `Yeni Personel` görünür | Geçti |
| 2 | `/hr/employees/new` aç | 13.1 personel formu açılır, insert modunda `Kullanıcı No` görünmez | Geçti |
| 3 | `/hr/employees/emp-001` aç | 13.1 detay formu açılır, `Kullanıcı No` readonly görünür | Geçti |
| 4 | `/hr/leave` aç | 13.2 izin/rapor listesi + özet kartları görünür | Geçti |
| 5 | `/hr/leave/new` aç | 13.3 izin formu açılır, `İşgünü` readonly ve `Onaya Gönder` aksiyonu görünür | Geçti |
| 6 | `/hr/leave/:leaveId` aç | Guard davranışı korunur (uygunsuz kayıtta güvenli dönüş/liste) | Geçti |
| 7 | HR menü grubu kontrolü | 13 → 13.1 → 13.2 → 13.3 sırası doğru | Geçti |

## Checklist

- [x] `hr/*` route'ları placeholder yerine gerçek sayfalara bağlı
- [x] 13.1 personel formu create/detail modları doğrulandı
- [x] 13.2 liste + özet şeridi doğrulandı
- [x] 13.3 izin formu temel aksiyonları doğrulandı
- [x] İlgili run kaydı oluşturuldu: `user_test/management/runs/2026-06-02-insan-kaynaklari.md`

## Ekran Bazlı Dokümantasyon

### 13 Personel Listesi (`/hr/employees`)

- Amaç: İnsan Kaynakları kapsamındaki personelleri listelemek ve filtreleyerek erişmek.
- Görsel doğrulama: Tablo, filtre/arama alanları ve `Yeni Personel` aksiyonu görünür.
- Temel aksiyonlar: yeni personel kaydı açma, mevcut personel detayına geçiş, listeleme/export.
- Doğrulama notu: Liste ekranı gerçek route üzerinden açılır ve placeholder içermez.

### 13.1 Personel Formu (`/hr/employees/new`, `/hr/employees/:employeeId`)

- Amaç: Personel kaydı oluşturma ve mevcut personel bilgisini güncelleme.
- Görsel doğrulama: Create modda form boş/insert odaklı, detail modda `Kullanıcı No` readonly alanı görünür.
- Temel aksiyonlar: kaydetme, güncelleme, form doğrulama ve zorunlu alan kontrolü.
- Doğrulama notu: Create/detail mod ayrımı route parametresine göre doğru çalışır.

### 13.2 İzin ve Rapor Listesi (`/hr/leave`)

- Amaç: İzin/rapor taleplerini durum ve özet metriklerle birlikte yönetmek.
- Görsel doğrulama: Liste tablosu, özet kartları ve filtre bileşenleri görünür.
- Temel aksiyonlar: talep satırına erişim, durum bazlı filtreleme, kayıt takibi.
- Doğrulama notu: Liste ekranı HR menü akışıyla uyumlu ve doğrudan route ile erişilebilir.

### 13.3 İzin Formu (`/hr/leave/new`, `/hr/leave/:leaveId`)

- Amaç: Yeni izin talebi oluşturmak veya mevcut talebi incelemek/düzenlemek.
- Görsel doğrulama: `İşgünü` alanı readonly hesaplanır, `Onaya Gönder` aksiyonu görünür.
- Temel aksiyonlar: talep oluşturma, tarih aralığına göre işgünü hesaplama, onaya sevk.
- Doğrulama notu: Uygunsuz `leaveId` senaryosunda guard mekanizması güvenli dönüş sağlar.

## İlgili kod

- `apps/management/src/routes.tsx`
- `apps/management/src/features/hr/employees-page.tsx`
- `apps/management/src/features/hr/employee-form/employee-form-page.tsx`
- `apps/management/src/features/hr/employee-form/employee-form.tsx`
- `apps/management/src/features/hr/leaves/leaves-page.tsx`
- `apps/management/src/features/hr/leave-form/leave-form-page.tsx`
- `apps/management/src/features/hr/leave-form/leave-form.tsx`

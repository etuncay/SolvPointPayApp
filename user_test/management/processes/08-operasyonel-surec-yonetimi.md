---
app: management
screen: operasyonel-surec-menu
route: /ops
updated: 2026-06-02
status: ready
plan: 8.operasyonel_surec_yonetimi.plan.md
---

# Operasyonel Süreç Yönetimi menü (8)

## Adımlar (§20)

| # | Aksiyon | Beklenen | Sonuç |
|---|---------|----------|-------|
| 1 | `ops` menü | Yalnızca 8.1 Onay Havuzu | Vitest `nav-permissions` |
| 2 | `compliance` | Yalnızca 8.2 KYC + badge | Vitest |
| 3 | `finance` | 8.3–8.6 | Vitest |
| 4 | `/ops` redirect | İlk görünür alt route | `OpsIndexRedirect` |
| 5 | Stub yerine gerçek sayfa | Placeholder değil | Route wire OK |

## İlgili kod

- `features/operational-processes/domain/nav-permissions.ts`
- `config/filter-menu.ts`

## Ekran Bazlı Dokümantasyon

### 8 Operasyonel Süreç Menüsü (`/ops`)
- Amaç: Rol bazlı alt operasyon ekranlarını tek menü altında sunmak.
- Görsel doğrulama: role göre alt ekran görünürlüğü ve redirect davranışı.
- Temel aksiyonlar: menüden alt modüllere geçiş, breadcrumb doğrulama.
- Doğrulama notu: `/ops` açılışında ilk yetkili alt route’a yönlendirme yapılır.

### 8.1 Onay Havuzu
- Amaç: Onay gerektiren operasyonel kayıtların merkezi yönetimi.
- Görsel doğrulama: kuyruk listesi, karar aksiyonları ve durum etiketleri görünür.
- Temel aksiyonlar: onay, red, detay inceleme.
- Doğrulama notu: onay kararları domain transition kurallarıyla doğrulanır.

### 8.2 KYC Yönetimi
- Amaç: KYC inceleme kuyruklarını ve karar süreçlerini yönetmek.
- Görsel doğrulama: KYC listesi, detay paneli ve karar modalları doğru modda açılır.
- Temel aksiyonlar: verify, reject, request additional, false-positive.
- Doğrulama notu: KYC listesi config tabanlı tablo yapısı üzerinden yürür.

### 8.3 Muhasebe Entegrasyon
- Amaç: Muhasebe entegrasyon kayıtlarını takip etmek.
- Görsel doğrulama: entegrasyon tablosu, durum alanları ve işlem aksiyonları görünür.
- Temel aksiyonlar: kayıt kontrolü, aksiyon tetikleme, filtreleme/export.
- Doğrulama notu: liste ekranı `DynamicTable` + JSON config ile yönetilir.

### 8.4 BTRANS Raporları
- Amaç: BTRANS entegrasyon ve rapor üretim adımlarını izlemek.
- Görsel doğrulama: liste, durum alanları ve aksiyon kolonları görünür.
- Temel aksiyonlar: rapor entegrasyonu tetikleme, job izleme, çıktı kontrolü.
- Doğrulama notu: ekran tablo konfigürasyonu binder dosyası üzerinden beslenir.

### 8.5 Finansal Mutabakat
- Amaç: Finansal mutabakat kayıtlarını yönetmek.
- Görsel doğrulama: mutabakat tablo yapısı, snapshot/uyuşmazlık alanları görünür.
- Temel aksiyonlar: mutabakat adımlarını çalıştırma, sonuç takibi, durum analizi.
- Doğrulama notu: liste ekranı config tabanlı tabloya taşınmıştır.

### 8.6 Kur / FX Yönetimi
- Amaç: Kur marjı ve rate geçmişlerini operasyonel olarak yönetmek.
- Görsel doğrulama: rate bilgi paneli, history panelleri ve input aksiyonları görünür.
- Temel aksiyonlar: rate güncelleme, geçmiş izleme, marj doğrulama.
- Doğrulama notu: history panelleri tablo standardı ile uyumlu olacak şekilde güncellenmiştir.

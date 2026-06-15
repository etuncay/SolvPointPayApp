---
app: management
screen: risk-dashboard
route: /risk
updated: 2026-06-02
status: ready
plan: 7.risk_ve_uyum.plan.md
---

# Risk ve Uyum Dashboard (7)

## Amaç

6 rapor paneli, vaka yaşı KPI, ilk 10 satır + tam ekran, TRY tutarlar, rol filtreli dashboard.

## Adımlar (§20)

| # | Aksiyon | Beklenen | Sonuç |
|---|---------|----------|-------|
| 1 | `compliance` → `/risk` | 6 panel + Vaka Yaşı | Geçti (5178) |
| 2 | Tablo panel | En fazla 10 satır önizleme | UI |
| 3 | Tam ekran | FullscreenOverlay | Butonlar görünür |
| 4 | Yenile | Paneller yeniden yüklenir | Geçti |
| 5 | `finance` rol | Dashboard erişim yok / yönlendirme | `canSeeRiskDashboard` vitest |

## İlgili kod

- `features/risk-compliance/risk-compliance-page.tsx`
- `features/risk-compliance/api/mock-risk-compliance-adapter.ts`

## Ekran Bazlı Dokümantasyon

### 7 Risk ve Uyum Dashboard (`/risk`)
- Amaç: Risk/uyum metriklerini, açık vaka yoğunluğunu ve operasyonel eğilimleri tek ekranda sunmak.
- Görsel doğrulama: panel grid yapısı, vaka yaşı KPI kartı, fullscreen ikonları ve yenile aksiyonları görünür.
- Temel aksiyonlar: panel yenileme, fullscreen önizleme, rol bazlı erişim doğrulaması.
- Doğrulama notu: dashboard erişimi `canSeeRiskDashboard` yetki kontrolü ile korunur.

### 7.1 Risk Skor Tanımlama
- Amaç: Risk skor kural ve eşik setlerini yönetmek.
- Görsel doğrulama: kural listesi, parametre alanları ve aksiyon butonları erişilebilir.
- Temel aksiyonlar: kural ekleme, düzenleme, aktif/pasif yönetimi.
- Doğrulama notu: simülasyon modalı ve skor kalemleri config tabanlı tablo bileşenleriyle çalışır.

### 7.2 Risk Bazlı Limitler
- Amaç: Risk seviyesine göre işlem limit politikalarını uygulamak.
- Görsel doğrulama: limit matrisi, onay eşiği alanları ve uluslararası transfer toggle alanları görünür.
- Temel aksiyonlar: limit güncelleme, fallback senaryosu kontrolü, readOnly mod doğrulaması.
- Doğrulama notu: limit matrisi `DynamicTable` kullanacak şekilde standardize edilmiştir.

### 7.3 Risk Skorları
- Amaç: Üretilmiş risk skorlarını takip etmek ve trendleri analiz etmek.
- Görsel doğrulama: skor listesi, seviye segment renkleri, geçmiş paneli görünür.
- Temel aksiyonlar: filtreleme, detay açma, skor geçmişini inceleme.
- Doğrulama notu: skor geçmiş/dağılım panelleri config tabanlı tabloya taşınmıştır.

### 7.4 Dolandırıcılık Kuralları
- Amaç: Fraud tespit kurallarını yönetmek ve simülasyon etkisini gözlemlemek.
- Görsel doğrulama: kural listesi, detay paneli, aksiyon kolonları ve simülasyon çıktıları.
- Temel aksiyonlar: kural oluşturma, güncelleme, aktif/pasif, simülasyon çalıştırma.
- Doğrulama notu: detay simülasyon çıktısı `DynamicTable` ile render edilir.

### 7.5 Vaka İnceleme
- Amaç: Fraud vakalarını uçtan uca inceleyip operasyonel karar vermek.
- Görsel doğrulama: vaka listesi, vaka detay panelleri, ilgili müşteri/işlem görünümleri.
- Temel aksiyonlar: vaka atama, durum güncelleme, not/karar aksiyonları.
- Doğrulama notu: vaka detayındaki hesap/ilişkili müşteri tabloları `DynamicTable` standardındadır.

### 7.6 Yönetim
- Amaç: Risk operasyonunun grup dağıtımı ve yönlendirme kurallarını yönetmek.
- Görsel doğrulama: routing rules, referans geçmişi, threshold ve grup panelleri görünür.
- Temel aksiyonlar: auto-distribute ayarı, rule ekleme/silme, referans geçmişi inceleme.
- Doğrulama notu: routing/reference/threshold tabloları `DynamicTable` standardına geçirilmiştir.

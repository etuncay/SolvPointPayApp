---
app: management
screen: musteriler-liste
route: /customers
updated: 2026-06-02
status: ready
plan: 2_müşteriler_liste_fc332db4.plan.md
---

# Müşteri Listesi (2)

## Amaç

Grid kolonları, varsayılan Aktif filtresi, export, satır → 2.1/2.2 navigasyonu, rol matrisi.

## Ön koşullar

- [ ] Management dev → `http://localhost:5173`
- [ ] Fixture: [`fixtures/dashboard-ve-musteriler.md`](../fixtures/dashboard-ve-musteriler.md) — Müşteri listesi

## Test verisi

| ID | Tip | Route hedefi |
|----|-----|--------------|
| `99901` | individual | `/customers/99901/individual` |
| `99903` | corporate | `/customers/99903/corporate` |

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/customers` aç | Varsayılan **Aktif** filtresi |
| 2 | **Tümü** chip | `record_status=0` kayıtlar görünmez |
| 3 | Blocked/Closed satır | Gerekçe `StatusPill` ile |
| 4 | Filtre + Dışa Aktar | CSV yalnızca filtrelenmiş kayıtlar |
| 5 | Bireysel satır (`99901`) | `/customers/99901/individual` |
| 6 | Tüzel satır (`99903`) | `/customers/99903/corporate` |
| 7 | Rol `compliance` | Insert gizli; uyum banner |
| 8 | Rol `management` | Delete/restore Actions |

## Checklist (son durum)

- [ ] §20 #1–8
- [ ] Ekle → tip seçici (bireysel/tüzel)

## Ekran Bazlı Dokümantasyon

### 2 Müşteri Listesi (`/customers`)
- Amaç: Bireysel/tüzel müşteri kayıtlarını tek listede yönetmek.
- Görsel doğrulama: aktif varsayılan filtresi, durum chip’leri, export ve satır navigasyonu görünür.
- Temel aksiyonlar: arama/filtre, satırdan detay yönlendirme, yeni müşteri başlatma.
- Doğrulama notu: müşteri liste ekranı `DynamicTable` + config binder standardındadır.

### 2.1 Bireysel Müşteri Formu (`/customers/:id/individual`, `/customers/new-individual`)
- Amaç: Bireysel müşteri oluşturma ve güncelleme.
- Görsel doğrulama: create/edit/view modları, KPS ve doğrulama alanları doğru görünür.
- Temel aksiyonlar: kayıt, taslak, bloke/kaldır, iletişim/doğrulama adımları.
- Doğrulama notu: kimlik/iletişim doğrulama kuralları domain testleri ile güvence altındadır.

### 2.2 Tüzel Müşteri Formu (`/customers/:id/corporate`, `/customers/new-corporate`)
- Amaç: Tüzel müşteri kayıtlarının yaşam döngüsü yönetimi.
- Görsel doğrulama: şirket/ortak/yetkili panelleri ve belge alanları modlara göre görünür.
- Temel aksiyonlar: kayıt/taslak, belge yükleme, statü aksiyonları.
- Doğrulama notu: alt tablo bölümleri `DynamicTable` standardına taşınmıştır.

### 2.3 Müşteri Notları
- Amaç: Müşteriye bağlı operasyonel notların takibi.
- Görsel doğrulama: not listesi, öncelik/hedef alanları ve aksiyon kolonları görünür.
- Temel aksiyonlar: not ekleme, düzenleme, silme.
- Doğrulama notu: not listesi config tabanlı tablo binder’ı üzerinden yüklenir.

### 2.4 Belge İnceleme
- Amaç: Müşteriye bağlı belge doğrulama/inceleme süreçlerinin yönetimi.
- Görsel doğrulama: durum akışı, karar butonları ve belge ilişki görünümü doğru.
- Temel aksiyonlar: onay, red, ek belge talebi.
- Doğrulama notu: karar validasyonları ve permission kontrolleri domain katmanında doğrulanır.

### 2.5 Müşteri Ücretleri
- Amaç: Müşteri bazlı ücret tanımlarını yönetmek.
- Görsel doğrulama: ücret listesi, filtreler ve modal form akışı görünür.
- Temel aksiyonlar: ücret ekleme/güncelleme/pasifleme.
- Doğrulama notu: liste ekranı JSON config + table-config binder desenini kullanır.

### 2.6 Kampanya Yönetimi
- Amaç: Müşteri kampanyalarını tanımlamak ve uygulamak.
- Görsel doğrulama: kampanya listesi, tarih aralığı/oran alanları ve aksiyonlar görünür.
- Temel aksiyonlar: kampanya ekleme, güncelleme, durum yönetimi.
- Doğrulama notu: kampanya liste ekranı config tabanlı tablo ile çalışır.

## Bilinen sorunlar

- (yok)

## İlgili kod

- `apps/management/src/features/customers/customers-page.tsx`
- Plan: `.cursor/plans/management/2_müşteriler_liste_fc332db4.plan.md`

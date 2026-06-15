---
app: management
screen: temsilciler-liste
route: /agents
updated: 2026-06-02
status: ready
plan: 3.0_temsilciler_listesi_f021db31.plan.md
---

# Temsilciler Listesi (3.0)

## Amaç

Grid, filtre, export, satır navigasyonu ve rol matrisi.

## Ön koşullar

- [ ] Management dev → `http://localhost:5173`
- [ ] Fixture: [`fixtures/temsilciler.md`](../fixtures/temsilciler.md)
- [ ] Rol: `?role=ops|finance|compliance|management`

## Test verisi

| ID | Not |
|----|-----|
| `99901` | Satır tıklama → `/agents/99901` |

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/agents` aç | KPI + grid; TRY/USD/EUR bakiye kolonları |
| 2 | Blocked/Closed satır | Gerekçe tire veya pill metni |
| 3 | Filtre uygula + Dışa Aktar | CSV yalnızca filtrelenmiş kayıtlar |
| 4 | Satıra tıkla | `/agents/99901` (örnek) |
| 5 | Rol `compliance` | Export görünür; Yeni Temsilci gizli |
| 6 | Rol `finance` | Export gizli; liste görünür |

## Checklist (son durum)

- [ ] §20 #1–4
- [ ] Rol #5–6

## Ekran Bazlı Dokümantasyon

### 3.0 Temsilciler Listesi (`/agents`)
- Amaç: Temsilci kayıtlarını rol bazlı görünürlük ve yetki kurallarıyla merkezi listede yönetmek.
- Görsel doğrulama: tablo kolonları, filtre alanları, satır aksiyonları ve export butonunun role göre görünmesi.
- Temel aksiyonlar: arama/filtreleme, satırdan detay açma, liste export.
- Doğrulama notu: `agents-page` ekranı `DynamicTable` ile config/binder tabanlı çalışır.

### 3.1 Yeni/Düzenle Temsilci (`/agents/new`, `/agents/:id`)
- Amaç: Temsilci kartını oluşturmak, güncellemek ve yaşam döngüsü aksiyonlarını yürütmek.
- Görsel doğrulama: panel bazlı form bölümleri, KYC ve belge alanlarının mod/role göre görünmesi.
- Temel aksiyonlar: kaydetme, taslak alma, bloke et/kaldır, belge yükleme/durum güncelleme.
- Doğrulama notu: create/edit/view modları route parametresi ve yetki setine göre açılır.

### 3.2 Yetkili Kişi Formu (`/agents/authorized-persons/*`)
- Amaç: Temsilciye bağlı yetkili kişilerin kimlik ve yetki bilgilerini yönetmek.
- Görsel doğrulama: kimlik, limit ve yetki alanlarının form durumuna göre erişilebilir olması.
- Temel aksiyonlar: ekleme, düzenleme, yetki seti güncelleme, kayıt doğrulama.
- Doğrulama notu: kimlik/yaş validasyonları domain kuralları ile enforce edilir.

### 3.3 Temsilci Grup Yönetimi (`/agent-groups`)
- Amaç: Temsilci grupları ve grup bazlı operasyon parametrelerini yönetmek.
- Görsel doğrulama: grup listesi, filtreler ve modal form akışı tutarlı görünür.
- Temel aksiyonlar: grup ekleme, düzenleme, aktif/pasif yönetimi.
- Doğrulama notu: liste ekranı JSON config + binder desenine taşınmıştır.

### 3.3.1 Temsilci-Grup İlişkisi (`/agent-groups/assignments`)
- Amaç: Temsilci atamalarını grup bazında izlemek ve güncellemek.
- Görsel doğrulama: atama listesi, grup/temsilci eşleşmeleri ve aksiyon kolonları görünür.
- Temel aksiyonlar: atama ekleme, atama kaldırma, mevcut bağları doğrulama.
- Doğrulama notu: atama listesi config tabanlı tablo üzerinden yüklenir.

### 3.4 Temsilci Ücretleri (`/agent-fees`)
- Amaç: Temsilci komisyon ve ücret kurallarını merkezi olarak yönetmek.
- Görsel doğrulama: ücret listesi, filtre alanları, aksiyon kolonları ve export davranışı.
- Temel aksiyonlar: ücret ekleme, güncelleme, pasifleme, export.
- Doğrulama notu: ekran `DynamicTable` + `agent-fees-table-config` binder yapısı kullanır.

## Bilinen sorunlar

- (yok)

## İlgili kod

- `apps/management/src/features/agents/agents-page.tsx`
- `apps/management/src/features/agents/api/mock-agents-adapter.ts`
- Plan: `.cursor/plans/management/3.0_temsilciler_listesi_f021db31.plan.md`

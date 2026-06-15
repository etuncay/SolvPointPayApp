---
app: management
screen: bankalar-menu
route: /banks
updated: 2026-06-02
status: ready
plan: 6.bankalar.plan.md
---

# Bankalar menü grubu (6)

## Amaç

Rol bazlı alt menü (6.1–6.4), `/banks` yönlendirme, breadcrumb ve route erişimi.

## Ön koşullar

- [x] Management dev
- [x] Fixture: [`fixtures/bankalar.md`](../fixtures/bankalar.md)

## Adımlar (§20)

| # | Aksiyon | Beklenen | Sonuç |
|---|---------|----------|-------|
| 1 | `finance` ile giriş | Alt menü 6.1→6.4 sırayla | Geçti (5177) |
| 2 | `/banks` | İlk görünür alt route (`/banks/integrated`) | Geçti |
| 3 | Breadcrumb | Ana Sayfa › Bankalar › alt başlık | Geçti |
| 4 | `ops` menü | Yalnızca 6.3, 6.4 | Vitest `nav-permissions` |
| 5 | `compliance` | Bankalar grubu yok | Vitest |
| 6 | Stub yerine gerçek sayfa | Placeholder değil | Geçti (route wire) |

## Checklist

- [x] `filterMenuForRole` + `nav-permissions`
- [x] `routes.tsx` gerçek sayfalar
- [x] §20 #1, #2, #3, #6 manuel

## Ekran Bazlı Dokümantasyon

### 6 Bankalar Menü Girişi (`/banks`)
- Amaç: Rol bazlı görünür bankacılık ekranlarına doğru yönlendirme sağlamak.
- Görsel doğrulama: `/banks` açılışında ilk yetkili alt route’a redirect ve breadcrumb zinciri doğru.
- Temel aksiyonlar: menüden alt ekranlara geçiş, route doğrulama.
- Doğrulama notu: `nav-permissions` ve redirect bileşeni route güvenliğini sağlar.

### 6.1 Entegre Bankalar (`/banks/integrated`)
- Amaç: Entegre bankaların tanım ve teknik flag alanlarını yönetmek.
- Görsel doğrulama: liste, default kuralı, modal form ve aksiyon kolonları görünür.
- Temel aksiyonlar: ekleme, güncelleme, pasifleme, export.
- Doğrulama notu: ekran `DynamicTable` + JSON config desenindedir.

### 6.2 Banka Hesap Bilgileri (`/banks/company-accounts`)
- Amaç: Şirket banka hesaplarını yönetmek ve bakiye güncellemek.
- Görsel doğrulama: hesap listesi, hesap türü/bakiye/satır aksiyonları görünür.
- Temel aksiyonlar: yeni hesap, düzenleme, pasife alma, bakiye çekme.
- Doğrulama notu: legacy `FilterBar + itable` kaldırılmış, config tabanlı listeye taşınmıştır.

### 6.3 Banka Hesap Hareketleri (`/banks/movements`)
- Amaç: Banka hareket kayıtlarının izlenmesi ve mutabakat öncesi doğrulama.
- Görsel doğrulama: hareket tablosu, tarih/kanal/tutar kolonları ve filtre alanları görünür.
- Temel aksiyonlar: filtreleme, detay inceleme, export.
- Doğrulama notu: ekran config tabanlı tablo binder’ı ile beslenir.

### 6.4 Banka Mutabakatı (`/banks/reconciliation`)
- Amaç: Banka kayıtları ile iç sistem kayıtlarının mutabakatını yönetmek.
- Görsel doğrulama: mutabakat tablosu, durum/uyuşmazlık alanları ve aksiyonlar görünür.
- Temel aksiyonlar: eşleme, aksiyon alma, kayıt durumunu güncelleme.
- Doğrulama notu: tablo ekranı JSON config + table-config binder standardındadır.

## İlgili kod

- `apps/management/src/features/banks/domain/nav-permissions.ts`
- `apps/management/src/config/filter-menu.ts`
- Plan: `.cursor/plans/management/6.bankalar.plan.md`

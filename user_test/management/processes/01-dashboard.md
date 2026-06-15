---
app: management
screen: dashboard
route: /
updated: 2026-06-02
status: ready
plan: 01.ana_sayfa_dashboard_05e6fa81.plan.md
---

# Ana Sayfa (Dashboard)

## Amaç

Widget görünürlüğü (rol), transfer widget mutual exclusion, tam ekran tablo, ayarlar drawer (parola, karşılama).

## Ön koşullar

- [ ] `pnpm --filter @epay/management dev` → `http://localhost:5173`
- [ ] Giriş yapılmış oturum
- [ ] Fixture: [`fixtures/dashboard-ve-musteriler.md`](../fixtures/dashboard-ve-musteriler.md) — Dashboard bölümü
- [ ] Rol: üst bar veya `?role=ops|finance|compliance|management`

## Test verisi

| Öğe | Not |
|-----|-----|
| Mutual exclusion | Aynı TRX `pending_xfer` ve `aml_held` içinde birlikte olmamalı |
| `sys_health` hata | Yenile sayacı 3’ün katında `SERVICE_UNAVAILABLE` |

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/` aç | PageHead + widget grid |
| 2 | Rol değiştir (header) | Yalnız yetkili widget’lar görünür |
| 3 | AML + pending aynı TRX kontrolü | Aynı işlem iki transfer widget’ında **yok** |
| 4 | Tablo widget → Tam ekran | 10+ satır, filtre/sort/CSV |
| 5 | Yenile ×3 | `sys_health` hata kartı; diğer widget’lar ayakta |
| 6 | Ayarlar → Parola değiştir | Politika kuralları; demo revoke/toast |
| 7 | Karşılama metni kaydet | Banner güncellenir; XSS payload reddedilir |

## Checklist (son durum)

- [ ] §20 #1–6 (plan)
- [ ] Widget’lar render
- [ ] Tam ekran + CSV
- [ ] Ayarlar drawer

## Ekran Bazlı Dokümantasyon

### 1 Dashboard Ana Ekranı (`/`)
- Amaç: Rol bazlı widget görünürlüğü ve operasyonel özetlerin tek ekranda sunulması.
- Görsel doğrulama: widget grid, rol değişiminde görünürlük ve KPI kartları tutarlı.
- Temel aksiyonlar: widget tam ekran, yenile, temel filtre/sort/export.
- Doğrulama notu: transfer widget’larında mutual exclusion projection katmanında uygulanır.

### 1.1 Dashboard Tablo Tam Ekran Katmanı
- Amaç: Tablo widget’larını detaylı inceleme modunda kullanmak.
- Görsel doğrulama: fullscreen overlay aç/kapat, satır sayısı ve toolbar aksiyonları görünür.
- Temel aksiyonlar: kolon sıralama, filtreleme, export.
- Doğrulama notu: tam ekran tablosu `DynamicTable` bileşeni üzerinden render edilir.

### 1.2 Ayarlar Çekmecesi (Dashboard içi)
- Amaç: Parola değişimi ve karşılama metni gibi kullanıcı ayarlarını yönetmek.
- Görsel doğrulama: drawer açılışı, validasyon mesajları ve toast geri bildirimleri görünür.
- Temel aksiyonlar: parola güncelleme, karşılama metni kaydetme, güvenlik/XSS guard.
- Doğrulama notu: ayarlar formu config tabanlı (`DynamicForm`) yapı kullanır.

## Bilinen sorunlar

- `sys_health` hatası için birkaç kez **Yenile** gerekebilir (3’ün katı).

## İlgili kod

- `apps/management/src/features/dashboard/`
- `apps/management/src/components/settings-drawer.tsx`
- Plan: `.cursor/plans/management/01.ana_sayfa_dashboard_05e6fa81.plan.md`

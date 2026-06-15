---
app: customer
screen: settings
route: /settings
updated: 2026-06-02
status: ready
---

# Ayarlar

## Amaç

Dil/tema, bildirim tercihleri, profil bilgisi görüntüleme (mock persist).

## Ön koşullar

- [ ] Oturum açık

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/settings` aç | Ayar grupları |
| 2 | Dil değiştir (TR/EN/AR) | UI metinleri güncellenir |
| 3 | Tema (açık/koyu) | `data-theme` / sınıf değişimi |

## Checklist

- [x] Uygulama Ayarları: dil + tema sekmesi (run 2026-06-02)
- [ ] Kaydet sonrası toast veya sessiz persist
- [ ] RTL (AR) layout kırılmıyor

## İlgili kod

- `apps/customer/src/features/settings/SettingsPage.tsx`
- `apps/customer/src/app/ThemeProvider.tsx`

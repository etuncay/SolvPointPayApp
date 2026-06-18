# @epay/agent

EPay Temsilci Portalı — `apps/management` tabanlı ayrı Vite uygulaması.

## Çalıştırma

```bash
pnpm dev:agent
# veya
pnpm --filter @epay/agent dev
```

URL: http://localhost:5176

## Kimlik

- Paket: `@epay/agent`
- Oturum anahtarı: `epay-agent-auth-session` (`src/config/app.ts`)
- Rol depolama: `epay-agent-portal-role`
- Demo hesap: `agent@epay.demo` / `Epay.1234`

Management ile aynı oturum anahtarlarını paylaşmaz; iki uygulama yan yana çalışabilir.

Mock modda (`VITE_DATA_DRIVER=dexie`, varsayılan) sarı `DemoModeBanner` giriş ve oturum açık ekranlarda görünür.

## Menü yapısı (docs/Agent)

| No | Menü | Route |
|----|------|-------|
| 1 | Ana Sayfa | `/` |
| 2 | Hesaplarım | `/accounts` |
| 3 | Yeni Bireysel Müşteri Kaydı | `/customers/new` |
| 4 | Müşteri Arama & Görüntüleme | `/customers` |
| 5 | Para Çekme | `/withdrawal` |
| 6 | Para Transferi | `/transfers/*` |
| 6.1–6.4 | Alt akışlar | `/transfers/own-wallet`, `bank-account`, `person`, `abroad` |
| 7 | İşlem Hareketleri | `/transactions` |
| 8 | Dilek, Şikâyet ve Öneriler | `/feedback` |
| — | Playground (yalnızca `import.meta.env.DEV`) | `/playground` |

Menüde olmayan akış ekranları (1.1 İşlem Onay, 1.2 İmzalı Dekont, 1.3 Ayarlar) route olarak henüz eklenmedi; Ayarlar üst bar drawer üzerinden erişilir.

Henüz implemente edilmeyen ekranlar `StubPage` yer tutucusu gösterir.

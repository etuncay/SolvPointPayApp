---
screen: transaction-confirmation
route: /transactions/:id
app: agent
updated: 2026-05-31
status: ready
---

# İşlem Onay / Detay / İmzalı Dekont

## Amaç

İşlem detay (salt okunur), onay modu (OTP + güvenlik kontrolleri + kritik beyan), imzalı dekont yükleme ve başarı sayfası akışı.

## Ön koşullar

- [ ] Agent dev server: `http://localhost:5176`
- [ ] Seed: `agentTransactionsStore` (bellek içi, sayfa yenilemede sıfırlanır)

## Route'lar

| Mod | URL |
|-----|-----|
| Detay | `/transactions/{id}` |
| Onay | `/transactions/{id}/approve` |
| İmzalı dekont | `/transactions/{id}/signed-receipt` |
| Başarı | `/transactions/{id}/success` |

## Test verisi (mock işlemler)

| ID | TX No | Durum | Mod | Not |
|----|-------|-------|-----|-----|
| 90001 | TX-AG-90001 | Pending | Onay | Para çekme, Caner Avcı |
| 90002 | TX-AG-90002 | Pending | Onay | Banka transferi, Hatice Acar |
| 90003 | TX-AG-90003 | Pending | Onay + beyan | Yurt dışı, kritik tutar |
| 90004 | TX-AG-90004 | OnHold | Detay | Kişiye transfer |
| 90005 | TX-AG-90005 | Completed | Detay + dekont | İmzalı dekont seed'de var |
| 90006 | TX-AG-90006 | Completed | Detay + dekont | Döviz çekimi |

| Alan | Test değeri |
|------|-------------|
| OTP | Herhangi 6 rakam (ör. `123456`) |
| Güvenlik checkbox | Kimlik, foto, şüphe yok (+ yetkili varsa yetki) |
| İmzalı dekont dosyası | PDF/JPG/PNG, max 5 MB |

## Adımlar — Detay modu

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/transactions/90005` aç | SectionRail + gönderen/alıcı/tutar panelleri |
| 2 | Güvenlik paneli | Salt okunur (OTP/checkbox disabled) |
| 3 | Dekont indir | Tamamlanmış işlemde aktif; yazdırma açılır |
| 4 | Geri | Önceki sayfaya döner |

## Adımlar — Onay modu (normal)

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/transactions/90001/approve` veya dashboard satırı | Onay başlığı; Onayla / Düzenle / İptal |
| 2 | OTP + checkbox'lar boş → Onayla | Hata toast |
| 3 | OTP `123456` + tüm checkbox | Onay başarılı toast |
| 4 | Yönlendirme | `/transactions/90001/signed-receipt` |
| 5 | Dekont yazdır + dosya seç + yükle | `/transactions/90001/success` |
| 6 | Başarı sayfası | Ana sayfaya dön / dekont indir |

## Adımlar — Kritik işlem (beyan)

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/transactions/90003/approve` | FX tutar alanları görünür |
| 2 | Onayla (OTP + checkbox tam) | Beyan modal açılır |
| 3 | İlişki + neden seç, Onayla | Modal kapanır, onay tamamlanır |
| 4 | Other/Unknown neden | Not alanı zorunlu |

## Adımlar — İptal

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | Onay ekranında İptal | Toast + `/` yönlendirme |
| 2 | İşlem durumu | Cancelled |

## Checklist (son durum)

- [ ] Detay / Onay mod ayrımı
- [ ] OTP + güvenlik validasyonu
- [ ] Kritik beyan modalı (90003)
- [ ] İmzalı dekont yükleme + success
- [ ] Hesap hareketlerinden satır tıklama → detay

## Bilinen sorunlar

- Store bellek içi: sayfa yenilemede onaylanan işlemler seed'e döner.

## İlgili kod

- `apps/agent/src/features/transaction-confirmation/`
- Seed: `api/agent-transactions-store.ts`
- Dekont: `apps/agent/src/features/receipt/`

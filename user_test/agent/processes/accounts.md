---
screen: accounts
route: /accounts
app: agent
updated: 2026-05-31
status: ready
---

# Hesaplarım

## Amaç

Temsilci cüzdan bakiyeleri ve hesap hareketleri tablolarının doğru yüklenmesi, filtreleme/arama ve satır tıklayınca işlem detayına yönlendirme.

## Ön koşullar

- [ ] Agent dev server: `http://localhost:5176`
- [ ] Route: `/accounts` (sidebar → Hesaplarım)
- [ ] Seed: `ensureAgentAccountsSeeded()` — IndexedDB, ilk ziyarette otomatik

## Test verisi

| Kaynak | Beklenen |
|--------|----------|
| `apps/data/src/db/seed-accounts.ts` | 4 cüzdan satırı (TRY/USD avans + TRY/EUR komisyon) |
| `generateAgentActivities()` | ~80 hareket satırı |

| Cüzdan No | Tür | Para birimi |
|-----------|-----|-------------|
| CZ-0009001 | Avans | TRY |
| CZ-0009002 | Avans | USD |
| CZ-0009003 | Komisyon | TRY |
| CZ-0009004 | Komisyon | EUR |

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/accounts` aç | PageHead: Hesaplarım + alt başlık |
| 2 | Bakiyeler tablosu | 4 satır; bakiye/bloke/kullanılabilir formatlı; üstte boş FilterBar yok |
| 3 | Hesap türü sütunu | Avans / Komisyon etiketleri |
| 4 | Hareketler — arama | `TX-` veya karşı taraf adı ile filtre |
| 5 | Hareketler — gelişmiş filtre | Yön, işlem türü, cüzdan, tarih, tutar aralığı |
| 6 | Yön sütunu | Para girişi (yeşil) / Para çıkışı (kırmızı) badge |
| 7 | Durum sütunu | Renkli status pill (Completed, Pending, …) |
| 8 | Satıra tıkla | `/transactions/{transactionId}` detay sayfası |
| 9 | Export (hareketler) | Toolbar export butonu görünür |

## Checklist (son durum)

- [ ] Bakiye tablosu 4 satır
- [ ] Hareketler arama + gelişmiş filtre
- [ ] Satır → işlem detayı navigasyonu
- [ ] i18n (tr/en/ar) sütun başlıkları

## Bilinen sorunlar

- (güncel oturumda kaydedin)

## İlgili kod

- `apps/agent/src/features/accounts/`
- Seed: `apps/data/src/db/seed-accounts.ts`

---
app: management
screen: para-transferleri
route: /transfers
updated: 2026-06-02
status: ready
plan: 5.para_transferleri.plan.md
---

# Para Transferleri (5)

## Amaç

15 kolonlu liste, kaynak tutar/PB, IBAN koşullu, status chip + dashboard URL, export, satır → 5.1.

## Ön koşullar

- [x] Management dev
- [x] Fixture: [`fixtures/para-transferleri.md`](../fixtures/para-transferleri.md)

## Adımlar (§20)

| # | Aksiyon | Beklenen | Sonuç |
|---|---------|----------|-------|
| 1 | `/transfers` | Tutar + PB kaynak para birimi | Geçti |
| 2 | `WalletToPerson` satırı | IBAN `—` | Vitest |
| 3 | `WalletToBankAccount` | IBAN dolu | Vitest |
| 4 | Filtre + Dışa Aktar | CSV filtrelenmiş | UI mevcut |
| 5 | Satır tıklama | `/transfers/:id` | Geçti (`/transfers/1`) |
| 6 | `/transfers?status=pending` | Yalnızca Pending | Geçti |
| 7 | ops/compliance/finance | Export görünür | Geçti (compliance) |
| 8 | `TX-DELETED-*` | Listede yok | Vitest |

## Checklist

- [x] Route → `TransfersPage`
- [x] §20 #1, #5–7 (manuel)
- [x] #2, #3, #8 (vitest)

## Ekran Bazlı Dokümantasyon

### 5 Para Transferleri Listesi (`/transfers`)
- Amaç: Transfer kayıtlarını durum/tip/kanal bazında izlemek.
- Görsel doğrulama: kolon seti, IBAN koşullu görünüm, status chip ve export aksiyonu görünür.
- Temel aksiyonlar: filtreleme, satır seçimi, detay ekranına yönlenme.
- Doğrulama notu: liste ekranı `DynamicTable` + config binder standardında çalışır.

### 5.1 İşlem Detay (`/transfers/:transactionId`)
- Amaç: İşlem yaşam döngüsünü panel bazında incelemek ve gerekli müdahaleyi yapmak.
- Görsel doğrulama: read-only panel yapısı, role bağlı müdahale butonları görünür.
- Temel aksiyonlar: bloke et/kaldır, iptal, not ekleme, bağlı cüzdan linkleri.
- Doğrulama notu: müdahale aksiyonları yetki ve durum geçiş kurallarına bağlıdır.

### 5.2 İade/İptal/Düzeltme (`/transfers/manual-correction*`)
- Amaç: Transferlere manuel düzeltme/onay akışını uygulamak.
- Görsel doğrulama: draft/onay modları, `?from=manual` akışı ve guard davranışı doğru.
- Temel aksiyonlar: düzeltme başlatma, onaya gönderme, karar akışı.
- Doğrulama notu: manuel düzeltme akışı transition kuralları ile güvence altındadır.

## İlgili kod

- `apps/management/src/features/transfers/transfers-page.tsx`
- `apps/management/src/features/transfers/api/mock-transactions-adapter.ts`
- Plan: `.cursor/plans/management/5.para_transferleri.plan.md`

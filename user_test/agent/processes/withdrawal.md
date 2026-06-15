---
screen: withdrawal
route: /withdrawal
app: agent
updated: 2026-05-31
status: ready
---

# Para Çekme

## Amaç

Temsilcinin alıcı müşteri sorgusu, cüzdan/tutar kuralları (CustomerPersistent / CustomerTransactional), ücret kademesi tablosu, kimlik tarama (OCR mock), tüzel yetkili kişi, idempotency, sanction ve işlem onay ekranına yönlendirmenin doğrulanması (`docs/Agent/5.para-cekme.md` §20).

## Ön koşullar

- [ ] Agent dev server: `http://localhost:5176` (`pnpm --filter @epay/agent dev`)
- [ ] Route: `/withdrawal` (sidebar → Para Çekme)
- [ ] Mock: `CUSTOMERS`, `WALLETS` (`walletKind`), `agentTransactionsStore` — bellek içi

## Test verisi

| Senaryo | Müşteri No | TCKN / VKN | Not |
|---------|------------|------------|-----|
| Bireysel + düşük KYC + kimlik tarama | `99901` / `MUS-00099901` | `75683988090` | [demo-caner-avci](../fixtures/customers/demo-caner-avci.md) — L1, aktif |
| **CustomerTransactional** (tutar kilidi) | `99901` | `75683988090` | Cüzdan `MS-9901-TX` — TRY, bakiye mock **12.500** |
| İkinci transactional (opsiyonel) | `99909` | `12169489045` | Zeynep Öztürk — `MS-9909-TX`, bakiye **8.750** |
| Bireysel persistent (tutar serbest) | `99902` | `78568632556` | Hatice Acar — L2, yalnızca `MS-9902-01` |
| Bulunamadı → kayıt | `00000001` | `11111111111` | Yeni müşteri kaydı CTA |
| Tüzel + belge eksik uyarısı | — | `3131516608` | Karadeniz Denizcilik — `kyc: Pending` |
| Tüzel + yetkili (onaylı) | — | `1792956117` | Anadolu Gıda — `kyc: Approved`, yetkili `10000000146` |
| Tüzel + sanction (OnHold) | — | `1792956117` | Yetkili TCKN `20000000147` (Sanction Test Kişi) |
| Idempotency | Caner sonrası | — | Referans `REF-AG-90001` (mevcut seed işlem) |

### Mock cüzdan türleri (§8)

| Cüzdan No | Müşteri | `walletKind` | Tutar alanı |
|-----------|---------|--------------|-------------|
| `MS-9901-01` | Caner | CustomerPersistent | Serbest giriş |
| `MS-9901-TX` | Caner | CustomerTransactional | Readonly = available (12.500) |
| `MS-9909-TX` | Zeynep | CustomerTransactional | Readonly = available (8.750) |

Çoklu TRY cüzdanında öncelik: **CustomerTransactional** → formda transactional cüzdan seçilir.

### Tüzel yetkili kişiler (mock — tüm tüzel müşterilerde)

| TCKN | Ad | Sanction |
|------|-----|----------|
| `10000000146` | Ahmet Yetkili | Hayır |
| `20000000147` | Sanction Test Kişi | Evet (isimde `sanction`) |

### Ücret kademeleri (TRY — salt okunur tablo)

| Alt | Üst | Sabit | Oran % |
|-----|-----|-------|--------|
| 0 | 5.000 | 15 | 0,2 |
| 5.000 | 25.000 | 25 | 0,35 |
| 25.000 | ve üzeri | 40 | 0,5 |

Tutar değiştikçe **Aktif** sütununda ilgili kademe vurgulanır.

### OCR mock

- TCKN içinde `0000` geçerse → `ag_wd_err_ocr_mismatch`
- Diğer TCKN + ön/arka yükleme → `ag_wd_ocr_ok`

## Adımlar

### A — Sorgu ve form iskeleti

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/withdrawal` aç | PageHead: Para Çekme + `ag_wd_subtitle` |
| 2 | Müşteri No ve Kimlik No boş → **Sorgula** | Toast: `ag_wd_err_search_required` |
| 3 | TCKN `75683988090` → **Sorgula** | Caner Avcı; form alanları + ücret tablosu görünür |
| 4 | Uyarı bandı | Pembe/bordo; en az `kyc_low` (L1) |
| 5 | Ad Soyad / Unvan | Readonly: **Caner Avcı** |
| 6 | Boş referans + **Devam Et** | Toast: `ag_wd_err_reference_required` |

### B — CustomerTransactional (§20)

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 7 | Caner sorgulandıktan sonra Tutar alanı | **12.500** (veya güncel mock available); input **disabled** |
| 8 | Tutar hint | `ag_wd_hint_transactional` — tüm bakiye çekilir metni |
| 9 | Ücret tablosu | TRY kademeleri; tutara göre aktif kademe badge |
| 10 | İşlem Ref: `WD-TEST-001` → **Devam Et** | Toast: `ag_wd_submit_ok`; yönlendirme `/transactions/{id}?mode=confirm&from=withdrawal` |

### C — Kimlik tarama (bireysel L1+ aktif)

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 11 | Caner sonucu — **Kimlik Tarama** paneli | Görünür (L1 aktif bireysel) |
| 12 | Ülke TUR → Kimlik tipi | **Kimlik Kartı** kilitli (`ag_wd_identity_type_locked`) |
| 13 | Ön + arka belge yükle | OCR başarılı → yeşil `ag_wd_ocr_ok` |
| 14 | TCKN `00000000001` ile test müşterisi (varsa) veya mock | OCR hata → `ag_wd_err_ocr_mismatch` |

### D — Müşteri eksik ve returnTo

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 15 | Bilinmeyen TCKN `11111111111` sorgula | `ag_wd_not_found` + **Yeni Müşteri Kaydı** butonu |
| 16 | **Yeni Müşteri Kaydı** tıkla | `/customers/new?returnTo=/withdrawal&context=withdraw&idNo=11111111111` |
| 17 | Kayıt tamamlayıp `/withdrawal` dönüşü (veya URL ile `?idNo=`) | Otomatik yeniden sorgu (mount’ta `idNo` / `customerNo` query) |

### E — Idempotency

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 18 | Caner bulundu → İşlem Ref: `REF-AG-90001` → **Devam Et** | Toast: `ag_wd_err_duplicate`; yeni işlem oluşmaz |

### F — Tüzel müşteri

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 19 | VKN `3131516608` (Karadeniz) sorgula | Sarı uyarı: `ag_wd_corporate_doc_missing` + **Belge Ekle** |
| 20 | **Belge Ekle** | Belge yükleme modalı açılır (customer-search modal) |
| 21 | VKN `1792956117` (Anadolu) sorgula | **Yetkili Kişi Kimlik No** alanı görünür |
| 22 | Yetkili `99999999999` + ref doldur → **Devam Et** | `ag_wd_err_authorized_invalid` |
| 23 | Yetkili `10000000146` + benzersiz ref → **Devam Et** | Başarı → onay ekranı |
| 24 | Yetkili `20000000147` + benzersiz ref → **Devam Et** | `ag_wd_sanction_hit` toast; işlem **OnHold**; yine onay URL’sine gider |

### G — İşlem onay navigasyonu

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 25 | Başarılı submit sonrası URL | `/transactions/{id}?mode=confirm&from=withdrawal` |
| 26 | Onay ekranı | İşlem detayı / onay modu (`ConfirmationPage`); `WalletWithdrawal` türü |
| 27 | **İptal** (form) | Ana sayfaya veya önceki sayfaya döner |

### H — i18n (opsiyonel)

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 28 | Dil tr → en → ar | `ag_wd_*` etiketler, butonlar, hata mesajları güncellenir |

## Checklist (son durum)

- [ ] Sorgu (Müşteri No / TCKN)
- [ ] Boş sorgu validasyonu
- [ ] Bulunamadı + kayıt CTA + returnTo
- [ ] Uyarı bandı
- [ ] Transactional tutar kilidi + hint
- [ ] Ücret tablosu + aktif kademe
- [ ] Kimlik tarama + TUR tip kilidi + OCR
- [ ] Referans zorunluluğu
- [ ] Idempotency (`REF-AG-90001`)
- [ ] Tüzel belge eksik uyarısı
- [ ] Tüzel yetkili geçerli / geçersiz
- [ ] Sanction OnHold
- [ ] Submit → `/transactions/:id?mode=confirm`
- [ ] i18n (tr/en/ar)

## Bilinen sorunlar

- (güncel oturumda kaydedin)

## İlgili kod

- `apps/agent/src/features/withdrawal/`
- Plan: `.cursor/plans/agent/agent_para_çekme_ec149c11.plan.md`
- Spec: `docs/Agent/5.para-cekme.md`
- Mock cüzdan: `apps/agent/src/mocks/wallets.ts` (`walletKind`, transactional seed)
- İşlem store: `apps/agent/src/features/transaction-confirmation/api/agent-transactions-store.ts`
- Onay ekranı: `apps/agent/src/features/transaction-confirmation/confirmation-page.tsx`

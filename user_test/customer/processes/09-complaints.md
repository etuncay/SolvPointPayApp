---
app: customer
screen: complaints
route: /complaints
updated: 2026-06-18
status: ready
---

# Dilek, şikâyet ve öneriler

## Amaç

Destek talebi formu, konu seçimi, gönderim onayı ve mock'ta BackOffice destek listesine düşme doğrulaması.

## Ön koşullar

- [ ] Oturum açık (dexie / demo)
- [ ] Management BackOffice aynı tarayıcı oturumunda veya feed testi için vitest

## Adımlar — müşteri portalı

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/complaints` aç | Form: konu, iletişim sebebi, mesaj, onay kutusu |
| 2 | Konu + mesaj doldur, onay kutusunu işaretle | **Gönder** aktif |
| 3 | **Gönder** | Başarı kartı; **talep no** (`CASE-…`) görünür |
| 4 | Yeni talep ile tekrarla (opsiyonel) | Her gönderimde yeni `caseNo` |

## Adımlar — mock kalıcılık (otomatik test)

Vitest: `apps/data/src/db/customer-support-case.test.ts`

| # | Kontrol | Beklenen |
|---|---------|----------|
| 1 | `createSupportCase` → Dexie `customerSupportCases` | Kayıt `Open` statüsü |
| 2 | `listSupportCases()` | Oluşturulan kayıt listede |
| 3 | `getCustomerPortalSupportCaseFeed()` | BackOffice köprü feed'inde aynı `caseNo` |

## Adımlar — BackOffice (demo köprüsü)

Vitest: `apps/management/.../mock-support-cases-adapter.test.ts` → `ingests customer portal support case feed`

Manuel (aynı tarayıcı, dexie):

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | Customer'da şikâyet gönder; `caseNo` not al | — |
| 2 | Management → Destek Merkezi listesi | Aynı `caseNo` ve konu satırda |
| 3 | Satır detayı | Talep eden: müşteri no; not: portal tipi |

## Negatif

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | Onay kutusu işaretsiz | Gönder pasif |
| 2 | Mesajda TCKN (11 hane) | Validasyon hatası |

## İlgili kod

- `apps/customer/src/features/complaints/ComplaintPage.tsx`
- `apps/data/src/adapters/dexie/customer-portal-dexie.adapter.ts` — `createSupportCase`, `listSupportCases`
- `apps/data/src/db/customer-support-case-feed.ts` — BackOffice köprüsü
- `apps/management/src/mocks/support-cases-store.ts` — `ingestCustomerPortalSupportCases`

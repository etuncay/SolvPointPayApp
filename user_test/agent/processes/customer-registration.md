---
screen: customer-registration
route: /customers/new
app: agent
updated: 2026-05-31
status: ready
---

# Yeni Bireysel Müşteri Kaydı

## Amaç

4 sekmeli kayıt formu: kimlik kapısı, OCR, lookup, taslak/kaydet, iletişim ve belge listesi.

## Ön koşullar

- [ ] Agent dev server: `http://localhost:5176`
- [ ] Route: `/customers/new`
- [ ] Seed: `ensureAgentRegistrationsSeeded()` (sayfa açılışında)

## Test verisi

| Senaryo | Müşteri dosyası | TCKN |
|---------|-----------------|------|
| Lookup (normal) | [demo-caner-avci.md](../fixtures/customers/demo-caner-avci.md) | 75683988090 |
| Pending transfer | [demo-hatice-acar.md](../fixtures/customers/demo-hatice-acar.md) | 99988877760 |
| Yeni + OCR | [demo-yeni-kayit-ocr.md](../fixtures/customers/demo-yeni-kayit-ocr.md) | 12345678901 |
| Lookup yok | — | 28828449566 |

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | Sayfayı aç | Tek başlık; üstte Sorgula + Taslak/Kaydet/Vazgeç |
| 2 | Sorgula: 75683988090 | Form dolar, bilinen müşteri banner |
| 3 | Kimlik ön/arka yükle (yeni kayıt) | Nüfus sekmesi açılır; TUR'da OCR mock |
| 4 | Cinsiyet | Radio görünür; OCR sonrası kilitli (TUR) |
| 5 | Şüpheli işlem | Switch toggle görünür |
| 6 | İletişim sekmesi | Adres + iletişim repeater |
| 7 | Yüklü belgeler | Tablo; yüklenen belgeler listelenir |
| 8 | Taslak kaydet | Toast + yönlendirme |

## Checklist (son durum)

- [x] Tek sayfa başlığı (shell/header birleşimi)
- [x] Radio / Switch CSS düzeltmesi
- [x] İletişim + belgeler kartları içerik gösterimi
- [ ] Tam §20 spec manuel turu

## Bilinen sorunlar

- (güncel oturumda kaydedin)

## İlgili kod

- `apps/agent/src/features/customer-registration/`
- Plan: `.cursor/plans/agent/agent_bireysel_müşteri_kaydı_1c68b842.plan.md`

## İlişkili süreçler

- [Ana sayfa — bekleyen müşteriler](../processes/dashboard.md)
- [İşlem onay](../processes/transaction-confirmation.md) (pending transfer kilidi: Hatice Acar)

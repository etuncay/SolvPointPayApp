---
app: agent
id: new
slug: demo-yeni-kayit-ocr
purpose: ocr-mock
source: manual
updated: 2026-05-31
---

# Yeni kayıt + OCR mock (TUR)

## Kimlik

| Alan | Değer |
|------|-------|
| TCKN | `12345678901` (seed'de yok — yeni kayıt) |
| Ad | Test |
| Soyad | Kullanıcı |
| Uyruk | TUR |
| Kimlik tipi | TCKN (kilitli) |

## Kullanım senaryosu

Sıfırdan kayıt: kimlik ön/arka yükle → mock OCR nüfus alanlarını doldurur.

## Adımlar

1. `/customers/new` — TCKN ve ad/soyad gir
2. Kimlik ön + arka dosya seç (herhangi bir görsel/PDF)
3. Nüfus sekmesi açılır; doğum yeri, anne/baba adı vb. dolu gelir
4. Cinsiyet: Erkek seçili, OCR kilidi ile düzenlenemez

## OCR hata senaryosu

| TCKN | Sonuç |
|------|-------|
| `00001234567` (`0000` içerir) | OCR kalite hatası toast |

## Notlar

- Lookup yapılmaz; form boş başlar.

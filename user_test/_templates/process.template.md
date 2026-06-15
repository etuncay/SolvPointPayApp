---
app: {{APP_SLUG}}
screen: {{SCREEN_SLUG}}
route: {{ROUTE}}
dev_url: {{DEV_URL}}
auth: {{AUTH_NOTE}}
updated: {{YYYY-MM-DD}}
status: draft
tested_by: manual
---

# {{SCREEN_TITLE}}

## Amac

Bu ekranda ne dogrulanir? (1-2 cumle)

## On kosullar

- [ ] Uygulama calisiyor: `{{DEV_COMMAND}}` -> {{DEV_URL}}
- [ ] Oturum / rol: {{AUTH_NOTE}}
- [ ] Test verisi: [`../fixtures/{{FIXTURE_SLUG}}.md`](../fixtures/{{FIXTURE_SLUG}}.md) *(varsa)*

## Test verisi

| Alan | Deger | Not |
|------|-------|-----|
| | | |

## Adimlar (manuel kullanici icin)

| # | Aksiyon | Beklenen sonuc |
|---|---------|----------------|
| 1 | Ekrana git: {{ROUTE}} | Ekran yuklenir |
| 2 | | |
| 3 | | |

## CRUD / form senaryolari

| Senaryo | Girdi | Beklenen |
|---------|-------|----------|
| Olustur (create) | gecerli form | kayit eklenir + onay |
| Duzenle (update) | alan degisikligi | guncellenir + onay |
| Sil (delete) | sil + onayla | kayit kalkar |
| Dogrulama hatasi | gecersiz/eksik girdi | alan hatasi gosterilir |

## Otomatik test sonucu (cursor-ide-browser)

| Calistirma | Sonuc | Not |
|------------|-------|-----|
| {{YYYY-MM-DD}} | Pass / Partial / Fail | |

## Bilinen sorunlar

- (yok)

## Ilgili kod

- Feature: `{{CODE_PATH}}`
- Plan: `{{PLAN_PATH}}`

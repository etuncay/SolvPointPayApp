---
app: {{APP_SLUG}}
id: {{FIXTURE_ID}}
slug: {{FIXTURE_SLUG}}
purpose: {{lookup | create | edit | error-case | generated}}
source: {{seed | manual | generated}}
updated: {{YYYY-MM-DD}}
---

# {{FIXTURE_TITLE}}

## Kullanim senaryosu

Hangi ekranda, hangi adimda kullanilir? (1-2 cumle)

## Alanlar

| Alan | Deger | Not |
|------|-------|-----|
| | | |

## Beklenen sistem davranisi

- 

## Notlar

- Gercek kisi verisi kullanilmaz; sentetik / mock seed degerleri girin.
- Konum: `user_test/{{APP_SLUG}}/fixtures/`

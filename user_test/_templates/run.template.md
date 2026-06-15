---
app: {{APP_SLUG}}
date: {{YYYY-MM-DD}}
scope: {{ekran / modul / smoke}}
mode: {{auto-browser | manual | both}}
result: {{Pass | Partial | Fail}}
---

# {{YYYY-MM-DD}} - {{SCOPE_TITLE}}

## Ortam

- Uygulama: {{APP_SLUG}} -> {{DEV_URL}}
- Oturum / rol: {{AUTH_NOTE}}
- Mock seed: {{evet | hayir}}

## Sonuc ozeti

| Ekran | Senaryo | Sonuc | Not |
|-------|---------|-------|-----|
| | create/update/delete | Pass / Partial / Fail | |

## Engeller (varsa)

- login / captcha / 2FA / eksik veri -> ne yapildi, ne beklenmekte

## Acilan kayitlar / takip

- 

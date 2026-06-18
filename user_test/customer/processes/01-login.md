---
app: customer
screen: login
route: /login
updated: 2026-06-18
status: ready
---

# Giriş ve OTP

## Amaç

Kimlik + parola, ardından OTP adımı; başarılı oturumda ana sayfaya yönlendirme. Demo modda geliştirici notu ve demo hesap kutusu görünür.

## Ön koşullar

- [ ] `pnpm --filter @epay/customer dev` → http://localhost:5174
- [ ] Mock (dexie) sürücü — `VITE_DATA_DRIVER` yok veya `dexie`
- [ ] Fixture: [demo-customer.md](../fixtures/demo-customer.md)

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/login` aç | Demo modda mavi uyarı bandı + geliştirici oturum notu (`epay-customer-authed`) |
| 2 | Demo hesap kutusunda müşteri no tıkla | Alanlar `CUS-4827193` / `Demo123!` ile dolar |
| 3 | **Devam et** | OTP ekranı |
| 4 | **Demo OTP: 123456** kutusundan doldur veya `123456` gir | `/` ana sayfa |
| 5 | Çıkış / tekrar giriş | `sessionStorage` oturum sıfırlanır |

## Demo mod dışı (`VITE_DATA_DRIVER=http` + API URL)

- Demo notu ve demo hesap kutusu **görünmez**
- Varsayılan parola alanı **boş**
- OTP ipucu kutusu görünmez (`DemoOtpHint` gizli)

## Checklist

- [ ] Hatalı parola mesajı
- [ ] Demo OTP kutusu (`DemoOtpHint`) — login ve `/confirm`
- [ ] Geliştirici oturum notu (`sessionStorage` / `epay-customer-authed`)
- [ ] Demo hesap kutusu + tıklanabilir müşteri no
- [x] OTP sonrası header'da profil / dil seçici (run 2026-06-02)

## İlgili kod

- `apps/customer/src/features/auth/LoginPage.tsx`
- `apps/customer/src/features/auth/LoginDevDemoNote.tsx`
- `apps/customer/src/components/DemoOtpHint.tsx`
- `apps/customer/src/config/demo-otp.ts`
- `apps/data` → `customerPortalApi.login` / `verifyOtp`

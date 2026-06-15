---
app: customer
screen: login
route: /login
updated: 2026-06-02
status: ready
---

# Giriş ve OTP

## Amaç

Kimlik + parola, ardından OTP adımı; başarılı oturumda ana sayfaya yönlendirme.

## Ön koşullar

- [ ] `pnpm --filter @epay/customer dev` → http://localhost:5174
- [ ] Fixture: [demo-customer.md](../fixtures/demo-customer.md)

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/login` aç | Form: müşteri no / parola |
| 2 | `CUS-4827193` + `Demo123!` gönder | OTP ekranı |
| 3 | 6 haneli OTP gir | `/` ana sayfa |
| 4 | Çıkış / tekrar giriş | Oturum sıfırlanır |

## Checklist

- [ ] Hatalı parola mesajı
- [x] OTP sonrası header’da profil / dil seçici (run 2026-06-02)

## İlgili kod

- `apps/customer/src/features/auth/LoginPage.tsx`
- `apps/data` → `customerPortalApi.login` / `verifyOtp`

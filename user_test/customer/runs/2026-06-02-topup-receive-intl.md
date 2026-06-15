---
app: customer
module: topup-receive-intl
date: 2026-06-02
tester: agent
environment: local dev (Vite port 5175)
---

# Run — Para yükle, para al, yurt dışı

## Süreçler

- [06-topup.md](../processes/06-topup.md)
- [07-receive.md](../processes/07-receive.md)
- [08-transfer-intl.md](../processes/08-transfer-intl.md)

## Otomasyon

| Komut | Sonuç |
|-------|-------|
| `pnpm --filter @epay/customer test` | **5/5** |
| `pnpm --filter @epay/customer build` | Başarılı |

## Manuel (browser)

| Senaryo | Sonuç |
|---------|-------|
| `/topup` talimat + IBAN kopyala | Geçti |
| `/receive` IBAN + tutar → `/confirm` | Geçti |
| `/send/intl` form + BAE risk uyarısı | Geçti |
| Intl BAE → `/confirm` | Geçti |

## Sonuç

**Kabul edildi** — üç ekran süreç dokümantasyonu + temel browser doğrulama tamam.

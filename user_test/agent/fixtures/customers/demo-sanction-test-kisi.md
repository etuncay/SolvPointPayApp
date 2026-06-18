---
app: agent
id: authorized-person
slug: demo-sanction-test-kisi
purpose: compliance-sanction
source: apps/agent/src/features/agent-transactions/domain/customer-lookup.ts
updated: 2026-06-18
---

# Sanction Test Kişi (tüzel yetkili)

## Kimlik

| Alan | Değer |
|------|-------|
| TCKN | `20000000147` |
| Ad soyad | Sanction Test Kişi |
| Tip | Tüzel müşteri yetkili kişisi (sabit mock listesi) |

## Kullanım

Tüm **tüzel** müşterilerde yetkili kişi listesinde görünür. Çekim veya transferde **Yetkili Kişi Kimlik No** alanına yazıldığında sanction ekranı tetiklenir (isimde `sanction`).

### Örnek ana müşteri

| Alan | Değer |
|------|-------|
| Şirket | Anadolu Gıda Üretim A.Ş. |
| VKN | `1792956117` |
| Müşteri no | `99903` / `MUS-00099903` |
| KYC | Approved (temiz tüzel profil) |

## Beklenen

| Akış | Sonuç |
|------|-------|
| Para çekme + bu yetkili | İşlem **OnHold**; `ag_wd_sanction_hit` |
| Karşılaştırma: `10000000146` Ahmet Yetkili | Normal **Pending** |

## İlgili

- [compliance-scenarios.md](../compliance-scenarios.md) — S8, senaryo A
- [withdrawal.md](../../processes/withdrawal.md) — § F

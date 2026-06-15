---
app: management
slug: temsilciler
purpose: Temsilciler modülü (3.0–3.4) manuel ekran testleri için ortak mock veri ve rol referansı
source: apps/management/src/mocks + features/*/api
updated: 2026-06-01
---

# Fixture — Temsilciler (3.0–3.4)

Gerçek TCKN/VKN/telefon **kullanmayın**; aşağıdaki değerler yalnızca mock seed içindir.

## Ortam

| Alan | Değer |
|------|-------|
| Uygulama | `@epay/management` |
| Dev komutu | `pnpm --filter @epay/management dev` |
| Varsayılan URL | `http://localhost:5173` |
| Rol depolama | `sessionStorage` anahtarı: `epay-backoffice-role` |
| Rol URL override | `?role=ops` \| `finance` \| `compliance` \| `management` |

## Roller — beklenen yetkiler (özet)

| Rol | 3.0 Liste | 3.1 Form | 3.2 Yetkili | 3.3 Grup | 3.3.1 Atama | 3.4 Ücret |
|-----|-----------|----------|-------------|----------|-------------|-----------|
| `ops` | list, export, insert, view | insert, update, block | insert, update, block | CRUD + pasife al | list, insert, remove | list, export |
| `finance` | list, view | view | view | list | list | list, export, **modal CRUD** |
| `compliance` | list, export, view, update | update, block (**insert yok**) | update, block (**insert yok**) | list only | list only | list only |
| `management` | tam | tam | tam | tam | tam | tam |

## Temsilci (3.0 / 3.1)

| Alan | Değer | Kaynak |
|------|-------|--------|
| Örnek temsilci ID | `99901` | `SAMPLE_AGENT` / liste seed |
| Temsilci kodu | `AGT-099901` | UI format |
| Unvan | Anadolu Gıda Üretim A.Ş. | `sample-agent.ts` |
| VKN | `1792956117` | VKN lookup demo |
| Varsayılan grup key | `standard` → `STANDARD` | `agent-groups` seed |
| Demo grup (aktif atama) | `gold` → `GOLD` | `SAMPLE_AGENT.groupKey` |

## Yetkili kişi (3.2)

| Alan | Değer | Kaynak |
|------|-------|--------|
| Seed kişi ID | `88001` | `sample-authorized-person.ts` |
| Kişi no | `KIS-088001` | — |
| Demo TCKN (KPS) | `12345678901` | `SAMPLE_PERSON` |
| Doğum tarihi (KPS uyumlu) | `1991-04-18` | `SAMPLE_PERSON.birthDate` |
| 18 yaş altı test | Örn. `2010-01-01` | validation `ap2_under_18` |

## Grup master (3.3 / 3.3.1 / 3.4)

| Grup kodu | Ad | Status | Not |
|-----------|-----|--------|-----|
| `STANDARD` | Standart | Active | Varsayılan grup; pasife alınamaz |
| `GOLD` | Altın | Active | Atama testi; tarihsel Passive demo (agent `99901`) |
| `SILVER` | Gümüş | Active | İkinci gruba atama senaryosu |
| `PLATINUM` | Platin | Active | Ücret kademe testi (0 / 10000 / 50000 TRY) |
| `BRONZE` | Bronz | Active | — |
| `LEGACY_TIER` | Eski Tarife | **Passive** | Atama engeli; `aga_passive_group` |

## Ücret / komisyon (3.4)

| Senaryo | Grup | İşlem | PB | Alt limit | Not |
|---------|------|-------|-----|-----------|-----|
| Base tier | Her aktif grup | `WalletToPerson` | `TRY` | `0` | Zorunlu aktif kayıt |
| Kademe (§20 #2) | `PLATINUM` | `WalletToPerson` | `TRY` | `10000`, `50000` | 15.000 TRY → %0.2 kademe |
| Pasif grup fee | `LEGACY_TIER` | — | — | — | Salt listeleme; yeni kayıt `afee_passive_group` |

## Atama (3.3.1)

| Senaryo | Agent | Beklenen |
|---------|-------|----------|
| Tarihsel Passive | `99901` @ `GOLD` filtresi Pasif | Eski GOLD ataması görünür |
| Başka gruba ata | `99927` (BRONZE → GOLD) | BRONZE aktif sayısı −1; GOLD +1 |
| Gruptan çıkar | Aktif satır → onay | Varsayılan `STANDARD` aktif atama |

## Otomasyon öncesi (isteğe bağlı)

```bash
pnpm --filter @epay/management test -- src/features/agents src/features/agent-form src/features/authorized-person-form src/features/agent-groups src/features/agent-fees
pnpm --filter @epay/management build
```

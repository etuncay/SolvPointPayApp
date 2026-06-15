---
app: management
screen: temsilciler-modulu-index
route: /agents
updated: 2026-06-01
status: ready
---

# Temsilciler — İndeks (3.0–3.4)

Modül bazlı süreç dosyalarına giriş. Detaylı adımlar her dosyada; ortak fixture tek yerde.

## Genel ön koşullar

- [ ] `pnpm --filter @epay/management dev` → `http://localhost:5173`
- [ ] Giriş yapılmış oturum
- [ ] Fixture: [`fixtures/temsilciler.md`](../fixtures/temsilciler.md)
- [ ] Rol: `?role=ops|finance|compliance|management`

## Süreç dosyaları

| No | Ekran | Süreç | Route |
|----|-------|-------|-------|
| 3.0 | Temsilciler listesi | [03-temsilciler-liste.md](03-temsilciler-liste.md) | `/agents` |
| 3.1 | Yeni / düzenle temsilci | [03.1-yeni-temsilci.md](03.1-yeni-temsilci.md) | `/agents/new`, `/agents/:agentId` |
| 3.2 | Yeni yetkili kişi | [03.2-yeni-yetkili-kisi.md](03.2-yeni-yetkili-kisi.md) | `/agents/authorized-persons/...` |
| 3.3 | Grup yönetimi | [03.3-temsilci-grup-yonetimi.md](03.3-temsilci-grup-yonetimi.md) | `/agents/groups` |
| 3.3.1 | Temsilci–grup ilişkisi | [03.3.1-temsilci-grup-iliskisi.md](03.3.1-temsilci-grup-iliskisi.md) | `/agents/groups/:groupCode/agents` |
| 3.4 | Ücret ve komisyonları | [03.4-temsilci-ucretleri.md](03.4-temsilci-ucretleri.md) | `/agents/fees` |

Menü: **Operasyon → Temsilciler** (3.1–3.4 alt linkleri).

## Uçtan uca akış (önerilen sıra)

1. [03.3-temsilci-grup-yonetimi.md](03.3-temsilci-grup-yonetimi.md) — GOLD → Temsilciler linki
2. [03.3.1-temsilci-grup-iliskisi.md](03.3.1-temsilci-grup-iliskisi.md) — atama / pasif filtre
3. [03-temsilciler-liste.md](03-temsilciler-liste.md) — grup kolonu güncel mi
4. [03.1-yeni-temsilci.md](03.1-yeni-temsilci.md) — `99901` düzenle
5. [03.2-yeni-yetkili-kisi.md](03.2-yeni-yetkili-kisi.md) — yetkili form + 3.1 linki
6. [03.4-temsilci-ucretleri.md](03.4-temsilci-ucretleri.md) — `finance` rolü; PLATINUM kademeler

## Bilinen notlar

- Tam sayfa yenileme mock assignment store’u sıfırlar; 3.3.1’de SPA navigasyonu kullanın.
- Dev port çakışmasında Vite alternatif port açabilir (terminal çıktısına bakın).

## Kod kökü

```text
apps/management/src/features/
  agents/                  # 3.0
  agent-form/              # 3.1
  authorized-person-form/  # 3.2
  agent-groups/            # 3.3 + 3.3.1
  agent-fees/              # 3.4
```

## Run kayıtları

Modül başına: `runs/YYYY-MM-DD-{screen-slug}.md`  
Paket özeti: `runs/YYYY-MM-DD-temsilciler-modulu.md`

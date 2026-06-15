---
app: management
slug: dokuman-yonetim-sistemi
purpose: Doküman Yönetim Sistemi (9, 9.1–9.4) manuel testleri için ortak mock veri ve rol referansı
source: apps/management/src/features/dms
updated: 2026-06-01
---

# Fixture — Doküman Yönetim Sistemi (9.x)

## Ortam

| Alan | Değer |
|------|-------|
| Uygulama | `@epay/management` |
| Dev | `pnpm --filter @epay/management dev` |
| URL | `http://localhost:5173` (meşgulse `5174+`; son doğrulama `5177`) |
| Oturum | `compliance@epay.demo`, `management@epay.demo`, `ops@epay.demo` — parola `Epay.1234` |

## Menü (plan 9)

| Rol | 9 Liste | 9.1 Yeni | 9.3 Tipler |
|-----|---------|----------|------------|
| `ops` | ✓ (tür yetkisine göre satır) | ✓ | — |
| `compliance` | ✓ | ✓ | ✓ |
| `management` | ✓ (tümü) | ✓ | ✓ |
| `finance` | Kısmi (tür viewer) | Tür yetkisine bağlı | — |

Menü grubu: **Doküman Yönetim Sistemi** (`/documents`), alt: 9.1, 9.3.

## Örnek kayıtlar

| ID | Route | Not |
|----|-------|-----|
| `DOC-001` | `/documents/DOC-001` | Kimlik — compliance/management detay |
| `DOC-DETAIL-001` | `/documents/DOC-DETAIL-001` | Detay paneli (metadata, ilişki, dosya) |
| `DOC-003` | `/documents/DOC-003` | Rejected — durum pill |
| `DT-IDCARD` | `/documents/types/DT-IDCARD/edit` | Standart tip düzenleme (9.4) |
| Yeni tip | `/documents/types/new` | 9.4 oluşturma |

Deep link (liste): `/documents?relationType=Customer&relationId=10042`

Tarama hatası simülasyonu: `/documents/new?simulateScanFail=1`

## Otomasyon

```bash
pnpm --filter @epay/management exec vitest run src/features/dms   # 54 passed
pnpm --filter @epay/management build
```

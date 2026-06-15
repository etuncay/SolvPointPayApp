---
app: management
module: dokuman-yonetim-sistemi
date: 2026-06-01
tester: agent
environment: local dev (http://localhost:5177)
---

# Run — Doküman Yönetim Sistemi (9, 9.1–9.4)

## Kod değişikliği

| Dosya | Değişiklik |
|-------|------------|
| `routes.tsx` | Tüm `/documents/*` placeholder → gerçek DMS sayfaları |
| `mocks/documents.ts` | Seed **24** kayıt (DOC-001…020 + DETAIL) |
| `mocks/document-relations.ts` | Genişletilmiş ilişkiler; DOC-003 → `REF-880001` |
| `mock-documents-adapter.ts` | §17 `applyArchiveExpiredBatch` seed yüklemede; test export |
| `use-documents.tsx` + `documents-page.tsx` | Deep link ilişki filtresi + temizle (URL sync) |
| `transaction-detail-page.tsx` | `td_dms_view_all` → `/documents?relationType=Transaction&relatedId=` |

## Otomasyon

| Komut | Sonuç |
|-------|-------|
| `vitest run src/features/dms` | **59/59** |
| `pnpm --filter @epay/management build` | Başarılı |

## Manuel (özet)

| Rol | Route | Beklenen | Sonuç |
|-----|-------|----------|-------|
| ops (oturum) | `/documents` | Liste + filtreler + 9.1/9.3 menü | Geçti |
| ops | `/documents/new` | Yükleme formu | Geçti |
| ops | `/documents/types` | Erişim yok mesajı | Geçti |
| ops | `/documents/DOC-001` | Yetkisiz / bulunamadı | Geçti (beklenen) |
| compliance* | `/documents/DOC-DETAIL-001` | Detay panelleri | Süreç dokümanı + vitest |
| ops | `/documents?relationType=Transaction&relatedId=REF-880001` | DOC-003, DOC-013 | Filtre rozeti + temizle |
| ops | `/transfers/1` → DMS link | İşlem ref ile liste | `td_dms_view_all` |

\*Compliance/management detay için fixture’taki `DOC-DETAIL-001` kullanın.

## Plan durumu

| Plan | Todo |
|------|------|
| 9, 9.1, 9.2, 9.3, 9.4 | `completed` (migrate-json → `cancelled`) |

## Sonuç

**Kabul edildi**

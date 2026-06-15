# Cursor Agent Rehberi — Plan, UI Standardı ve Prompt Şablonları

Bu belge **Türkçe kopyala-yapıştır prompt** şablonları içerir. `.cursor` altındaki talimatlar (skills, rules, `_shared/*.md`) **İngilizce** yazıldı; agent bunları okur, size ve plan dosyalarına **Türkçe** yanıt üretir.

**Dil ayrımı:** [`.cursor/plans/_shared/output-locale.md`](../.cursor/plans/_shared/output-locale.md)

| Ne | Dil |
|----|-----|
| Bu rehber + prompt metinleri | Türkçe |
| `.cursor` skills / rules | İngilizce |
| Üretilen `*.plan.md` gövdesi | Türkçe |
| Kod, JSON key, dosya adları | İngilizce |

Teknik referanslar:

| Konu | Dosya |
|------|-------|
| UI DSL (DynamicTable/Form) | [`.cursor/plans/_shared/ui-pattern.md`](../.cursor/plans/_shared/ui-pattern.md) |
| Modüller arası tutarlılık | [`.cursor/plans/_shared/ui-consistency.md`](../.cursor/plans/_shared/ui-consistency.md) |
| Çıktı dili kuralı | [`.cursor/plans/_shared/output-locale.md`](../.cursor/plans/_shared/output-locale.md) |
| Ekran testi (browser MCP) | [`.cursor/plans/_shared/screen-verification.md`](../.cursor/plans/_shared/screen-verification.md) |
| Plan oluşturma skill | [`.cursor/skills/implementation-plan/SKILL.md`](../.cursor/skills/implementation-plan/SKILL.md) |
| Cursor yapılandırma özeti | [`.cursor/README.md`](../.cursor/README.md) |
| Spec ekran kuralları | [`Management/0.genel-standartlar.md`](Management/0.genel-standartlar.md) §0.2 |

---

## 1. Ne zaman hangi mod?

| Amaç | Mod | Tetikleyici ifadeler |
|------|-----|----------------------|
| Uygulama planı yaz | Plan | "plan oluştur", "uygulama planı", spec eki `@docs/Management/...` |
| Planı koda dök | Implement | "Implement the plan", "planı uygula", `@.cursor/plans/...` |
| Yeni modül iskeleti | Scaffold | "yeni modül", "scaffold", "feature ekle" |
| Hata / uçtan uca onarım | Fix | "fix", "çalışmıyor", "make X work" |

**Not:** Aynı mesajda "fix" ve "plan" birlikte geçerse yanlış skill tetiklenebilir. Plan için net ifade kullanın.

---

## 2. Plan oluşturma — örnek prompt

Spec dosyasını `@` ile ekleyin.

```text
@docs/Management/2.6.musteri-kampanya-yonetimi.md

2.6 Müşteri Kampanya Yönetimi için uygulama planı oluştur.

Kurallar:
- Önce .cursor/skills/implementation-plan/SKILL.md uygula (UI-first akış)
- UI: DynamicTable/DynamicForm + config/*.json; ui-pattern.md + ui-consistency.md
- customer-notes / inline itable referans ALMA; referans: playground + customers
- Planı .cursor/plans/management/ altına kaydet; YAML todos status: pending
- Plan gövdesine ## UI pattern (zorunlu) ve ## UI tutarlılık (checklist) ekle
- Implementasyon yapma — yalnızca plan
```

---

## 3. Plan uygulama — örnek prompt

Plan dosyasını `@` ile ekleyin.

```text
@.cursor/plans/management/2.6_kampanya_yönetimi.plan.md

Implement the plan as specified. Do NOT edit the plan body (mimari, tablolar, dosya ağacı).

İzin verilen plan düzenlemesi: YAML frontmatter içinde yalnızca todos[].status (pending → completed | cancelled).

Uygulama kuralları:
1. UI-first: liste DynamicTable + config/*.table.config.json + *-table-config.ts + localize-config.ts
2. Form varsa DynamicForm + config/*.form.config.json
3. ui-consistency.md: pagination 20, hideColumnFilters true, header title+subtitle, permissions toolbar
4. Veri: binder (workspace `apps/data`) veya feature mock adapter — sayfada doğrudan mock import yok
5. i18n: tr/en/ar anahtarları; hardcoded metin yok
6. Referans modül: apps/management/src/features/customers/ ve playground/

Todo'lar:
- Sırayla uygula; her todo bitince plan YAML status completed yap
- *-verify: pnpm test + build
- *-screen-test (son): cursor-ide-browser ile ekran testi — .cursor/plans/_shared/screen-verification.md
  - Dev sunucu ayakta (management: pnpm --filter @epay/management dev)
  - Demo giriş: finance@epay.demo / ops@epay.demo + OTP demo kodu
  - Yanıtta ## Ekran testi sonuçları tablosu (Türkçe)

Do NOT create todos again — mevcut plan todos kullan.
```

---

## 4. Sadece UI migrasyon — örnek prompt

Legacy inline tablo veya manuel formu JSON'a taşımak için:

```text
@apps/management/src/features/customer-fees/
@.cursor/plans/_shared/ui-consistency.md
@.cursor/plans/_shared/ui-pattern.md

customer-fees modülünü DynamicTable + DynamicForm mimarisine migrate et.

Kısıtlar:
- Domain/api/mock mantığı aynı kalır; yalnızca UI katmanı değişir
- Inline itable + editingId/draft kaldır; düzenleme DynamicForm (modal veya /edit route)
- config/customer-fees.table.config.json + customer-fees-table-config.ts + localize-config.ts
- customers + document-review ile aynı filtre/pagination/export UX
- Mevcut testler geçmeli; gerekirse domain testleri koru
- pnpm --filter @epay/management build

Plan dosyasını değiştirme (ayrı istek değilse).
```

---

## 5. UI tutarlılık denetimi — örnek prompt

```text
@apps/management/src/features/document-review/
@.cursor/plans/_shared/ui-consistency.md

document-review modülünü ui-consistency.md checklist'ine göre denetle.
Eksikleri listele (pagination, hideColumnFilters, header, export, i18n, customFunctions).
Sadece rapor ver — değişiklik yapma.
```

---

## 6. Plan + implement tek oturum — örnek prompt

```text
@docs/Management/2.5.musteri-ucret-komisyonlari.md

Adım 1 — Plan:
- implementation-plan skill; UI-first; kaydet .cursor/plans/management/
- Onay bekleme: planı yazdıktan sonra özet göster

Adım 2 — Implement (plan onayından sonra aynı oturumda):
- Planı uygula; inline CRUD kullanma; DynamicTable + form modal/route
- todos status güncelle; build doğrula
```

Tek mesajda iki adım risklidir; genelde **önce plan, sonra ayrı mesajda implement** tercih edilir.

---

## 7. Handoff (oturum devri) — örnek prompt

```text
Bu oturumu handoff doc ile kapat. Kalan plan todos, dosya yolları ve bir sonraki agent için önerilen prompt'u yaz.
@.cursor/skills/handoff/SKILL.md
```

---

## 8. Agent'tan beklenen teslim özeti

Implement tamamlandığında agent şu özeti vermeli:

| Todo id | Durum | Kanıt |
|---------|-------|-------|
| `*-table-json` | completed | `config/*.table.config.json` path |
| `*-verify` | completed | build çıktısı, checklist maddeleri |

Ayrıca:

- Oluşturulan/değişen dosya listesi (kısa)
- §20 / spec kabul senaryoları — test veya manuel adım
- Bilinen istisna veya migrasyon borcu

---

## 9. Sık hatalar

| Hata | Doğrusu |
|------|---------|
| customer-notes inline pattern kopyalamak | DynamicTable + JSON; düzenleme form/modal |
| Plan gövdesini implement sırasında değiştirmek | Yalnızca YAML `todos[].status` |
| Chat todo completed, plan YAML pending | Her iki yerde de güncelle |
| Kolonları TSX'te hardcode | `*.table.config.json` |
| "Do NOT edit plan" → hiç YAML güncellenmemesi | Frontmatter status güncellemesi **izinli** |
| Her modülde farklı pagination | `defaultPageSize: 20`, `[10,20,50,100]` |

---

## 10. Hızlı @ referans listesi

Plan / implement oturumunda sık eklenen dosyalar:

```text
@.cursor/plans/_shared/ui-pattern.md
@.cursor/plans/_shared/ui-consistency.md
@.cursor/skills/implementation-plan/SKILL.md
@apps/management/src/features/playground/
@apps/management/src/features/customers/
@docs/Management/0.genel-standartlar.md
```

Agent kanalı için `apps/agent/src/features/playground/` ve `customer-registration/` referans alınır.

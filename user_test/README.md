# user_test — Ekran testi arşivi

Manuel / tarayıcı ekran testlerinde kullanılan **süreçler** ve **fixture** bilgileri burada Markdown olarak tutulur.

## Uygulama ayrımı

| Klasör | Proje | Dev komutu |
|--------|-------|------------|
| [`agent/`](agent/) | Temsilci — `apps/agent` | `pnpm --filter @epay/agent dev` → `:5176` |
| [`management/`](management/) | Backoffice — `apps/management` | `pnpm --filter @epay/management dev` → `:5173` |
| [`customer/`](customer/) | Müşteri portalı *(rezerve)* | — |

**Önemli:** `agent/fixtures/customers/` test müşteri verisidir; `customer/` klasörü müşteri **uygulaması** testleridir — karıştırmayın.

## Alt klasörler (her uygulama)

| Alt klasör | İçerik |
|------------|--------|
| `processes/` | Ekran akışı, adımlar, checklist |
| `fixtures/` | Mock veri (müşteri, işlem, kullanıcı…) |
| `runs/` | Oturum bazlı sonuç kayıtları |

## Hızlı başlangıç

1. Ana indeks: [`index.md`](index.md)
2. Agent testleri: [`agent/index.md`](agent/index.md)
3. Skill: `@screen-test-protocol` veya "ekran testi yap"

## Kurallar

- Her süreç/fixture frontmatter'da `app: agent | management | customer` zorunlu.
- Gerçek TCKN / telefon / e-posta **yazmayın** — mock seed veya sentetik değerler.
- Test bitince checklist güncelle + `runs/YYYY-MM-DD-*.md` ekle.
- Kod değişikliği bu klasörde yapılmaz; yalnızca test dokümantasyonu.

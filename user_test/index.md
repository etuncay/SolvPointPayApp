# user_test indeks

EPay ekran testleri **uygulama bazında** ayrılır. Her projenin kendi süreç, fixture ve run klasörü vardır.

| Uygulama | Kod | Dev URL | İndeks |
|----------|-----|---------|--------|
| **Agent** (temsilci) | `apps/agent` | `http://localhost:5176` | [agent/index.md](agent/index.md) |
| **Management** (backoffice) | `apps/management` | `http://localhost:5173` | [management/index.md](management/index.md) |
| **Customer** (müşteri portalı) | `apps/customer` | `http://localhost:5174` | [customer/index.md](customer/index.md) |

## Klasör yapısı

```text
user_test/
├── agent/          # Temsilci uygulaması testleri
├── management/     # Backoffice testleri
├── customer/       # Müşteri portalı
└── _templates/     # Uygulama bazlı şablonlar
```

## Hızlı erişim (Management)

| Modül | Süreç |
|-------|--------|
| Müşteriler indeks | [management/processes/dashboard-ve-musteriler-modulu.md](management/processes/dashboard-ve-musteriler-modulu.md) |
| Dashboard (1) | [management/processes/01-dashboard.md](management/processes/01-dashboard.md) |
| Müşteri listesi (2) | [management/processes/02-musteriler-liste.md](management/processes/02-musteriler-liste.md) |
| Fixture (müşteri) | [management/fixtures/dashboard-ve-musteriler.md](management/fixtures/dashboard-ve-musteriler.md) |
| Temsilciler indeks | [management/processes/temsilciler-modulu.md](management/processes/temsilciler-modulu.md) |
| Temsilci listesi (3.0) | [management/processes/03-temsilciler-liste.md](management/processes/03-temsilciler-liste.md) |
| Fixture (temsilci) | [management/fixtures/temsilciler.md](management/fixtures/temsilciler.md) |
| Cüzdanlar indeks | [management/processes/cuzdanlar-modulu.md](management/processes/cuzdanlar-modulu.md) |
| Fixture (cüzdan) | [management/fixtures/cuzdanlar.md](management/fixtures/cuzdanlar.md) |
| Transferler indeks | [management/processes/para-transferleri-modulu.md](management/processes/para-transferleri-modulu.md) |
| Fixture (transfer) | [management/fixtures/para-transferleri.md](management/fixtures/para-transferleri.md) |

## Hızlı erişim (Agent — mevcut)

| Ekran | Süreç |
|-------|-------|
| Ana sayfa | [agent/processes/dashboard.md](agent/processes/dashboard.md) |
| Hesaplarım | [agent/processes/accounts.md](agent/processes/accounts.md) |
| Müşteri kaydı | [agent/processes/customer-registration.md](agent/processes/customer-registration.md) |
| Müşteri arama | [agent/processes/customer-search.md](agent/processes/customer-search.md) |
| Para çekme | [agent/processes/withdrawal.md](agent/processes/withdrawal.md) |
| İşlem onay | [agent/processes/transaction-confirmation.md](agent/processes/transaction-confirmation.md) |

## Son test koşuları

Her uygulama altında `runs/YYYY-MM-DD-{screen-slug}.md` formatında tutulur.

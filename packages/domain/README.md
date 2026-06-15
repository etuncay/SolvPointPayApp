# @epay/domain — Ortak domain sözlüğü

Platform genelinde **paylaşılan** TypeScript tipleri, enum union'ları ve referans sabitleri. React, Dexie veya HTTP içermez.

## Kullanım

```ts
import type { TransactionStatus, LedgerDirection } from '@epay/domain';
import { TRANSACTION_STATUSES, portalToLedger } from '@epay/domain/transaction';
import { CURRENCY_CODES } from '@epay/domain/wallet';
```

## Sınırlar

| Bu pakette | Feature / `@epay/data` |
|------------|-------------------------|
| `TransactionStatus`, `CurrencyCode` | Tablo satırı, form state, adapter mapping |
| Referans listeleri (ödeme amacı, ülke) | i18n etiketleri UI'da |
| Yön / durum mapper'ları | Dexie seed, HTTP DTO |

Veri erişimi ve mock/backend: `@epay/data` (`contracts` + `adapters`).

## Backend geçişi

.NET API ile aynı string kodlar burada tanımlanır. HTTP adapter yalnızca alan adı farkını map eder; UI `@epay/data` facade kullanmaya devam eder.

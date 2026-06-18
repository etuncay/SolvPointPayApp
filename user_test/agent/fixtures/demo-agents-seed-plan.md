---
app: agent
topic: demo-agents
updated: 2026-06-18
status: plan
---

# DEMO_AGENT_ID — Çoklu temsilci seed planı

Agent portalında oturum açan kullanıcı ile `AGENTS` seed'i arasındaki bağın tek sabit (`DEMO_AGENT_ID = AGENTS[0].id`) olması, çoklu temsilci demo'sunu engelliyor. Bu belge **hedef mimari**, **önerilen persona'lar**, **seed bölümleme** ve **uygulama fazlarını** tanımlar.

**Durum:** Plan (kod değişikliği henüz yapılmadı).  
**İlgili todo:** `docs/Other/apps-demo-todo.md` — P1 `DEMO_AGENT_ID`

---

## Mevcut durum

### Sabit temsilci kimliği

```12:12:apps/agent/src/features/transaction-confirmation/api/agent-transactions-store.ts
export const DEMO_AGENT_ID = AGENTS[0]?.id ?? 99901;
```

`AGENTS[0].id` deterministik olarak **`99901`** (`apps/agent/src/mocks/agents.ts` — `99901 + i`).

### Oturum → temsilci eşlemesi yok

```27:34:apps/agent/src/domain/agent-session.ts
  return {
    userId: user.id,
    agentId: DEMO_AGENT_ID,
    displayName: user.fullName,
    isAdmin: IS_AGENT_ADMIN && canTransact,
    canTransact,
    canRegisterCustomers: canTransact,
  };
```

Giriş yapan kullanıcı kim olursa olsun `agentId` her zaman `99901`.

### Tek demo hesap

| Kaynak | Değer |
|--------|-------|
| `apps/data/src/db/seed-auth.ts` | `usr-agent` → `agent@epay.demo` |
| `apps/agent/src/config/app.ts` | `AGENT_DEMO_ACCOUNTS` — yalnızca bu e-posta |

Management'ta dört rol hesabı varken agent portalında tek hesap gösteriliyor.

### `DEMO_AGENT_ID` kullanan modüller (refactor kapsamı)

| Modül | Kullanım |
|-------|----------|
| `agent-session.ts` | Oturum `agentId` |
| `agent-transactions-store.ts` | Seed işlemler `90001–90010`, `forCurrentAgent()` filtresi |
| `mock-withdrawal-adapter.ts` | `receiverAgentId` |
| `mock-transfer-adapter.ts` | `senderAgentId` |
| `check-transaction-limit.ts` | Varsayılan `agentId` |
| `mock-agent-transactions-adapter.ts` | Gönderen/alıcı rolü |
| `build-agent-transaction-row.ts` | İşlem hareketleri rolü |
| `build-transaction-detail-from-activity.ts` | Detay paneli temsilci adı |
| `mock-agent-feedback-adapter.ts` | Talep sahibi / performedBy |
| `resolve-notify-target.ts` | Bildirim hedefi |

### Seed işlemler (99901'e bağlı)

`agent-transactions-store.ts` içindeki `90001–90010` kayıtlarının tamamı `senderAgentId` veya `receiverAgentId` olarak **`DEMO_AGENT_ID`** kullanır. Başka temsilciye ait bekleyen işlem yok.

### Management ile hizalama

| Sistem | Temsilci `99901` |
|--------|------------------|
| Management `SAMPLE_AGENT` | Anadolu Gıda Üretim A.Ş., VKN `1792956117`, `AGT-099901` |
| Agent `AGENTS[0]` | Procedural isim (ör. Acme Döviz…), aynı sayısal `id` |

Sayısal ID ortak; unvan/VKN detayları management fixture ile tam örtüşmüyor. Çoklu agent planında **3–4 sabit “showcase” temsilci** management `sample-agent` / `temsilciler.md` ile hizalanmalı.

---

## Hedef

1. **Birden fazla demo giriş hesabı** → farklı `agentId` ve farklı işlem kuyruğu.
2. **`DEMO_AGENT_ID` sabiti kaldırılır** (veya yalnızca test fallback); runtime'da `resolveAgentSession().agentId` tek kaynak.
3. **Çapraz temsilci senaryoları:** A'nın gönderdiği / B'nin aldığı işlem; boş kuyruk; limiti dolu temsilci.
4. Management backoffice ile **aynı sayısal agent ID** (`99901`, `99902`, …) — iki uygulama yan yana demo.

---

## Önerilen demo persona'lar (4 + 1 salt okunur)

Sabit overlay: `apps/data/src/db/seed-demo-agents.ts` (yeni) — procedural `AGENTS` dizisini **üzerine yazmadan** showcase meta verisi tutar.

| # | Giriş e-postası | Auth `id` | `agentId` | Temsilci (showcase adı) | Grup | Amaç |
|---|-----------------|-----------|-----------|-------------------------|------|------|
| **A** | `agent@epay.demo` | `usr-agent` | **99901** | Acme Döviz — Kadıköy (mevcut birincil) | `gold` | Varsayılan; tam pending kuyruk `90001–90010` |
| **B** | `agent-b@epay.demo` | `usr-agent-b` | **99902** | Yıldız Para Transfer — Üsküdar | `standard` | İkinci şube; **kısmi** pending (`90101–90103`); dashboard farklı |
| **C** | `agent-c@epay.demo` | `usr-agent-c` | **99904** | (seed'den — aktif, düşük hacim) | `silver` | **Boş / minimal** kuyruk; yeni işlem uçtan uca (Senaryo G) |
| **D** | `agent-admin@epay.demo` | `usr-agent-admin` | **99901** | A ile aynı temsilci, farklı yetkili | — | `IS_AGENT_ADMIN=true`, Ayarlar → Kullanıcı Yönetimi |
| **E** | `agent-readonly@epay.demo` | `usr-agent-ro` | **99901** | Salt okunur (mevcut `?agentDemo=readonly` alternatifi) | — | `canTransact=false`; onay butonları gizli |

**Notlar**

- **B** ile **A** aynı anda açıldığında pending listeleri **ayrı** olmalı (filtre `session.agentId`).
- **D** ve **A** aynı `agentId`, farklı `userId` — ileride yetkili kişi limitleri (`agent-settings-store`) kullanıcıya göre ayrılabilir (Phase 4).
- `finance@epay.demo` management içindir; agent portalına eklenmez. Salt okunur için **E** yeterli.

### Çapraz işlem seed'i (Phase 3)

| Tx ID | Gönderen agent | Alıcı agent | Tip | Durum | Demo amacı |
|-------|----------------|-------------|-----|-------|------------|
| `90201` | `99902` | `99901` | `WalletWithdrawal` | Pending | B müşterisi çekim → A şubesinde onay |
| `90202` | `99901` | `99902` | `WalletToPerson` | OnHold | A gönderir; B listesinde görünmez (gönderen rolü) |

---

## Veri modeli önerisi

### 1. Portal kullanıcı → temsilci bağlantısı

`apps/data/src/db/seed-agent-portal-bindings.ts` (yeni):

```ts
export type AgentPortalBinding = {
  userId: string;
  agentId: number;
  authorizedPersonId?: number; // agent-settings-store kullanıcı satırı
  isAdmin?: boolean;
};

export const AGENT_PORTAL_BINDINGS: AgentPortalBinding[] = [ /* persona tablosu */ ];
```

`resolveAgentSession(user)` → `AGENT_PORTAL_BINDINGS.find(b => b.userId === user.id)`.

`?agentDemo=readonly` ve `user.role === 'finance'` davranışı **korunur** (binding üzerine override).

### 2. Auth seed genişletmesi

`seed-auth.ts` içine **B, C, D, E** hesapları (`role: 'ops'`, parola `DEMO_PASSWORD`).

`AGENT_DEMO_ACCOUNTS` (`app.ts`) aynı satırları gösterir — management `DEMO_ACCOUNTS` deseni.

### 3. İşlem store bölümleme

`agent-transactions-store.ts`:

- `seedRecordsForAgent(agentId: number): Transaction[]` veya tek `seedRecords()` içinde agent etiketli bloklar.
- `forCurrentAgent(agentId)` parametre alır; store oluşturulurken session'dan beslenir **veya** filtre her sorguda `currentAgentId` kullanır.

**Persist (P0):** IndexedDB/sessionStorage anahtarına `agentId` ekle → `epay-agent-tx-store:{agentId}`.

### 4. Yeni işlem oluşturma

`mock-withdrawal-adapter` / `mock-transfer-adapter`:

```ts
// Önce
receiverAgentId: DEMO_AGENT_ID,
// Sonra
receiverAgentId: getCurrentAgentId(),
```

`getCurrentAgentId()` — `agent-session` modülünden; testlerde inject edilebilir.

### 5. Temsilci cüzdanları / Hesaplarım

`seed-wallets.ts` veya agent-specific wallet overlay: her showcase `agentId` için en az bir `agent_advance` + `agent_commission` cüzdanı (management `SAMPLE_AGENT.financialWallets` ile uyumlu ID kalıbı `BY-{agentId}-01`).

### 6. Kullanıcı tercihleri

`USER_PREFERENCES_SEED` — persona başına `user_id` satırı (`usr-agent-b`, …).

---

## Uygulama fazları

| Faz | Kapsam | Çıktı | Öncelik |
|-----|--------|-------|---------|
| **0** | Bu plan + persona tablosu | Dokümantasyon | ✅ |
| **1** | `AGENT_PORTAL_BINDINGS` + `resolveAgentSession` | Oturumda doğru `agentId` | P1 |
| **2** | `getCurrentAgentId()`; adapter/store refactor | `DEMO_AGENT_ID` import'ları kalkar | P1 |
| **3** | Auth + login demo listesi (B, C, D, E) | `AGENT_DEMO_ACCOUNTS` | P1 (login todo ile birlikte) |
| **4** | Partition seed `900xx` / `901xx` / `902xx` | Çoklu dashboard | P1 |
| **5** | Agent cüzdan overlay + settings per agent | Hesaplarım / limit demo | P2 |
| **6** | Management `SAMPLE_AGENT` ↔ `AGENTS[0]` isim/VKN hizası | Tek gerçeklik kaynağı | P2 |

**Bağımlılıklar**

- P0 `agentTransactionsStore` persist → Phase 4 ile birlikte `agentId` scoped key şart.
- P1 login demo ipucu → Phase 3 ile aynı PR'da yapılabilir.

---

## Test senaryoları (uygulama sonrası)

| ID | Adımlar | Beklenen |
|----|---------|----------|
| **MA-1** | `agent@epay.demo` giriş | Pending: `90001+`; onay çalışır |
| **MA-2** | `agent-b@epay.demo` giriş | Pending: `90101–90103`; `90001` **görünmez** |
| **MA-3** | `agent-c@epay.demo` giriş | Dashboard pending boş veya 0–1 kayıt |
| **MA-4** | A ile çekim oluştur → B ile giriş | B kuyruğunda yok; A'da görünür |
| **MA-5** | `90201` seed — A giriş | Alıcı rolü; onay ekranı açılır |
| **MA-6** | `agent-readonly@epay.demo` | `canTransact=false`; [transaction-confirmation F](../processes/transaction-confirmation.md) |
| **MA-7** | Limit: A'da günlük kullanım dolu → B'de aynı gün işlem | Agent-scoped usage ayrı (`mock-agent-usage.ts`) |

---

## Dosya checklist (uygulama)

| Dosya | Değişiklik |
|-------|------------|
| `apps/data/src/db/seed-agent-portal-bindings.ts` | **Yeni** — persona tablosu |
| `apps/data/src/db/seed-auth.ts` | Ek demo hesaplar |
| `apps/data/src/index.ts` | Export bindings |
| `apps/agent/src/domain/agent-session.ts` | Binding lookup |
| `apps/agent/src/domain/current-agent.ts` | **Yeni** — `getCurrentAgentId()` |
| `apps/agent/src/config/app.ts` | `AGENT_DEMO_ACCOUNTS` genişlet |
| `apps/agent/src/features/transaction-confirmation/api/agent-transactions-store.ts` | Partition seed, parametrik filtre |
| `apps/agent/src/features/withdrawal/api/mock-withdrawal-adapter.ts` | Session agentId |
| `apps/agent/src/features/agent-transfers/api/mock-transfer-adapter.ts` | Session agentId |
| `apps/agent/src/features/limits/api/check-transaction-limit.ts` | Session agentId |
| `apps/agent/src/features/transaction-confirmation/api/mock-agent-transactions-adapter.ts` | Parametrik rol |
| `apps/agent/src/features/transaction-history/domain/build-agent-transaction-row.ts` | Parametrik rol |
| `apps/agent/src/features/agent-feedback/**` | `requesterId` / notify → session |
| `apps/agent/src/mocks/user-preferences.ts` | Çoklu user seed |
| `user_test/agent/processes/transaction-confirmation.md` | MA-* senaryoları |
| `user_test/agent/index.md` | Demo hesaplar tablosu |

---

## Bilinçli ertelemeler

- **HTTP driver:** Production `POST /agent/session` zaten `agentId` dönecek; binding yalnızca mock.
- **`alltest@epay.demo`:** Agent portalına eklenmeyecek; gerekirse ayrı karar (güvenlik incelemesi P1).
- **Procedural 42 agent:** Tamamı showcase yapılmaz; yalnızca 3–4 ID sabitlenir, diğerleri liste/arama dolgu olarak kalır.

---

## İlgili belgeler

| Belge | Konu |
|-------|------|
| [transaction-confirmation.md](../processes/transaction-confirmation.md) | Onay seed `90001–90006` |
| [compliance-scenarios.md](compliance-scenarios.md) | Müşteri uyumluluk (temsilci bağımsız) |
| [temsilciler.md](../../management/fixtures/temsilciler.md) | Management agent `99901` |
| `apps/agent/README.md` | Tek demo hesap (güncellenecek) |

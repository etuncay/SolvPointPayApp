# Apps Demo Todo Listeleri

**Kapsam:** `apps/management`, `apps/agent`, `apps/customer`, `apps/data`  
**Tarih:** 18 Haziran 2026  
**Bağlam:** Mock/Dexie tabanlı demo geliştirme — frontend verisi mock; gerçek API yok  
**İlgili inceleme:** [apps-guvenlik-incelemesi.md](./apps-guvenlik-incelemesi.md)

---

## Öncelik etiketleri

| Etiket | Anlam |
|--------|--------|
| **P0** | Demo akışını kırar veya yanıltır — önce bunlar |
| **P1** | Tasarım borcu; kısa vadede düzeltilmeli |
| **P2** | API entegrasyonu öncesi |
| **P3** | Production öncesi |

---

## Demo bağlamında değerlendirme

### Bilinçli kabul (şimdilik dokunma)

| Bulgu | Not |
|-------|-----|
| `sessionStorage` oturum | Hızlı demo testi için uygun |
| Sabit OTP (`123456`), demo parolalar | Ekranda ipucu ile kullanılabilir |
| Dexie / IndexedDB mock veri | Beklenen mimari |
| `?role=`, `alltest`, playground | Rol testi için faydalı |
| Açık `/register` + rol seçimi | Demo'da kalabilir; "demo only" etiketi önerilir |
| Parola düz metin mock store | API gelene kadar OK |
| Entegrasyon drawer tam payload | Demo debug için OK |

### Şimdi düzeltilmeli

| Bulgu | Neden |
|-------|--------|
| Route guard tutarsızlığı | Rol demo'ları yanıltıcı |
| `getCurrentUser(role)` ≠ `useAuth().user` | Onay havuzu gerçekçi değil |
| `changePassword` / şifre sıfırlama sahte başarı | Kullanıcıyı yanıltır |
| `pendingTransfer` bellek state | Sekme yenilemede akış kırılır |
| Silent mock fallback | Geliştirici hatasını gizler |
| Agent store persist eksikliği | Yenilemede pending işlem kaybolur |

### Demo ortamı kuralları

- Uygulamalar yalnızca local / staging'de çalıştırılır; internete açık deploy edilmez.
- `VITE_DATA_DRIVER=dexie` explicit kullanılır.
- Demo kimlik bilgileri gerçek kullanıcı verisi içermez.
- Güvenlik bulguları "çalışmıyor" değil, **henüz implemente edilmedi** olarak yorumlanır.

---

## Önerilen sprint sırası

1. **customer** — `pendingTransfer` persist + sahte parola UX + `balanceAfter`
2. **management** — route guard + onay havuzu kullanıcı eşlemesi + mock banner
3. **agent** — store persist + permissions iskeleti
4. **ortak** — `isDemoMode()`, env dokümantasyonu

---

## `management` — BackOffice

### Güvenlik (demo bağlamı)

- [x] **P0** Route guard tutarlılığı: `wallets`, `transfers`, `approvals`, `customers`, `agents`, `banks/*` için `Navigate` guard veya merkezi `RequirePermission` wrapper
- [x] **P0** Rol tek kaynak: oturum açıkken `?role=` ve `epay-backoffice-role` devre dışı; test için header'da rol switcher veya `?demoRole=`
- [x] **P1** `RequireAuth` yalnızca login kontrolü — session `role` ile menü senkronu doğrula
- [x] **P2** `auth.service.ts` — API contract için `AuthPort` interface ayır (mock implementasyon kalsın)
- [x] **P3** Production: HttpOnly session / JWT (`createHttpAuthAdapter`), sunucu RBAC (API sözleşmesi), `/register` kapat (`RegisterGuard`, `isBackOfficeRegisterEnabled`)

### Tasarımsal / süreç eksiklikleri

- [x] **P0** Onay havuzu: `getCurrentUser(role)` yerine `useAuth().user.id` + role ile persona eşle
- [x] **P0** `approvals-page`, `manual-correction-page`: yetkisiz erişimde tutarlı `Navigate` veya `ForbiddenPage`
- [x] **P1** Merkezi `routePermissions.ts` haritası oluştur (`route-permissions-map.ts`)
- [x] **P1** Entegrasyon log drawer: tablo ile aynı maskeleme; tam payload için "geliştirici modu" toggle
- [x] **P1** `alltest` rolü: UI'da "süper test rolü" badge'i
- [x] **P2** Playground route'ları: `import.meta.env.DEV` ile sınırla

### Mock veri / stabilite

- [x] **P0** `data-layer.ts`: mock modda ekranda `DemoModeBanner` göster
- [x] **P1** Onay approve/reject sonrası store + UI regression checklist
- [x] **P2** Seed veri ile `mocks/*` senkron — tek kaynak `@epay/data`

### UX / demo sunumu

- [x] **P1** Login: "Demo ortamı — gerçek kimlik bilgisi kullanmayın" banner
- [x] **P1** OTP adımı: demo OTP'yi ekranda göster ve kopyalanabilir yap
- [x] **P2** Register: "Demo: hesabınız yalnızca bu tarayıcıda" uyarısı

### İlgili dosyalar

| Konu | Dosya |
|------|-------|
| Auth | `apps/management/src/domain/auth-context.tsx` |
| Rol | `apps/management/src/domain/role-context.tsx` |
| Routes | `apps/management/src/routes.tsx` |
| Onay havuzu | `apps/management/src/features/approval-pool/domain/current-user.ts` |
| Data layer | `apps/management/src/lib/data-layer.ts` |

---

## `agent` — Temsilci portalı

### Güvenlik (demo bağlamı)

- [x] **P1** İşlem onayı OTP: sabit `123456` veya ekranda "herhangi 6 hane" ipucu
- [x] **P1** `mock-agent-transactions-adapter`: production contract'ta `verifyOtp` ayrı port
- [x] **P2** Temsilci bazlı `permissions.ts` + route guard taslağı
- [x] **P3** Production: temsilci limitleri sunucuda

### Tasarımsal / süreç eksiklikleri

- [x] **P0** `permissions={{}}` → sayfa bazlı `getAgentPermissions()` ile buton/route kısıtı
- [x] **P1** Onay akışı demo senaryosu dokümante (`confirmation-page`)
- [x] **P1** Sanction / blocked / KYC test senaryoları listesi (`Sanction Test Kişi` vb.)
- [x] **P1** `DEMO_AGENT_ID` — çoklu temsilci seed planı
- [x] **P2** Playground: DEV-only (management ile aynı politika)

### Mock veri / stabilite

- [x] **P0** `agentTransactionsStore`: pending işlemler persist (IndexedDB / sessionStorage)
- [x] **P1** Çekim duplicate reference — çift tıklama senaryosu test
- [x] **P1** `ACTIVITY_BY_TX_ID` fallback tutarlılığı
- [x] **P2** Mock mode banner (management ile ortak)

### UX / demo sunumu

- [x] **P1** Login: demo hesap + parola ipucu (management ile tutarlı)
- [x] **P1** Transfer / çekim: limit, blocked, düşük KYC uyarıları demo script
- [ ] **P2** Makbuz / imzalı dekont uçtan uca checklist

### İlgili dosyalar

| Konu | Dosya |
|------|-------|
| Auth | `apps/agent/src/domain/auth-context.tsx`, `apps/agent/src/features/auth/login-page.tsx`, `apps/agent/src/features/auth/auth-demo-env-banner.tsx` |
| İzinler | `apps/agent/src/domain/permissions.ts`, `apps/agent/src/domain/ui-permissions.ts` |
| Routes | `apps/agent/src/routes.tsx` |
| İşlem onayı | `apps/agent/src/features/transaction-confirmation/confirmation-page.tsx` |
| Onay demo script | `user_test/agent/processes/transaction-confirmation.md` |
| Uyumluluk senaryoları | `user_test/agent/fixtures/compliance-scenarios.md` |
| Transfer demo script | `user_test/agent/processes/agent-transfers.md` |
| Çekim demo script (limit/uyarı) | `user_test/agent/processes/withdrawal.md` § I–J |
| Limit demo test | `apps/agent/src/features/limits/api/mock-limit-demo-thresholds.test.ts` |
| Çoklu temsilci planı | `user_test/agent/fixtures/demo-agents-seed-plan.md` |
| Para çekme | `apps/agent/src/features/withdrawal/api/mock-withdrawal-adapter.ts` |
| Çekim idempotency test | `apps/agent/src/features/withdrawal/api/mock-withdrawal-adapter.test.ts` |
| Limitler | `apps/agent/src/features/limits/` |
| Store | `apps/agent/src/features/transaction-confirmation/api/agent-transactions-store.ts` |
| Store persist | `apps/agent/src/features/transaction-confirmation/api/agent-transactions-store-persist.ts` |
| Activity fallback | `apps/agent/src/features/transaction-confirmation/domain/resolve-agent-transaction.ts` |
| Playground (DEV) | `apps/agent/src/components/dev-only-route.tsx`, `apps/agent/src/routes.tsx` |
| Mock banner | `apps/agent/src/components/demo-mode-banner.tsx` |

---

## `customer` — Müşteri portalı

### Güvenlik (demo bağlamı)

- [x] **P1** `epay-customer-authed`: login sayfasında geliştirici/demo notu
- [x] **P1** Sabit OTP: login ve transfer'de tutarlı ipucu
- [x] **P2** `validators.ts` TCKN/kart yakalama — diğer serbest metin alanlarına genişlet
- [x] **P3** Production: OTP, session, parola hash sunucuda (`getSessionProfile`/`logout`, `AuthProvider` HTTP bootstrap, `docs/Customer/customer-portal-auth-api.md`)

### Tasarımsal / süreç eksiklikleri

- [x] **P0** `changePassword`: mock'ta gerçekten kaydet (`localStorage` + login doğrulama; demo ipucu güncel parola)
- [x] **P0** `ForgotPasswordPage`: "demo modunda e-posta gönderilmez" mesajı
- [x] **P0** `pendingTransfer`: Dexie veya `sessionStorage` ile persist (`pending-transfer-store`, `getPendingTransfer`, `TransferDraftContext` hydrate)
- [x] **P1** `getProfile`: `sessionProfile` yoksa `null` dön (Dexie + HTTP 401; `AuthProvider` null handling)
- [x] **P1** `ContactsSection`: iletişim doğrulama demo OTP ipucu (`DemoOtpHint` — telefon + e-posta demo)
- [x] **P1** Transfer limitleri: mock kontrol (`internetDailyLimit` + `TransferLimitDemoBanner`) ve demo ipucu
- [x] **P2** Çoklu sekme draft uyarısı veya kilitleme (`transfer-draft-tab-lock`, `TransferDraftTabBanner`, submit/onay kilidi)

### Mock veri / stabilite

- [x] **P0** `approveTransfer` sonrası `balanceAfter` hesapla (cüzdan bakiyesi − `draft.total`)
- [x] **P1** FX quote TTL (90 sn) — süre dolunca UI yenileme (`useFxQuote`, geri sayım, otomatik refresh)
- [x] **P1** Mock mode banner
- [x] **P2** Recipient CRUD + transfer "kaydet" seed senkronu

### UX / demo sunumu

- [x] **P1** Login: `PROD` build'de varsayılan parola boş
- [x] **P1** OTP: "Demo OTP: 123456" butonu netleştir
- [x] **P2** Ayarlar: demo/staging etiketi
- [x] **P2** Şikayet / destek case uçtan uca test

### İlgili dosyalar

| Konu | Dosya |
|------|-------|
| Auth | `apps/customer/src/app/AuthProvider.tsx`, `apps/customer/src/config/auth-keys.ts` |
| Login | `apps/customer/src/features/auth/LoginPage.tsx`, `apps/customer/src/features/auth/LoginDevDemoNote.tsx` |
| Demo OTP | `apps/customer/src/components/DemoOtpHint.tsx`, `apps/customer/src/config/demo-otp.ts` |
| Parolamı unuttum | `apps/customer/src/features/auth/ForgotPasswordPage.tsx` |
| Portal adapter | `apps/data/src/adapters/dexie/customer-portal-dexie.adapter.ts` |
| Data layer | `apps/customer/src/lib/data-layer.ts` |
| Validators | `apps/customer/src/lib/validators.ts` |

---

## Ortak (`apps/data` + üç uygulama)

- [ ] **P0** `VITE_DATA_DRIVER` env dokümantasyonu (README: `dexie` vs `http`)
- [ ] **P1** Mock / HTTP adapter aynı `*Api` contract
- [ ] **P1** `isDemoMode()` ile sahte başarı davranışlarını merkezileştir
- [ ] **P2** Seed: fake TCKN/IBAN prefix (`999…`)
- [ ] **P3** HTTP adapter: CSRF, retry, idempotency

---

## P0 özet (tek bakış)

| Proje | Madde |
|-------|--------|
| management | ~~Route guard tutarlılığı~~ |
| management | Rol tek kaynak |
| management | Onay havuzu ↔ oturum kullanıcısı |
| management | ForbiddenPage / Navigate tutarlılığı |
| management | DemoModeBanner |
| agent | `agentTransactionsStore` persist |
| agent | `getAgentPermissions()` iskeleti |
| customer | ~~`changePassword` sahte başarı kaldır~~ (mock'ta `localStorage` ile kayıt) |
| customer | ~~`ForgotPasswordPage` demo mesajı~~ |
| customer | ~~`pendingTransfer` persist~~ (`sessionStorage` + onay sayfası hydrate) |
| customer | ~~`balanceAfter` hesaplama~~ (`approveTransfer` → cüzdan − total) |
| ortak | `VITE_DATA_DRIVER` dokümantasyonu |

---

## Production (ertelenen)

API entegrasyonu başlamadan önce [apps-guvenlik-incelemesi.md](./apps-guvenlik-incelemesi.md) içindeki **§ Öncelikli aksiyon planı (production)** bölümüne dönün.

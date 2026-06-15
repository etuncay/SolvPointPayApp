# EpayCustomer — ReactJS Dönüşüm Rehberi (AI Handoff Guide)

> Bu doküman, mevcut **tek-sayfa HTML + Babel prototipini** üretime hazır bir **ReactJS** projesine çeviren AI/geliştirici için referanstır. Amaç: prototipin tasarımını ve davranışını birebir korurken, gerçek bir build aracı, routing, state yönetimi, i18n ve API katmanı ile yeniden kurmak.
>
> Prototip yalnızca **görsel/etkileşim referansıdır** — iş kuralları ve veri sözleşmeleri için `uploads/` altındaki dökümanlar (`0.genel-standartlar.md`, `1.ana-sayfa.md` … `6.dilek-sikayet-oneriler.md`) tek doğruluk kaynağıdır.

---

## 0. Hızlı Özet

| Konu | Mevcut Prototip | Hedef React Projesi |
|---|---|---|
| Build | Tarayıcıda Babel `text/babel` | **Vite + React 18** (öneri: TypeScript) |
| Stil | Tek `styles.css` (CSS değişkenleri) | Aynı token seti → CSS Modules **veya** Tailwind (token map aşağıda) |
| Routing | Manuel `route` state + `switch` | **React Router v6** (`createBrowserRouter`) |
| State | `App` içinde prop-drilling | Router loader/action + **Context** (auth, tema, i18n) + sunucu state için **TanStack Query** |
| Bileşen paylaşımı | `Object.assign(window, …)` | Gerçek ESM `import/export` |
| İkonlar | Inline `<Icon>` switch | Aynı set ayrı bileşen/SVG dosyaları **veya** `lucide-react` |
| Veri | `data.jsx` (mock) | Tipli modeller + API servis katmanı (mock'lar MSW ile) |
| Dil | TR sabit + TR/EN/AR seçici stub | **react-i18next** (TR/EN/AR + RTL) |

---

## 1. Mevcut Prototip Dosya Envanteri

Her dosya bir veya birkaç bileşeni `window`'a export ediyor (Babel scope paylaşımı için). React'e geçerken bunları ESM modüllerine bölün.

| Dosya | İçerik | Export'lar |
|---|---|---|
| `index.html` | Script yükleme sırası, font/CSS link, `#root` | — |
| `styles.css` | Tüm tasarım token'ları + bileşen sınıfları (light/dark) | — |
| `tweaks-panel.jsx` | Tasarım "Tweaks" paneli (sadece prototip aracı) | `useTweaks`, `TweaksPanel`, `Tweak*` |
| `icons.jsx` | Stroke ikon seti (24px viewBox) | `Icon({name})` |
| `data.jsx` | Mock veri (müşteri, cüzdanlar, IBAN, işlemler, kişiler, kur, ücret) + `fmt()` | `DATA` |
| `ui.jsx` | Paylaşılan UI: `Logo`, `StatusPill`, `DirBadge`, `Field`, `Modal`, `OtpInput`, `AlertBanner`, `Header`, `NAV` | window |
| `screens-home.jsx` | `WalletCard`, `HomeScreen` (dashboard), `ActivityScreen` (hesap hareketleri) | window |
| `screens-send.jsx` | `FeeTable`, `SourceWalletPicker`, `SendHub`, `RecipientsScreen` | window |
| `screens-transfer.jsx` | `MoneyInput`, `DomesticForm` (yurt içi), `IntlForm` (yurt dışı/FX), `ReceiveScreen` (para al) | window |
| `screens-confirm.jsx` | `ConfirmScreen` (İşlem Onay/OTP + İşlem Beyanı modalı), `SuccessScreen`, `TxDetailModal` (Detay Modu) | window |
| `screens-misc.jsx` | `LoadMoneyScreen` (para yükle bilgi), `ComplaintScreen` (dilek/şikâyet) | window |
| `screens-settings.jsx` | `SettingsScreen` (çok bölümlü), `Toggle`, `SettingsCard`, `PrefRow` | window |
| `screens-login.jsx` | `LoginScreen` (2FA: parola → OTP, parola sıfırlama) | window |
| `app.jsx` | `App` (routing + tema/dil/metin boyutu state), tweak uygulaması | — |

> **`tweaks-panel.jsx` üretime TAŞINMAZ.** Sadece tasarım keşfi içindir. İçindeki tweak'lerin (marka rengi, vurgu, köşe yarıçapı, font, koyu tema) üretimdeki karşılığı: **Ayarlar → Uygulama Ayarları** (tema, dil, metin boyutu) + sabitlenmiş marka token'ları.

---

## 2. Önerilen Hedef Proje Yapısı (Vite + React + TS)

```
src/
  main.tsx                      # ReactDOM root + RouterProvider
  router.tsx                    # createBrowserRouter, korumalı rotalar
  app/
    AppLayout.tsx               # <Header/> + <Outlet/> (giriş yapılmış kabuk)
    AuthProvider.tsx            # oturum/token, 2FA durumu
    ThemeProvider.tsx           # light/dark + metin boyutu, prefs persist
    i18n.ts                     # react-i18next kurulumu (tr/en/ar)
  styles/
    tokens.css                  # :root ve [data-theme=dark] değişkenleri (styles.css'ten)
    base.css                    # global, tipografi
  components/
    icons/Icon.tsx              # icons.jsx'ten
    ui/Button.tsx Card.tsx Field.tsx Input.tsx Select.tsx Textarea.tsx
    ui/Modal.tsx OtpInput.tsx StatusPill.tsx DirBadge.tsx AlertBanner.tsx
    ui/Toggle.tsx Pill.tsx Tag.tsx
    layout/Header.tsx           # üst menü (ui.jsx Header)
    money/WalletCard.tsx MoneyInput.tsx FeeTable.tsx SourceWalletPicker.tsx
  features/
    auth/LoginPage.tsx ForgotPasswordPage.tsx
    home/HomePage.tsx
    activity/ActivityPage.tsx TxDetailModal.tsx
    topup/TopupPage.tsx
    transfer/
      SendHubPage.tsx RecipientsPage.tsx
      DomesticTransferPage.tsx IntlTransferPage.tsx
      ReceivePage.tsx
      ConfirmPage.tsx           # İşlem Onay (Onay Modu)
      SuccessPage.tsx
    complaints/ComplaintPage.tsx
    settings/SettingsPage.tsx (+ alt bölüm bileşenleri)
  api/
    client.ts                   # fetch wrapper (TLS, Idempotency-Key, correlation_id)
    auth.ts wallets.ts transactions.ts transfers.ts
    recipients.ts settings.ts complaints.ts fx.ts
  models/                       # TypeScript tipleri (bkz. §8)
  lib/
    format.ts                   # fmt() — tr-TR para/sayı biçimi
    validators.ts               # regex (TCKN/kart no engeli), limit kontrolleri
    enums.ts                    # transaction_status vb. (bkz. §11)
  mocks/                        # MSW handlers (data.jsx → mock API)
```

---

## 3. Tasarım Sistemi → Token Aktarımı

`styles.css` içindeki tüm değişkenleri **olduğu gibi** `tokens.css`'e taşıyın. Token isimlerini değiştirmeyin; bileşenler bunlara bağlı.

**Renkler (light):** `--brand #0C5C4E`, `--brand-700`, `--brand-500`, `--brand-soft`, `--accent #E8853B`, `--bg #F6F3EC` (krem), `--surface #FFFFFF`, `--ink #16221E`, `--muted`, durum renkleri `--pos / --neg / --warn / --info` (+ `*-soft` tintleri). Koyu tema `[data-theme="dark"]` altında.

**Tipografi:** Başlık `--font-display: 'Bricolage Grotesque'`, gövde `--font-body: 'Hanken Grotesk'`. Google Fonts'tan yükleyin.

**Yarıçap/gölge:** `--r-sm/md/lg/xl`, `--shadow-sm/md/lg`.

**Tema değiştirme:** `document.documentElement.setAttribute('data-theme', 'light'|'dark')`. **Metin boyutu** (erişilebilirlik, doküman §0.4): `document.documentElement.style.fontSize` → `{s:15, m:16, l:17.5, xl:19}px`.

### Tailwind kullanılacaksa
`tailwind.config` içine token'ları köprüleyin:
```js
theme: { extend: { colors: {
  brand: 'var(--brand)', 'brand-700': 'var(--brand-700)', accent: 'var(--accent)',
  surface: 'var(--surface)', ink: 'var(--ink)', muted: 'var(--muted)', /* … */
},
  fontFamily: { display: ['Bricolage Grotesque','sans-serif'], body: ['Hanken Grotesk','sans-serif'] },
  borderRadius: { lg: 'var(--r-lg)', xl: 'var(--r-xl)' } }}
```
Böylece `bg-brand text-surface` gibi sınıflar token'lara bağlanır ve koyu tema otomatik çalışır.

---

## 4. Bileşen Sözleşmeleri (Props)

Prototipteki bileşenleri tipli React bileşenlerine çevirin. Önemli imzalar:

```ts
// Header (üst menü)
Header({ route, go(key), theme, toggleTheme(), lang, setLang(l) })
// → React Router'da: route = useLocation, go = useNavigate, NavLink active state.

Icon({ name: IconName, style? })            // name union tip yapın
StatusPill({ status: TransactionStatus })   // Completed|Pending|Sent|ErrorSend|ErrorReceive
DirBadge({ dir: 'in' | 'out' })
Field({ label, required?, hint?, full?, children })
Modal({ onClose, max?, children })           // Esc ile kapanır, backdrop click
OtpInput({ value: string, onChange(v) })      // 6 haneli, auto-advance/backspace
AlertBanner({ tone: 'warn'|'info'|'error', icon, children, onClose? })
WalletCard({ w: Wallet, featured?, onClick? }) // featured = gradient kart
MoneyInput({ value, onChange, sym })
SourceWalletPicker({ value: walletId, onChange })  // yalnızca CustomerPersistent
FeeTable()                                    // ücret/komisyon tablosu (API'den)
```

**Navigasyon menüsü (`NAV`):** `home, activity, topup, send(▾ recipients/domestic/intl), receive, complaint`. Sağ üst aksiyonlar: dil, tema, bildirim, **Ayarlar** (menüde değil, ikon), avatar. Dökümana göre Ayarlar menüde **yer almaz** (`1.2`).

---

## 5. Ekran → Route Haritası

| Route (önerilen) | Bileşen | Doküman | Notlar |
|---|---|---|---|
| `/login` | `LoginPage` | `0.3` | 2FA: (Müşteri/Kimlik No + Parola) → OTP. Tüzel'de ek VKN. Parola sıfırlama aynı yanıt + 2 saatlik tek kullanımlık link. |
| `/` | `HomePage` | `1` | Bakiye panelleri + son **7** hareket + başarısız erişim uyarısı + karşılama mesajı. |
| `/activity` | `ActivityPage` | `2` | Filtre (yön/tür/tarih/tutar/karşı taraf), pagination, kolon sıralama, satır→Detay. |
| `/topup` | `TopupPage` | `3` | Salt bilgilendirme; uygulamadan yükleme YOK. Firma IBAN + müşteriye özel referans. |
| `/send` | `SendHubPage` | `4` | 3 alt akışa giriş. |
| `/send/recipients` | `RecipientsPage` | `4.1` | Liste + ekle/değiştir/sil (soft-delete). **Gönder** → ülkeye göre `/domestic` veya `/intl`, alıcı alanları dolu. |
| `/send/domestic` | `DomesticTransferPage` | `4.2` | Statü: `Pending → Completed`. |
| `/send/intl` | `IntlTransferPage` | `4.3` | FX kuru (süreli quote), net tutar; statü `Pending → Sent → Completed`. |
| `/receive` | `ReceivePage` | `5` | Yalnızca **kendi IBAN'ı** ↔ kendi cüzdanı. Cüzdan/Bakiye/Para birimi IBAN seçince otomatik & salt-okunur. ⚠️ Yön belirsizliği için bkz. §10. |
| `/confirm` | `ConfirmPage` | `1.1` | **Onay Modu**: özet panelleri + OTP. Risk=Kritik → İşlem Beyanı modalı. Onayla/Düzenle/İptal. |
| `/success` | `SuccessPage` | `1.1` | "İşlem başarıyla tamamlandı" + dekont indir. |
| `/complaints` | `ComplaintPage` | `6` | Konu/Sebep/Mesaj + aydınlatma onayı (onaysız Gönder pasif) + dosya ekle. |
| `/settings` | `SettingsPage` | `1.2` | Çok bölümlü (aşağıda). |

**İşlem Detayı (Detay Modu):** Ayrı route yerine `TxDetailModal` (mevcut prototipteki gibi) — Hesap Hareketleri / Ana Sayfa satırından açılır; "Geri Dön" filtreleri korur, "Dekont İndir" (üretilmişse aktif).

**Ayarlar alt bölümleri** (`SettingsPage` içinde sekme/iç-nav): Kişisel Bilgiler, Güvenlik & Parola (+ Karşılama Mesajı, Hatalı Girişler), İletişim & Adres, Transfer Limitleri, Bildirim Tercihleri, Uygulama Ayarları (dil/tema/metin boyutu), Dekontlarım.

---

## 6. State & Akış Yönetimi

Prototipte `App` tüm state'i tutuyordu. React'te ayırın:

- **AuthContext** — `authed`, `customer`, token'lar (access+refresh, rotasyonlu), `login()/logout()`. Korumalı rotalar `authed` değilse `/login`'e yönlendirir. Parola değişince oturum revoke (`1.2 §8`).
- **ThemeContext** — `theme`, `textSize`; `localStorage`/`user_preference`'a persist (doküman §0.4 erişilebilirlik).
- **i18n** — `lang` (tr/en/ar) + `dir` (ar → `rtl`).
- **Transfer akışı state'i** — `DomesticForm/IntlForm/ReceiveScreen` bir **draft** üretir → `/confirm`'e taşınır → onay → `/success`.

**Draft nesnesi (transfer akışının özeti, ConfirmPage girdi sözleşmesi):**
```ts
type TransferDraft = {
  kind: 'domestic' | 'intl' | 'receive';
  title: string;                 // "Yurt İçi Transfer" vb.
  src: WalletId;                 // kaynak CustomerPersistent cüzdan
  recipientName: string; phone?: string; email?: string; country: string;
  iban?: string; bank?: string;  // receive/intl
  currency: CurrencyCode; sym: string;
  amount: number; fee: number; total: number;
  purpose: PaymentPurpose; desc?: string; save?: boolean;
  // intl'e özel:
  srcCur?: CurrencyCode; dstCur?: CurrencyCode; fxRate?: number; net?: number; dstSym?: string;
};
```
Bu draft'ı router state ile taşıyın (`navigate('/confirm', { state: draft })`) veya kısa ömürlü bir `TransferContext`/store ile. **Tek `transaction` kaydı** prensibi: UI'da 3 form ayrı ama backend tek `POST /customer/transfers` (tip alanı ile) — bkz. `4 §8`.

**Draft → Confirm → Approve akışı:**
1. Form `review(draft)` → `/confirm`.
2. `ConfirmPage`: `GET /customer/transactions/{id}/confirmation` (gerçek backend'de önce taslak işlem oluşturulur) veya draft'tan özet. OTP girilir.
3. **Risk = Kritik** ise (örn. yüksek tutar / riskli ülke) **İşlem Beyanı modalı**; değerler immutable yazılır (`transaction_declaration`).
4. `POST /customer/transactions/{id}/approve` (OTP, **idempotent**) → başarı → `/success`, dekont indirilebilir.

---

## 7. Mock'tan Gerçek Veriye: `DATA` → Modeller + API

`data.jsx`'teki her dizi bir API çıktısına karşılık gelir. Mock'ları **MSW** ile koruyup gerçek endpoint'lere bağlayın.

| Mock alanı | Endpoint(ler) | Doküman |
|---|---|---|
| `customer` | `GET /customer/profile` (+ login) | `0.3`, `1.2` |
| `wallets` | `GET /customer/home/balances`, `GET /customer/accounts/balances` | `1`, `2` |
| `tx` | `GET /customer/home/recent-activities` (son 7), `GET /customer/accounts/activities` (filtre+pagination) | `1`, `2` |
| `recipients` | `GET/POST/PUT/DELETE /customer/saved-recipients` | `4.1` |
| `ibans` | `GET /customer/own-ibans` | `5` |
| `fees` | `GET /customer/fees/transfer` | `4.2/4.3` |
| `fxRates` | `GET /fx/quote` (süreli quote) | `4.3` |
| — (transfer) | `POST /customer/transfers`, `POST /customer/self-transfer` | `4`, `5` |
| — (onay) | `GET .../confirmation`, `POST .../approve`, `POST .../cancel`, `GET .../receipt` | `1.1` |
| — (ayarlar) | `GET /customer/settings/receipts`, `POST .../change-password`, `PUT .../preferences`, `…/contacts`, `…/personal-info`, `…/notification-preferences`, `…/transfer-limits` | `1.2` |
| — (topup) | `GET /customer/topup/instructions` | `3` |
| — (şikâyet) | `POST /customer/support-cases`, `POST /documents` | `6` |

**Sunucu state:** TanStack Query ile cache + invalidation. Finansal/veri değiştiren çağrılarda **`Idempotency-Key`/`requestId`** zorunlu (mükerrer engelleme, `0.5`).

---

## 8. TypeScript Modelleri (öneri)

```ts
type WalletType = 'CustomerPersistent' | 'CustomerTransactional';
interface Wallet { id: string; type: WalletType; label: string; no: string;
  currency: CurrencyCode; balance: number; editable: boolean; } // editable=false → "Sadece görüntüleme"

type TransactionStatus = 'Pending' | 'Sent' | 'Completed' | 'ErrorSend' | 'ErrorReceive';
type TransactionDirection = 'in' | 'out';          // bakiye etkisine göre (artış=in)
interface Transaction { id: string; date: string; dir: TransactionDirection;
  type: string; counterparty: string; counterpartyNo?: string;
  account?: string; iban?: string; ref: string; currency: CurrencyCode;
  amount: number; balanceAfter: number; status: TransactionStatus;
  description?: string; purpose?: PaymentPurpose; country?: string; fxRate?: string; }

interface SavedRecipient { id: string; label: string; name: string; country: string;
  isIntl: boolean; phone?: string; email?: string; customerNo?: string;
  purpose?: PaymentPurpose; description?: string; recordStatus: 0 | 1; }
```
`record_status` (1=aktif/0=soft-delete) ve denetim alanları (`created_at/by`, `updated_at/by`) tüm yazılabilir varlıklarda bulunur (`0.9`). Listelemelerde yalnızca `record_status=1`.

ENUM'lar (`transaction_type`, `transaction_status`, `transaction_direction`, `payment_purpose`, `currency`, `wallet_type`, `complaint_type`, `education_level`, `employment_category`, `employment_occupation`) ortak `Veri-Sozlugu-ENUM.md`'den alınır — `lib/enums.ts`'te tek kaynaktan tutun.

---

## 9. İş Kuralları (UI'da uygulanması gerekenler)

Prototipte basitleştirilmiş; üretimde dökümana göre uygulayın:

- **Erişim:** Yalnızca `CustomerPersistent` cüzdanı olan müşteri giriş yapabilir (`0.2`). Diğer cüzdanlar salt-görüntüleme; üzerlerinde gönder/al/çek **kapalı**.
- **Gönderim kaynağı:** Yalnızca CustomerPersistent cüzdandan; `SourceWalletPicker` sadece bunları listeler.
- **Para yükleme uygulamadan yapılamaz** — `/topup` sadece IBAN talimatı.
- **Para Al** sadece müşterinin **kendi IBAN'ları**; serbest IBAN girişi yok (lisans kısıtı).
- **Limitler:** müşteri ekran limiti + risk bazlı limit → **en kısıtlayıcı** uygulanır (`0.6`, `1.2`). Müşteri kendi limitini kurumsal üst sınırın üzerine çıkaramaz.
- **Sanction/fraud:** gönderim öncesi tarama; hit → ek bilgi/İşlem Beyanı.
- **FX (yurt dışı):** kur **süreli quote**; süre dolarsa uyarı + otomatik yenileme. Riskli ülke kısıtları.
- **Kayıtlı kişi "Gönder":** ülkeye göre 4.2/4.3'e yönlendir; **tutar/para birimi boş**, **alıcı dışı alanlar düzenlenebilir** gelir.
- **Şikâyet:** aydınlatma onayı işaretlenmeden **Gönder pasif**; dosya mime/boyut/antivirüs.
- **Hata yönetimi:** kullanıcıya **jenerik mesaj + hata kodu**; iç bilgi sızdırma yok; Tekrar Dene/İptal.

### Validasyon (`lib/validators.ts`)
- Tüm girdilerde baş/son **trim**.
- Not/açıklama/mesaj alanlarında **regex**: TCKN ve kart numarası girişini **engelle** (KVKK, `0.4`).
- Tutar > 0 ve limit/bakiye kontrolü.
- İletişim bilgisi **tekilliği** (e-posta/telefon başka müşteride olamaz).
- Parola: yeni = tekrar, politikaya uygun, eskisiyle aynı olamaz; başarılı değişimde oturum revoke.
- OTP/"tekrar gönder" uçlarında **rate limit** (saniyede 1, bir adres için 5).

---

## 10. Açık Konular (geliştirme öncesi netleştirilecek)

Dökümanlardaki **risk/açık sorular** bölümleri üretimde karar gerektirir — AI bunları kendi başına uydurMASIN, iş birimine sorun:

- **`5. Para Al` yön belirsizliği:** ekran adı "Para Al" ama açıklama "para göndererek yükleme" — çelişkili. Olası yorum (a) cüzdandan kendi IBAN'a çıkış (tutarlı kabul edilen). Yön kesinleşmeden `/receive` final davranışı kilitlenmemeli (`5 §19`).
- İşlem Beyanı modalında istenecek alan listesi netleştirilmeli (`1.1 §19`).
- IBAN maskeleme politikası (`2 §19`).
- Müşteri limiti vs. kurumsal/risk limiti önceliklendirme UI gösterimi (`1.2 §19`).
- Tüzel müşteri yetkili kişisi işlem limiti önceliği (`4 §19`).

---

## 11. Statü Modeli (UI rozetleri)

`StatusPill` eşlemesi (mevcut): `Completed→Tamamlandı (yeşil)`, `Pending→Onay Bekliyor (amber)`, `Sent→İletildi (mavi)`, `ErrorSend/ErrorReceive→Hata (kırmızı)`.

- Yurt içi: `Pending → Completed`.
- Yurt dışı: `Pending → Sent → Completed`; hatalar `ErrorSend` (gönderim öncesi) / `ErrorReceive` (sonrası, retry politikası).
- `Sent` aşamasında kullanıcıya "Partner'a iletildi, onay bekleniyor" mesajı.

Detaylı ortak statü modeli için BackOffice `0.genel-standartlar.md`.

---

## 12. i18n & RTL

- **react-i18next**, namespace'ler ekran bazlı. Diller: **tr, en, ar**.
- Tüm UI metinleri prototipten çıkarılıp `locales/{lng}/*.json`'a taşınmalı (şu an TR gömülü).
- Arapça için `dir="rtl"`: `<html dir>` + mantıksal CSS (`margin-inline`, `padding-inline`, `text-align: start`). Mevcut `styles.css` çoğunlukla flex/gap kullandığından RTL'e uygun; sabit `left/right` olan az sayıda yeri (`.input-affix .pre { left:14px }`, dropdown `left:0`) mantıksal eşdeğerle değiştirin.
- Para/sayı: `Intl.NumberFormat('tr-TR'…)` → aktif locale'e göre. Tarih: İstanbul saat dilimi (`0.4`).

---

## 13. Güvenlik Notları (üretim)

- **2FA** zorunlu; access+refresh token rotasyonlu; session id URL'de **yer almaz**; atıl oturum otomatik sonlanır (`0.3`).
- Phishing önlemi: kullanıcıya özel **Karşılama Mesajı** girişte gösterilir.
- Hassas veri (parola/PIN/kart no) loglarda **maskeli**; `correlation_id` ile uçtan uca izleme; finansal işlemler ve başarılı/başarısız girişler loglanır (`0.7`).
- API: TLS zorunlu; endpoint+kullanıcı+cihaz/IP bazlı rate-limit; OTP/giriş uçlarında daha sıkı; kötüye kullanımda cooldown/progressive delay/captcha.
- **Idempotency:** veri değiştiren tüm çağrılarda `Idempotency-Key`/`requestId`.
- İstemcide kritik veri tutulmaz; iş mantığı sunucuda.

---

## 14. Adım Adım Dönüşüm Planı

1. **İskelet:** `npm create vite@latest` (react-ts) → `tokens.css`/`base.css`'i taşı, fontları ekle, `data-theme`/font-size mekanizmasını `ThemeProvider`'a koy.
2. **UI kit:** `components/ui/*` ve `Icon`'u ESM'e çevir (window export'larını sil, `export`/`import` kullan). Görsel diff için her bileşeni prototiple yan yana doğrula.
3. **Layout + Router:** `AppLayout` (Header + Outlet), `createBrowserRouter`, korumalı rotalar, `/login`.
4. **Auth:** `LoginPage` 2FA akışı + `AuthProvider` (mock token). Parola sıfırlama ekranı.
5. **Read ekranları:** Home, Activity (mock API + TanStack Query). `WalletCard`, `TxDetailModal`.
6. **Transfer akışı:** Domestic/Intl/Receive formları → `TransferDraft` → ConfirmPage (OTP + İşlem Beyanı) → SuccessPage. FX quote entegrasyonu.
7. **Recipients** CRUD + "Gönder" yönlendirme mantığı.
8. **Topup, Complaints, Settings** (tüm bölümler).
9. **Validasyon & iş kuralları** (`§9`) + ENUM'lar.
10. **i18n**: metinleri dışa al, EN/AR + RTL.
11. **API katmanı**: MSW mock'ları gerçek backend'e bağla; idempotency, hata kodu/jenerik mesaj, loglama.
12. **Erişilebilirlik & QA:** her doküman dosyasının **§20 Kabul Kriterleri**'ni test senaryosu olarak kullan.

---

## 15. Ekran Bazlı Dönüşüm Checklist'i

Her ekran için ilgili `uploads/*.md` dosyasının **§5 Ekran Yapısı, §6 Alan Listesi, §7 Validasyon, §8 İş Kuralları, §20 Kabul Kriterleri** bölümlerini birebir karşıla:

- [ ] Ana Sayfa — bakiye panelleri (salt-görüntüleme etiketi), son 7 hareket, başarısız erişim uyarısı, karşılama mesajı.
- [ ] Hesap Hareketleri — filtreler (yön/tür/tarih/tutar/karşı taraf), pagination, kolon sıralama, satır→Detay, işlem sonrası bakiye.
- [ ] Para Yükle — IBAN talimatı, müşteriye özel referans, "uygulamadan yükleme yok" net.
- [ ] Para Gönder Hub — 3 alt akış girişi, "yalnızca CustomerPersistent" notu.
- [ ] Kayıtlı Kişilerim — liste/ekle/değiştir/sil (soft-delete), Gönder→ülkeye göre yönlendirme.
- [ ] Yurt İçine — alan listesi, limit, "kayıtlı kişilere ekle", Pending→Completed.
- [ ] Yurt Dışına — FX quote/net tutar, riskli ülke, Pending→Sent→Completed.
- [ ] Para Al — sadece kendi IBAN, otomatik salt-okunur alanlar (⚠️ yön netleştirme §10).
- [ ] İşlem Onay — özet panelleri, OTP, İşlem Beyanı (Risk=Kritik), Onayla/Düzenle/İptal, dekont.
- [ ] Dilek/Şikâyet — aydınlatma onayı→Gönder aktif/pasif, dosya kontrolü, regex.
- [ ] Ayarlar — tüm bölümler; parola değişince oturum revoke; limit üst sınır; bildirim tercihleri güvenlik bildirimlerini kapatamaz.

---

### Ek: Prototip ↔ Üretim Eşlemesi (kısa)
- `Object.assign(window,…)` → `export`/`import`.
- `route` state + `switch` → React Router.
- `useTweaks`/`TweaksPanel` → **silinir**; karşılığı Ayarlar.
- `DATA` (mock) → `api/*` + `models/*` + MSW.
- Gömülü TR metin → `react-i18next`.
- Inline stiller çoğunlukla token kullanıyor; tekrar edenleri util/komponent sınıflarına çıkarın.
```
```

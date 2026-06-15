# Dekont Şablonu — Spesifikasyon

> Para transferi **dekontunun** (Money Transfer Receipt) ortak, yeniden kullanılabilir şablonudur. Üç uygulamada (BackOffice, Agent, Customer) dekont üretilen tüm noktalar bu şablonu referans alır. Şablon dosyası: `dekont-template.html`. Kaynak: `Screens_v04.md` "Dekont" bölümü + gerçek PGpara dekont örneği.

## 1. Künye

| Alan | Değer |
|---|---|
| Şablon adı | Para Transferi Dekontu / Payment Receipt |
| Dosyalar | `dekont-template.html` (yapı), `dekont-sablonu.md` (bu spec) |
| Format | Yazdırılabilir HTML (A4) → PDF |
| Diller | Türkçe, İngilizce, Arapça (AR için `dir="rtl"`) |
| Üretim | İşlem onaylandıktan sonra, işlem numarası ile ilişkili olarak üretilir |
| Sahibi | Uyum / Hukuk (yasal metin), Ürün (alan yapısı) |

## 2. Amaç ve Kapsam

Tüm para çekme ve para transferi işlemlerinde, işlem tamamlandıktan sonra taraflara verilen/indirilen resmî belgedir. Dekont; işlem onay ekranından indirilebilir, yazdırılabilir ve **imzalı** hali sisteme geri yüklenir (`document_category = ProofOfTransaction`).

Bu şablon, üretimde kullanılan gerçek **PGpara** dekont düzeninin placeholder'lı halidir. Dekont üretilen her ekran, kendi içinde ayrı bir tasarım yapmaz; bu şablonu kullanır.

## 3. Düzen (Layout)

Dekont, yukarıdan aşağıya şu bloklardan oluşur:

1. **Üst Bilgi (Header)** — 3 sütun: (sol) firma adı + e-posta + web; (orta) logo; (sağ) vergi dairesi/no + adres + telefon.
2. **Başlık** — "ÖDEME DEKONTU / PAYMENT RECEIPT".
3. **Meta Satırları** — Tarih & Saat, Dekont No, Partner Ref. No; ardından İşlem Noktası adı.
4. **Alıcı Bilgileri | Gönderen Bilgileri** — yan yana iki sütun.
5. **Ödeme Bilgileri** — Ülke, Şehir, Ödeme Tutarı (rakam + yazı), Para Birimi.
6. **(Opsiyonel) İşlem ve Tutarlar** — ücret/kur/net tutar detayları; yalnızca ilgili veri varsa.
7. **Alt Blok** — Yasal metin (KVKK / ticari elektronik ileti) + QR kod + İmza alanı.

> **Opsiyonel alan kuralı:** `Screens_v04` — "Alanlar zorunlu değil opsiyoneldir, bilgi varsa doldurulur." Verisi olmayan alan/blok render edilmez.

## 4. Veri Alanı Eşleme Tablosu (Placeholder → Kaynak)

| Placeholder | Açıklama | Veri Kaynağı |
|---|---|---|
| `{{company_name}}` | Firma unvanı | Parametre (ör. "Paragram Ödeme Kuruluşu A.Ş.") |
| `{{company_email}}` / `{{company_website}}` | Firma iletişim | Parametre |
| `{{company_logo_url}}` / `{{company_brand}}` | Logo / marka | Parametre (ör. "PGpara") |
| `{{tax_office_name}}` / `{{tax_no}}` | Vergi dairesi ve no | Parametre |
| `{{company_address}}` / `{{company_phone}}` | Firma adres/telefon | Parametre |
| `{{lang}}` / `{{dir}}` | Dil kodu / yön (`ltr`/`rtl`) | Müşteri dil tercihi |
| `{{date_time}}` | İşlem tarih-saati | `transaction.completed_at` (İstanbul saat dilimi) |
| `{{receipt_no}}` | Dekont / işlem numarası | `transaction.transaction_no` |
| `{{partner_ref_no}}` | Partner referans no (ör. Ria No) | `transaction.foreign_reference_no` |
| `{{sending_point_name}}` | İşlem noktası (temsilci) | `agent.trade_name` (gönderen temsilci) |
| `{{receiver_full_name}}` | Alıcı ad-soyad / unvan | Alıcı kaydı |
| `{{receiver_identity_no}}` | Alıcı kimlik no (**maskeli**) | Alıcı kimlik — maskelenmiş gösterilir |
| `{{receiver_tel}}` | Alıcı telefon | Alıcı iletişim |
| `{{receiver_address}}` | Alıcı adresi | Alıcı adres (Ülke, İl, İlçe, açık adres) |
| `{{sender_full_name}}` | Gönderen ad-soyad / unvan | Gönderen kaydı |
| `{{sender_tel}}` | Gönderen telefon | Gönderen iletişim |
| `{{sender_relation}}` | Gönderen–alıcı yakınlığı | İşlem beyanı / form |
| `{{sender_reason}}` | Gönderim nedeni | `payment_purpose` (görünen ad) |
| `{{payment_country}}` / `{{payment_city}}` | Ödeme ülke/şehir | Alıcı / hedef lokasyon |
| `{{payment_amount}}` | Ödeme tutarı (rakam) | İşlem tutarı |
| `{{payment_amount_words}}` | Tutarın yazı ile karşılığı | Hesaplanmış |
| `{{payment_currency}}` | Para birimi | `currency` |
| `{{transaction_type}}` | İşlem türü | `transaction_type` (görünen ad) |
| `{{payment_purpose}}` | Ödeme türü | `payment_purpose` (görünen ad) |
| `{{iban}}` | IBAN | İlgili akışta dolu (banka transferi) |
| `{{sent_amount}}` / `{{source_currency}}` | Gönderilen tutar / kaynak PB | İşlem |
| `{{fixed_fee}}` / `{{proportional_fee}}` / `{{total_fee}}` | Sabit / oransal / toplam ücret | Ücret hesabı |
| `{{total_paid}}` | Gönderenin ödeyeceği toplam tutar | Gönderilen + Toplam Ücret |
| `{{exchange_rate}}` / `{{target_currency}}` | Döviz kuru / hedef PB | FX (döviz/çapraz işlem) |
| `{{net_amount}}` | Alıcının alacağı net tutar | Hesaplanmış |
| `{{transaction_description}}` | İşlem açıklaması | İşlem |
| `{{legal_text}}` | Yasal metin gövdesi | Versiyonlu yasal metin deposu |
| `{{qr_code_url}}` | QR kod görseli/verisi | Versiyonlu sözleşme URL'si (bkz. §6) |
| `{{signature}}` | İmza alanı | Islak imza için boş bırakılır |

## 5. Etiket Yerelleştirme Tablosu (`{{t.*}}`)

Etiketler müşterinin dil tercihine göre doldurulur.

| Token | Türkçe | İngilizce | Arapça |
|---|---|---|---|
| `t.payment_receipt` | ÖDEME DEKONTU | PAYMENT RECEIPT | إيصال الدفع |
| `t.date_time` | TARİH & SAAT | DATE & TIME | التاريخ والوقت |
| `t.receipt_no` | DEKONT NO | RECEIPT NO | رقم الإيصال |
| `t.partner_ref_no` | PARTNER REF. NO | PARTNER REF. NO | رقم مرجع الشريك |
| `t.sending_point` | İŞLEM NOKTASI | SENDING POINT NAME | نقطة الإرسال |
| `t.receiver_information` | ALICI BİLGİLERİ | RECEIVER INFORMATION | معلومات المستلم |
| `t.sender_information` | GÖNDEREN BİLGİLERİ | SENDER INFORMATION | معلومات المرسل |
| `t.full_name` | AD SOYAD / UNVAN | FULL NAME | الاسم الكامل |
| `t.identity_no` | KİMLİK NO | IDENTITY NO | رقم الهوية |
| `t.tel` | TELEFON | TEL | الهاتف |
| `t.address` | ADRES | ADDRESS | العنوان |
| `t.relation` | YAKINLIK | RELATION | صلة القرابة |
| `t.reason` | GÖNDERİM NEDENİ | REASON | السبب |
| `t.payment_information` | ÖDEME BİLGİLERİ | PAYMENT INFORMATION | معلومات الدفع |
| `t.country` | ÜLKE | COUNTRY | الدولة |
| `t.city` | ŞEHİR | CITY | المدينة |
| `t.payment_amount` | ÖDEME TUTARI | PAYMENT AMOUNT | مبلغ الدفع |
| `t.currency` | PARA BİRİMİ | CURRENCY | العملة |
| `t.transaction_details` | İŞLEM VE TUTARLAR | TRANSACTION DETAILS | تفاصيل المعاملة |
| `t.transaction_type` | İŞLEM TÜRÜ | TRANSACTION TYPE | نوع المعاملة |
| `t.payment_purpose` | ÖDEME TÜRÜ | PAYMENT PURPOSE | غرض الدفع |
| `t.iban` | IBAN | IBAN | الآيبان |
| `t.sent_amount` | GÖNDERİLEN TUTAR | SENT AMOUNT | المبلغ المرسل |
| `t.fixed_fee` | SABİT ÜCRET | FIXED FEE | الرسوم الثابتة |
| `t.proportional_fee` | ORANSAL ÜCRET | PROPORTIONAL FEE | الرسوم النسبية |
| `t.total_fee` | TOPLAM ÜCRET | TOTAL FEE | إجمالي الرسوم |
| `t.total_paid` | ÖDENECEK TOPLAM TUTAR | TOTAL PAID | المبلغ الإجمالي المدفوع |
| `t.exchange_rate` | DÖVİZ KURU | EXCHANGE RATE | سعر الصرف |
| `t.target_currency` | HEDEF PARA BİRİMİ | TARGET CURRENCY | العملة المستهدفة |
| `t.net_amount` | ALICININ ALACAĞI NET TUTAR | NET AMOUNT | المبلغ الصافي |
| `t.description` | AÇIKLAMA | DESCRIPTION | الوصف |
| `t.signature` | İMZA | SIGNATURE | التوقيع |
| `t.legal_heading` | TİCARİ ELEKTRONİK İLETİLER VE KİŞİSEL VERİLERİN KORUNMASI | COMMERCIAL ELECTRONIC MESSAGES AND PROTECTION OF PERSONAL DATA | الرسائل الإلكترونية التجارية وحماية البيانات الشخصية |

## 6. Yasal Metin ve QR Kod

- **Yasal metin (`{{legal_text}}`):** Ticari elektronik ileti onayı ve kişisel verilerin korunması (KVKK) ile yurt dışı veri aktarımı rızası içerir. **Versiyonlu** ve Uyum/Hukuk birimince yönetilir; müşterinin diline göre (TR/EN/AR) doldurulur. Dekont, metnin işlem anında geçerli versiyonunu yansıtır.
- **QR kod (`{{qr_code_url}}`):** Firma tarafından yönetilen merkezî sözleşme/politika sayfasına yönlendirir. Genel bir sayfa değil; işlem anında geçerli sözleşme/politika metninin **versiyonunu** (tarih/versiyon numarası ile) işaret eden **versiyonlu ve değişmez (immutable) URL** olmalıdır. Sayfa içeriği: Kullanıcı Sözleşmesi (sürekli müşteri ilişkisi varsa), Gizlilik Politikası, Açık Rıza Metni, İşlem Koşulları & İptal/İade Politikası, SSS, Dilek-Şikâyet-Öneri, Destek bağlantıları.

> Gerçek PGpara dekontundaki mevcut İngilizce yasal metin, geçerli sürümün referansı olarak yasal metin deposunda saklanır; TR ve AR çevirileri Hukuk birimince onaylanır.

## 7. Kurallar ve Notlar

- Dekont yalnızca **işlem onaylandıktan sonra** üretilir; üretilmemişse indirme butonu pasiftir.
- Kimlik numarası dekontta **maskeli** gösterilir (örn. `ER****2`) — PII koruma.
- İşlem tutarı hem rakam hem **yazı ile** yazılır.
- Tutarlar ilgili para biriminin minor unit (ondalık) kuralına göre biçimlendirilir.
- Opsiyonel "İşlem ve Tutarlar" bloğu yalnızca ücret/kur/IBAN gibi veriler mevcutsa render edilir.
- İmza alanı ıslak imza içindir. `Screens_v04` "Dekont" bölümü Temsilci ve Müşteri imzasından bahseder; temsilci kanalı dekontlarında iki imza alanı kullanılabilir (uygulama tercihine göre).
- Arapça dekontlarda `dir="rtl"` uygulanır.
- Üretilen dekont PDF olarak saklanır; imzalı hali `ProofOfTransaction` kategorisinde işleme bağlanır ve sonradan değiştirilemez.

## 8. Kullanım Yerleri (Referans)

Bu şablon, aşağıdaki dekont üretilen/indirilen ekranlarda referans alınır:

| Uygulama | Dosya | İlgili nokta |
|---|---|---|
| BackOffice | `0.genel-standartlar.md` §0.25 | Dekont genel kuralı (kanonik) |
| BackOffice | `5.1.islem-detay.md` | İşlem belgeleri / dekont |
| Agent | `1.1.islem-onay.md` | "Dekont İndir" |
| Agent | `1.2.imzali-dekont-yukleme.md` | "Dekont Yazdır" / "İmzalı Dekont Yükle" |
| Agent | `1.3.ayarlar.md` | "Dekontlarım" |
| Customer | `1.1.islem-onay.md` | "Dekont İndir" |
| Customer | `1.2.ayarlar.md` | "Dekontlarım" |

## 9. Açık Sorular ve Riskler

- `Screens_v04` "Dekont" bölümü ücret/kur/net tutar gibi ek alanlar tanımlar; gerçek PGpara örnek dekontu ise yalnızca temel ödeme alanlarını içerir. Şablon her ikisini de destekler (opsiyonel blok). Hangi alanların hangi işlem tipinde **zorunlu** görüneceği iş birimiyle netleştirilmelidir.
- Yasal metnin TR/AR resmî çevirileri Hukuk birimince hazırlanıp onaylanmalıdır.
- "Partner Ref. No" yalnızca yurt dışı/partner işlemlerde dolar; yurt içi işlemlerde gizlenmesi önerilir.
- İmza alanı sayısı (tek / temsilci + müşteri) uygulama bazında kesinleştirilmelidir.

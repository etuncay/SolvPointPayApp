# Epay — ENUM Veri Sözlüğü

> Bu doküman, **BackOffice, Agent ve Customer** uygulamalarının tamamında kullanılan ENUM (sabit değer kümeleri) tanımlarının **tek ve ortak referansıdır**. Kaynak: `Screens_v04.md`. Üç uygulamanın `0.genel-standartlar.md` dosyaları (BackOffice §0.18 özet indeks) bu sözlüğe atıf yapar.

## Kullanım ve Konvansiyonlar

- **Kod (Code):** Veritabanı ve API'lerde kullanılacak teknik değerdir; İngilizce, `PascalCase`.
- **Görünen Ad:** Kullanıcı arayüzünde gösterilecek Türkçe etiket (çoklu dil desteğiyle TR/EN/AR yerelleştirilir).
- **Kaynak durumu:**
  - **Tanımlı** — değer kümesi kaynak analizde açıkça belirtilmiştir.
  - **Çıkarım** — değerler kaynakta tam listelenmemiştir; bağlamdan çıkarılmış **öneri**dir, geliştirme öncesi iş birimiyle **teyit edilmelidir**.
- ENUM değerleri veritabanında ayrı referans tablolarında ya da kod sabitleri olarak tutulabilir; çok dilli görünen adlar için yerelleştirme tablosu önerilir.
- `record_status` (1/0) teknik bir alandır, ENUM değildir; iş statülerinden (`entity_status`, `status` vb.) bağımsızdır.

---

# 1. Varlık ve Statü ENUM'ları

## 1.1 `entity_status` — Varlık Statüsü · Tanımlı

Müşteri, temsilci ve yetkili kişilerin yaşam döngüsü statüsü.

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| Active | Aktif | İşlem yapabilir / adına işlem yapılabilir. |
| Inactive | Pasif | Sisteme girilmiş ancak KYC tamamlanmamış / taslak kayıt. İşlem yapamaz. |
| Blocked | Bloke | Geçici olarak bloke; gerekçe `entity_blockage_reason` ile birlikte gösterilir. |
| Closed | Kapalı | Kalıcı olarak kapatılmış; gerekçe `entity_closure_reason` ile birlikte gösterilir. |

## 1.2 `entity_blockage_reason` — Bloke Gerekçesi · Tanımlı

`entity_status = Blocked` iken zorunlu gerekçe.

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| KycInProgress | KYC İncelemesinde | Yaptırım eşleşmesi / manuel inceleme sürüyor. |
| IncompleteOrIncorrectInformation | Bilgi Eksik veya Hatalı | Kimlik/adres bilgileri eşleşmedi veya eksik. |
| MissingDocuments | Belge Eksik | Zorunlu belge(ler) tamamlanmamış. |
| SuspiciousTransactionDetected | Şüpheli İşlem Tespit Edildi | Fraud izleme alarmı sonucu bloke. |
| UnderInvestigation | İnceleme Altında | Kara para aklama şüphesi / periyodik tarama eşleşmesi. |

## 1.3 `entity_closure_reason` — Kapatma Gerekçesi · Kısmen Tanımlı

`entity_status = Closed` iken zorunlu gerekçe.

| Kod | Görünen Ad | Açıklama | Kaynak |
|---|---|---|---|
| RejectedDueToKyc | KYC Nedeniyle Reddedildi | Uyum incelemesi olumsuz sonuçlandı. | Tanımlı |
| LongInactivity | Uzun Süre Kullanılmama | Hareketsiz hesabın kapatılması (örnek statü). | Çıkarım — dormant kapatma kuralı tanımlanmalı |
| Fraud | Dolandırıcılık | Manuel inceleme dolandırıcılık gerekçesiyle olumsuz. | Tanımlı |

## 1.4 `status` — Genel Master Veri Statüsü · Tanımlı

Ücret, kampanya, grup, rol, parametre, ortak/yetkili satırı gibi master veri kayıtlarının genel statüsü.

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| Active | Aktif | Kayıt yürürlükte. |
| Passive | Pasif | Kayıt yürürlükten kaldırılmış (tarihçeli saklanır). |

> **Açık konu:** "Durum (ENUM: status)" etiketi İletişim Bilgileri panelinde doğrulama durumunu (doğrulandı/beklemede) ifade eder gibi kullanılmaktadır. İletişim satırları için ayrı bir `contact_verification_status` (Unverified / Pending / Verified) tanımlanması önerilir.

## 1.5 `customer_type` — Müşteri Tipi · Tanımlı

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| Individual | Bireysel | Gerçek kişi müşteri. |
| Corporate | Tüzel | Tüzel kişi müşteri. |
| Prospective | Aday Müşteri | Müşteri ilişkisine girmeyen ilişkili gerçek kişi. |

## 1.6 `entity_type_core` — Çekirdek Varlık Tipi · Çıkarım

Müşteri Notları, Destek Merkezi talep sahibi, Risk Bazlı Limitler gibi ekranlarda kullanılır.

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| IndividualCustomer | Bireysel Müşteri | — |
| CorporateCustomer | Tüzel Müşteri | — |
| Agent | Temsilci | — |

## 1.7 `entity_type_full` — Genişletilmiş Varlık Tipi · Tanımlı

KYC Yönetimi (`8.2`) ve uyum inceleme ekranlarında müşteri/temsilci tarafı varlık tiplerini kapsar.

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| IndividualCustomer | Bireysel Müşteri | — |
| CorporateCustomer | Tüzel Müşteri | — |
| Agent | Temsilci | — |
| AgentAuthorized | Temsilci Yetkili Kişisi | — |
| Prospective | Aday Müşteri | — |

> **`Employee` bu kümede yer almaz.** Çalışan kayıtları İK modülünde `employee` ile yönetilir; DMS ilişkisi `dms.document_relation.relation_type = Employee` üzerinden kurulur (bkz. `9.dokuman-yonetim-sistemi.md`). KYC inceleme kapsamı yalnızca yukarıdaki beş tiptir.

---

# 2. KYC ve Kimlik ENUM'ları

## 2.1 `kyc_level` — KYC Seviyesi · Tanımlı

Yalnızca bireysel müşteriler / gerçek kişiler için kullanılır.

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| 0 | Seviye 0 | KYC başlatılmamış / doğrulanmamış. İşlem yapamaz. |
| 1 | Seviye 1 | Kimlik doğrulandı. Kısıtlı işlem; bakiye tutamaz. |
| 2 | Seviye 2 | Kimlik + adres doğrulandı. Tam işlem; bakiye tutabilir. |
| 3 | Seviye 3 | Fon kaynağı doğrulandı. En geniş limit. |

## 2.2 `kyc_status` — KYC Durumu · Tanımlı

Tüzel müşteri/temsilci yeterliliği ve KYC süreç durumu.

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| (NULL) | — | KYC süreci başlatılmamış. |
| Pending | Beklemede | Doğrulama / manuel inceleme sürüyor. |
| Approved | Onaylandı | Doğrulama tamamlandı. |
| Rejected | Reddedildi | Uyum kararı olumsuz. |

## 2.3 `approval_status` — Onay Durumu · Tanımlı

Doküman onayı ve tüzel müşteri KYC durumu için kullanılır.

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| (NULL) | Onay Beklenmiyor | Onay gerektirmeyen kayıt (`approval_required = false`). |
| Pending | Beklemede | Onay bekliyor. |
| Approved | Onaylandı | Onaylanmış. |
| Rejected | Reddedildi | Reddedilmiş. |

## 2.4 `identity_document` — Kimlik Belgesi Tipi · Tanımlı

| Kod | Görünen Ad |
|---|---|
| IdentityCard | Kimlik Kartı |
| Passport | Pasaport |
| DriversLicense | Ehliyet (Sürücü Belgesi) |
| TemporaryIdentityDocument | Geçici Kimlik Belgesi |
| BlueCard | Mavi Kart |
| ForeignIdentityCard | Yabancı Kimlik Kartı |
| ResidencePermit | İkamet İzni Belgesi |
| WorkPermitCard | Çalışma İzni Kartı |
| TaxIdentificationNumber | Vergi Kimlik Numarası |

## 2.5 `identity_document_extended` — Genişletilmiş Kimlik Belgesi Tipi · Çıkarım

KYC Yönetimi ekranında tüzel kimlik tanımlarını da kapsar. `identity_document` değerlerine ek olarak tüzel kişiler için VKN/MERSİS bazlı tanımlar içerebilir; geliştirme öncesi kesinleştirilmelidir.

## 2.6 `visa_type` — Vize Tipi · Kısmen Tanımlı

Yabancı uyruklu kişiler için.

| Kod | Görünen Ad | Açıklama | Kaynak |
|---|---|---|---|
| VisaExempt | Vize Muafiyeti | Vize bitiş tarihi zorunlu değildir. | Tanımlı |
| Tourist | Turist Vizesi | — | Çıkarım |
| Work | Çalışma Vizesi | — | Çıkarım |
| Student | Öğrenci Vizesi | — | Çıkarım |
| Residence | İkamet Vizesi | — | Çıkarım |
| Other | Diğer | — | Çıkarım |

---

# 3. Kişisel ve Demografik ENUM'lar

## 3.1 `marital_status` — Medeni Durum · Çıkarım

| Kod | Görünen Ad |
|---|---|
| Single | Bekâr |
| Married | Evli |
| Divorced | Boşanmış |
| Widowed | Dul |

> "Married" değeri kaynakta açıkça geçer (evlenmeden önceki soyadı kuralı); diğerleri standart kümeden çıkarımdır.

## 3.2 `gender` — Cinsiyet · Çıkarım

| Kod | Görünen Ad |
|---|---|
| Male | Erkek |
| Female | Kadın |

## 3.3 `education_level` — Eğitim Durumu · Çıkarım

| Kod | Görünen Ad |
|---|---|
| None | Yok / Okur-Yazar Değil |
| Primary | İlkokul |
| Secondary | Ortaokul |
| HighSchool | Lise |
| Associate | Ön Lisans |
| Bachelor | Lisans |
| Master | Yüksek Lisans |
| Doctorate | Doktora |

## 3.4 `employment_category` — Çalışma Durumu · Çıkarım

| Kod | Görünen Ad |
|---|---|
| Employed | Ücretli Çalışan |
| SelfEmployed | Serbest Meslek |
| Employer | İşveren |
| Unemployed | İşsiz |
| Student | Öğrenci |
| Retired | Emekli |
| Homemaker | Ev Hanımı/Beyi |

## 3.5 `employment_occupation` — Meslek · Çıkarım (geniş liste)

Meslek listesi kaynakta tam tanımlanmamıştır; `OccupationTransactionThresholds` referans tablosundaki `OccupationId` ile ilişkilidir. Meslek bazlı işlem eşikleri (beklenen gelir, tek/aylık işlem tutarı) bu kümeyle bağlanır. **Standart bir meslek kod listesi (örn. ISCO bazlı) ile oluşturulması ve `OccupationTransactionThresholds` ile eşlenmesi önerilir.**

## 3.6 `address_type` — Adres Tipi · Kısmen Tanımlı

| Kod | Görünen Ad | Açıklama | Kaynak |
|---|---|---|---|
| Registered | Tescilli / Kayıtlı Adres | Tüzel müşteri/temsilcide en az bir adet zorunlu. | Tanımlı |
| Home | Ev Adresi | — | Çıkarım |
| Work | İş Adresi | — | Çıkarım |
| Contact | İrtibat Adresi | İrtibat adresi ayrıca checkbox ile işaretlenir. | Çıkarım |
| Other | Diğer | — | Çıkarım |

## 3.7 `employment_status` — Çalışan İstihdam Durumu (İK) · Çıkarım

| Kod | Görünen Ad |
|---|---|
| Active | Aktif Çalışan |
| OnLeave | İzinde |
| Terminated | İşten Ayrılmış |

---

# 4. Tüzel Kişilik ENUM'ları

## 4.1 `organization_type` — Hukuki Statü · Tanımlı

| Kod | Görünen Ad |
|---|---|
| AnonimCompany | Anonim Şirket |
| LimitedCompany | Limited Şirket |
| LimitedPartnership | Komandit Şirket |
| CollectiveCompany | Kollektif Şirket |
| SoleProprietorship | Şahıs Şirketi |
| Cooperative | Kooperatif |
| CapitalCompany | Sermaye Şirketi |
| EconomicPublicInstitution | İktisadi Kamu Kuruluşu |
| OrdinaryPartnership | Adi Ortaklık |
| ApartmentSiteManagement | Apartman / Site Yönetimi |
| Association | Dernek |
| Foundation | Vakıf |
| PoliticalParty | Siyasi Parti |
| UnionConfederation | Sendika / Konfederasyon |
| ForeignLegalEntity | Yurt Dışında Yerleşik Tüzel Kişi |
| NonLegalEntityOrganization | Tüzel Kişiliği Olmayan Teşekkül |
| PublicInstitution | Kamu Kurumu |

> `ForeignLegalEntity` onboard edilmez (kapsam dışı). Hukuki statüye göre zorunlu belge seti için bkz. BackOffice "Tüzel Kişiler – Zorunlu Belgeler".

## 4.2 `organization_type_commercial` — Ticari Hukuki Statü (Temsilci) · Çıkarım

Temsilciler yalnızca ticari tüzel kişilik olabilir; `organization_type` kümesinin ticari alt kümesi.

| Kod | Görünen Ad |
|---|---|
| AnonimCompany | Anonim Şirket |
| LimitedCompany | Limited Şirket |
| LimitedPartnership | Komandit Şirket |
| CollectiveCompany | Kollektif Şirket |
| SoleProprietorship | Şahıs Şirketi |
| Cooperative | Kooperatif |
| CapitalCompany | Sermaye Şirketi |
| OrdinaryPartnership | Adi Ortaklık |

## 4.3 `ownership_type` — Sermaye Yapısı · Çıkarım

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| Domestic | Yerli Sermaye | — |
| Foreign | Yabancı Sermaye | — |
| Mixed | Karma Sermaye | — |
| Public | Kamu Sermayesi | — |

> Değer kümesi kaynakta tanımlanmamıştır; geliştirme öncesi teyit edilmelidir.

---

# 5. İşlem ve Para Transferi ENUM'ları

## 5.1 `transaction_status` — İşlem Statüsü · Tanımlı

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| Pending | Beklemede | İşlem girildi. |
| Sent | Gönderildi | Yurt dışı işlemde partner kuruluşa iletildi (yalnızca yurt dışı). |
| Completed | Tamamlandı | İşlem başarıyla tamamlandı (terminal). |
| OnHold | Durduruldu / Bloke | İşlem bloke edildi. |
| Unblocked | Bloke Kaldırıldı | Bloke kaldırıldı; Pending ile aynı kurallara tabi. |
| Canceled | İptal Edildi | İşlem iptal edildi (terminal). |
| ErrorComplete | Hata (Yurt İçi) | Yurt içi işlemde tamamlama hatası. |
| ErrorSend | Hata (Gönderim Öncesi) | Yurt dışı işlemde gönderim öncesi hata. |
| ErrorReceive | Hata (Gönderim Sonrası) | Yurt dışı işlemde gönderim sonrası hata. |
| Retrying | Tekrar Deneniyor | Hatalı işlem yeniden deneniyor. |

## 5.2 `transaction_direction` — İşlem Yönü · Tanımlı

İşlemin seçili cüzdan bakiyesine etkisine göre belirlenir. (Bazı ekranlarda `direction` adıyla da geçer; eşdeğerdir.)

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| Inflow | Para Girişi | Bakiye artar. |
| Outflow | Para Çıkışı | Bakiye azalır. |

## 5.3 `transaction_type` — İşlem Türü · Kısmen Tanımlı

İşlem türü, UI'daki alt akışların (kendi cüzdanına, banka hesabına, kişiye, yurt dışına, para çekme, para yatırma) tek `transaction` kaydında ayrıştırılmasında kullanılır. Kaynakta yalnızca fraud kural örneklerinde `AgentWithdrawal` ve `BankWithdrawal` değerleri açıkça geçer.

| Kod | Görünen Ad | Kaynak |
|---|---|---|
| AgentWithdrawal | Temsilciden Para Çekme | Tanımlı |
| BankWithdrawal | Banka Hesabından Para Çekme | Tanımlı |
| AgentDeposit | Temsilciden Para Yatırma | Çıkarım |
| WalletTopUp | Banka IBAN'dan Bakiye Yükleme | Çıkarım |
| WalletToOwnWallet | Kendi Cüzdanına Transfer | Çıkarım |
| WalletToBankAccount | Banka Hesabına Transfer | Çıkarım |
| WalletToPerson | Kişiye Transfer | Çıkarım |
| InternationalTransfer | Yurt Dışına Transfer | Çıkarım |
| ManualCorrection | İade / İptal / Düzeltme | Çıkarım |

> **Önemli:** `transaction_type` kümesi geliştirme öncesi iş birimiyle netleştirilmeli; muhasebe entegrasyonu ve raporlama bu kümeye bağımlıdır.

## 5.4 `payment_purpose` — Ödeme Türü · Çıkarım

| Kod | Görünen Ad |
|---|---|
| FamilySupport | Aile Desteği |
| GoodsPayment | Mal Bedeli |
| ServicePayment | Hizmet Bedeli |
| Salary | Maaş / Ücret |
| Education | Eğitim |
| Health | Sağlık |
| Rent | Kira |
| Investment | Yatırım |
| Other | Diğer |

> Değer kümesi kaynakta tanımlanmamıştır; mevzuat (MASAK ödeme amacı sınıflandırması) ile uyumlu olarak teyit edilmelidir.

## 5.5 `correction_reason` — Aktarım Sebebi · Çıkarım

İade / İptal / Düzeltme ekranında kullanılır.

| Kod | Görünen Ad |
|---|---|
| Refund | İade |
| Cancellation | İptal |
| Correction | Düzeltme |
| Chargeback | Ters İbraz |
| Other | Diğer |

## 5.6 `channel` — Kanal · Tanımlı

İşlem ve limit hesaplamalarında kanal ayrımı.

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| Agent | Temsilci | Temsilci uygulaması üzerinden işlem. |
| Wallet | Cüzdan (Self-Servis) | Müşteri uygulaması (web/mobil) üzerinden işlem. |

> Not: Fraud kurallarındaki Block aksiyonunun "Channel" parametresi (Web-Mobil / Temsilci / Full) ayrı bir alandır, bu ENUM ile karıştırılmamalıdır.

## 5.7 `currency` — Para Birimi · Kısmen Tanımlı

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| TRY | Türk Lirası | Raporlama para birimi. |
| USD | ABD Doları | Özellikle yurt dışı bağlantılı transferlerde. |
| EUR | Euro | — |

> Kaynakta TRY/USD/EUR açıkça geçer. Desteklenen para birimi kümesi parametrik genişletilebilir; minor unit (ondalık) kuralları para birimi bazında tanımlanmalıdır.

---

# 6. Hesap ve Cüzdan ENUM'ları

## 6.1 `wallet_type` — Hesap / Cüzdan Tipi · Tanımlı

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| Reserve | Şirket Ana Hesabı (Kasa) | Operasyonel rezerv / genel fon havuzu. |
| Revenue | Gelir Hesabı | İşlem ücret ve komisyon gelirleri. |
| Suspense | Geçici Hesap | Eşleştirilememiş / mutabakatı belirsiz tutarlar. |
| AgentAdvance | Temsilci Avans Hesabı | Temsilcinin ön finansman bakiyesi. |
| AgentCommission | Temsilci Komisyon Hesabı | Temsilci komisyon/ücret payları. |
| PartnerAdvance | Muhabir Avans ve Mutabakat Hesabı | Yurt dışı partner net pozisyonu. |
| PartnerCommission | Muhabir Komisyon Hesabı | Partner komisyon/gelir payları. |
| CustomerPersistent | Kalıcı Müşteri Cüzdanı | Kalıcı bakiye; tekrar eden işlemler. |
| CustomerTransactional | Tek İşlemlik Müşteri Cüzdanı | Geçici/tek seferlik bakiye; tüzelde olamaz. |

## 6.2 `customer_wallet_type` — Müşteri Cüzdan Tipi · Tanımlı

`wallet_type`'ın müşteriye açık alt kümesi.

| Kod | Görünen Ad |
|---|---|
| CustomerPersistent | Kalıcı Müşteri Cüzdanı |
| CustomerTransactional | Tek İşlemlik Müşteri Cüzdanı |

## 6.3 `bank_account_type` — Banka Hesap Tipi · Çıkarım

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| Current | Cari Hesap | Gün içi işlem yapılabilen kullanım hesabı. |
| Protection | Koruma Hesabı | Banka tarafından bloke; gün içi tek işlem. |

## 6.4 `bank_transfer_method` — Banka Transfer Yöntemi · Kısmen Tanımlı

| Kod | Görünen Ad | Kaynak |
|---|---|---|
| EFT | EFT | Tanımlı |
| FAST | FAST | Tanımlı |
| SWIFT | SWIFT | Tanımlı |
| Internal | Banka İçi Havale | Çıkarım |

## 6.5 `payment_status` — Banka İşlem Durumu · Çıkarım

Banka hesap hareketlerinde bankanın bildirdiği işlem durumu.

| Kod | Görünen Ad |
|---|---|
| Pending | Beklemede |
| Completed | Tamamlandı |
| Failed | Başarısız |
| Returned | İade Edildi |

## 6.6 `reconciliation_status` — Mutabakat Durumu · Kısmen Tanımlı

| Kod | Görünen Ad | Açıklama | Kaynak |
|---|---|---|---|
| Matched | Mutabık | Kayıtlar eşleşti. | Çıkarım |
| Unmatched | Mutabık Değil | Fark var; otomatik destek talebi açılır. | Tanımlı |
| PendingReview | İncelemede | İnceleme bekliyor. | Tanımlı |
| Adjusted | Düzeltme Yapıldı | İnceleme sonrası düzeltildi. | Tanımlı |

## 6.7 `settlement_frequency` — Komisyon Mahsuplaşma Sıklığı · Tanımlı

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| Weekly | Haftalık | — |
| Monthly | Aylık | — |
| Threshold | Eşik Bazlı | Parametrik eşik tutarına ulaşıldığında. |

---

# 7. Risk ve Fraud ENUM'ları

## 7.1 `level` — Seviye (Risk / Öncelik / Aciliyet / Kritiklik) · Tanımlı

Risk sınıfı, kural önceliği, talep aciliyet/kritiklik gibi alanlarda ortak kullanılır.

| Kod | Görünen Ad | Risk Skoru Aralığı |
|---|---|---|
| Low | Düşük | 0–30 |
| Medium | Orta | 31–60 |
| High | Yüksek | 61–90 |
| Critical | Kritik | 91–100 |

## 7.2 `fraud_scope` — Kural Kapsamı · Tanımlı

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| Onboarding | Müşteri Kabulü | Yeni müşteri tanımı ve müşteri verisi güncellemelerinde işletilir. |
| Remittance | Para Transferi | Para yatırma/çekme ve tüm transfer işlemlerinden önce işletilir. |

## 7.3 `fraud_rule_status` — Kural Statüsü · Tanımlı

| Kod | Görünen Ad |
|---|---|
| Active | Aktif |
| Passive | Pasif |

## 7.4 `fraud_action` — Kural Aksiyonu · Tanımlı

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| Block | Engelle | İşlem/hesap bloke (Neyi, Süre, Miktar, Channel parametreleri). |
| Allow | İzin Ver | İşleme izin verir; Block ve belirli aksiyonlarla birlikte seçilemez. |
| AddRisk | Risk Puanı Ekle | Belirtilen varlığa risk puanı ekler (Kime, Süre, Risk Puanı). |
| CreateCase | Vaka Aç | İnceleme vakası oluşturur (Severity parametresi). |
| NotifyCustomer | Müşteriyi Bilgilendir | Müşteriye bildirim gönderir. |
| ContactCustomer | Müşteriyle İletişime Geç | Müşteri ile temas kurulmasını gerektirir. |
| ForcePasswordReset | Parola Sıfırlamaya Zorla | — |
| AddExtraVerification | İlave Doğrulama Ekle | — |
| TerminateSessions | Oturumları Sonlandır | — |

> RT (Block kuralları) ve NRT (AddRisk, NotifyCustomer, ContactCustomer) ayrımı için bkz. ortak fraud motoru kuralları.

## 7.5 `fraud_entity` — Fraud Varlığı · Çıkarım

Kurallarda ve AddRisk aksiyonunun "Kime" alanında kullanılır.

| Kod | Görünen Ad |
|---|---|
| Sender | Gönderen |
| Receiver | Alıcı |
| SenderAgent | Gönderen Temsilci |
| ReceiverAgent | Alıcı Temsilci |
| Transaction | İşlem |

## 7.6 `fraud_risk_source` — Risk Skoru Kaynağı · Çıkarım

Risk Skorları ekranında varlık türü.

| Kod | Görünen Ad |
|---|---|
| Customer | Müşteri |
| Agent | Temsilci |
| Transaction | İşlem |

## 7.7 `fraud_verdict` — Dolandırıcılık Hükmü · Tanımlı

(Dolandırıcılık Bildir ekranında `verdict` adıyla da geçer; eşdeğerdir. Varsayılan: `Unknown`.)

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| Unknown | Belirsiz | Varsayılan; henüz karar verilmemiş. |
| NotFraud | Dolandırıcılık Değil | Zarar/kurtarılan tutar 0 olmalıdır. |
| ConfirmedFraud | Doğrulanmış Dolandırıcılık | Dolandırıcılık Tipi zorunludur. |
| PreventedFraud | Önlenmiş Dolandırıcılık | Tespit edilip gerçekleşmeden önlenmiş. |

## 7.8 `fraud_type` — Dolandırıcılık Tipi · Çıkarım

Kaynakta tanımlanmamıştır. Geliştirme öncesi teyit edilmelidir. Öneri değerler:

| Kod | Görünen Ad |
|---|---|
| IdentityTheft | Kimlik Hırsızlığı |
| AccountTakeover | Hesap Ele Geçirme |
| SocialEngineering | Sosyal Mühendislik |
| MoneyMule | Para Aracısı (Mule) |
| PhishingScam | Oltalama Dolandırıcılığı |
| Other | Diğer |

## 7.9 `fraud_detection_source` — Tespit Kaynağı · Çıkarım

Kaynakta tanımlanmamıştır. Öneri değerler:

| Kod | Görünen Ad |
|---|---|
| RuleEngine | Kural Motoru |
| ManualReview | Manuel İnceleme |
| CustomerReport | Müşteri Bildirimi |
| AgentReport | Temsilci Bildirimi |
| ExternalNotification | Harici Bildirim (banka/kolluk vb.) |
| Other | Diğer |

---

# 8. Vaka ve Destek ENUM'ları

## 8.1 `case_status` — Vaka / Talep Statüsü · Tanımlı

Hem fraud/AML vaka inceleme hem Destek Merkezi talepleri için ortak kullanılır.

| Kod | Görünen Ad | Grup |
|---|---|---|
| Unassigned | Atanmamış | Açık |
| Assigned | Atandı | Açık |
| InProgress | İşlemde | Açık |
| WaitingForCustomer | Müşteri Bekleniyor | Açık |
| WaitingForAgent | Temsilci Bekleniyor | Açık |
| WaitingFor3rdParty | 3. Taraf Bekleniyor | Açık |
| Escalated | Yükseltildi | Açık |
| ReOpened | Yeniden Açıldı | Açık |
| Resolved_IssueFixed | Çözüldü – Sorun Giderildi | Kapalı |
| Resolved_STRFiled | Çözüldü – ŞİB Bildirildi | Kapalı |
| Resolved_NoIssue | Çözüldü – Sorun Yok | Kapalı |
| Resolved_ConfirmedFraud | Çözüldü – Dolandırıcılık Doğrulandı | Kapalı |
| Resolved_PreventedFraud | Çözüldü – Dolandırıcılık Önlendi | Kapalı |
| Resolved_InsufficientEvidence | Çözüldü – Yetersiz Kanıt | Kapalı |
| Rejected | Reddedildi | Kapalı |

## 8.2 `case_action` — Vaka / Talep Aksiyonu · Tanımlı

| Kod | Görünen Ad |
|---|---|
| Assignment | Atama |
| Reassignment | Yeniden Atama |
| Escalation | Yükseltme (Eskalasyon) |
| CustomerContacted | Müşteri ile İletişim Kuruldu |
| AgentContacted | Temsilci ile İletişim Kuruldu |
| InformationRequested | Bilgi/Belge Talep Edildi |
| FinalResolutionProvided | Nihai Çözüm Sağlandı |
| CaseClosed | Vaka Kapatıldı |
| ComplaintWithdrawn | Talep Geri Çekildi |
| ComplaintRejected | Talep Reddedildi |
| CaseReopened | Vaka Yeniden Açıldı |

## 8.3 `complaint_type` — Talep Tipi · Çıkarım

Destek Merkezi talepleri ve Dilek/Şikâyet/Öneri ekranı.

| Kod | Görünen Ad |
|---|---|
| Complaint | Şikâyet |
| Request | Talep / İstek |
| Suggestion | Öneri |
| Information | Bilgi Talebi |
| Objection | İtiraz |
| ReconciliationDiscrepancy | Mutabakatsızlık (sistem üretimli) |
| Other | Diğer |

> Değer kümesi kaynakta tam tanımlanmamıştır; teyit edilmelidir.

---

# 9. Doküman ENUM'ları

## 9.1 `document_category` — Doküman Kategorisi · Tanımlı

| Kod | Görünen Ad |
|---|---|
| Identity | Kimlik |
| ProofOfAddress | Adres Kanıtı |
| ProofOfFunds | Fon Kaynağı Kanıtı |
| LegalEntity | Tüzel Kişi |
| ProofOfTransaction | İşlem Kanıtı |
| Agreement | Sözleşme |
| EmployeeHR | Çalışan (İK) |

> Her kategorinin standart doküman türleri için bkz. BackOffice "Doküman Tipleri".

## 9.2 `document_status` — Doküman Statüsü · Tanımlı

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| Inactive | Pasif | Onay bekleyen ilk yükleme; canlı sistemde saklanır. |
| Active | Aktif | Kullanılabilir doküman. |
| Rejected | Reddedildi | Reddedilmiş; arşivde kanıt amaçlı saklanır. |
| Expired | Süresi Doldu | Geçerlilik süresi dolmuş; arşivde saklanır. |
| Archived | Arşivlendi | Arşivde; sistem açısından kullanılabilir. |

---

# 10. Entegrasyon ve Sistem ENUM'ları

## 10.1 `integration_status` — Entegrasyon Kayıt Statüsü · Tanımlı

Tüm dış entegrasyonlar (muhasebe, banka, BTRANS/GİB, KYC, SMS) için ortak yaşam döngüsü.

| Kod | Görünen Ad |
|---|---|
| Pending | Beklemede |
| Preparing | Oluşturuluyor |
| Prepared | Oluşturuldu |
| Sending | Gönderiliyor |
| Sent | Gönderildi |
| Completed | Tamamlandı |
| ErrorPrepare | Hata: Oluşturulamadı |
| ErrorSend | Hata: Gönderilemedi |
| ErrorData | Hata: Veri |
| Retrying | Tekrar Deneniyor |
| OnHold | Durduruldu |
| Canceled | İptal Edildi |

## 10.2 `integration_type` — Entegrasyon Tipi · Çıkarım

| Kod | Görünen Ad |
|---|---|
| Accounting | Muhasebe |
| Banking | Bankacılık |
| Btrans | BTRANS / GİB |
| Kyc | KYC / Sanction Screening |
| Sms | SMS |
| Email | E-posta |
| FxRate | Kur Servisi |
| Other | Diğer |

## 10.3 `auth_type` — Kimlik Doğrulama Tipi · Çıkarım

Entegrasyon bağlantı güvenliğinde kullanılır.

| Kod | Görünen Ad |
|---|---|
| ApiKey | API Anahtarı |
| OAuth2 | OAuth 2.0 |
| MutualTls | Karşılıklı TLS (mTLS) |
| BasicAuth | Temel Kimlik Doğrulama |
| Certificate | Sertifika |

## 10.4 `retry_policy` — Yeniden Deneme Politikası · Tanımlı

| Kod | Görünen Ad | Açıklama |
|---|---|---|
| FixedDelay | Sabit Gecikme | Sabit (parametrik) gecikme ile tekrar. |
| ExponentialBackoff | Üstel Geri Çekilme | 1, 2, 4, 8, 16… sn artan gecikme. |

## 10.5 `log_level` — Log Seviyesi · Çıkarım

| Kod | Görünen Ad |
|---|---|
| Debug | Hata Ayıklama |
| Info | Bilgi |
| Warning | Uyarı |
| Error | Hata |

## 10.6 `request_outcome` — İstek Sonucu · Çıkarım

Entegrasyon log/izleme kayıtlarında.

| Kod | Görünen Ad |
|---|---|
| Success | Başarılı |
| Failure | Başarısız |
| Timeout | Zaman Aşımı |

## 10.7 `notification_type` — Bildirim Türü · Tanımlı

| Kod | Görünen Ad |
|---|---|
| SMS | SMS |
| Email | E-posta |
| Push | Push Bildirimi |

## 10.8 `notification_status` — Bildirim Durumu · Çıkarım

| Kod | Görünen Ad |
|---|---|
| Pending | Beklemede |
| Sent | Gönderildi |
| Delivered | İletildi |
| Failed | Başarısız |

## 10.9 `job_status` — Zamanlanmış İş Çalışma Durumu · Çıkarım

| Kod | Görünen Ad |
|---|---|
| Running | Çalışıyor |
| Success | Başarılı |
| Failed | Başarısız |
| Retrying | Tekrar Deneniyor |

---

# 11. İnsan Kaynakları ENUM'ları

## 11.1 `leave_type` — İzin / Rapor Türü · Çıkarım

| Kod | Görünen Ad |
|---|---|
| AnnualLeave | Yıllık İzin |
| SickLeave | Sağlık Raporu |
| UnpaidLeave | Ücretsiz İzin |
| ExcuseLeave | Mazeret İzni |
| MaternityLeave | Doğum İzni |
| Other | Diğer |

## 11.2 `task_status` — İzin / Rapor Onay Durumu · Çıkarım

| Kod | Görünen Ad |
|---|---|
| Pending | Onay Bekliyor |
| Approved | Onaylandı |
| Rejected | Reddedildi |
| Canceled | İptal Edildi |

---

# 12. Açık Konular ve Öneriler

Aşağıdaki ENUM'lar kaynak analizde **tam tanımlanmamıştır**; geliştirme öncesi iş birimi ve mevzuat ile teyit edilmelidir:

- `transaction_type` — Muhasebe entegrasyonu, raporlama ve BTRANS bu kümeye doğrudan bağımlıdır; **öncelikli netleştirilmelidir**.
- `payment_purpose` — MASAK ödeme amacı sınıflandırmasıyla uyumlu olmalıdır.
- `employment_occupation` — Standart meslek kodları (örn. ISCO) ile oluşturulmalı, `OccupationTransactionThresholds` ile eşlenmelidir.
- `fraud_type`, `fraud_detection_source` — Uyum birimi ile kesinleştirilmelidir.
- `ownership_type`, `visa_type`, `complaint_type`, `correction_reason` — Değer kümeleri teyit edilmelidir.
- `status` (genel) ile iletişim satırı doğrulama durumu aynı isimle anılmaktadır; iletişim satırları için ayrı bir `contact_verification_status` ENUM'u tanımlanması önerilir.
- `currency` — Desteklenen para birimi kümesi ve para birimi bazlı minor unit (ondalık) kuralları tanımlanmalıdır.
- `identity_document_extended` — Tüzel kişi kimlik tanımlarını kapsayacak şekilde netleştirilmelidir.

> Bu sözlük üç uygulamanın ortak referansıdır. ENUM değerlerinde yapılacak her değişiklik, ilgili menü dökümanları ve veri modeli ile birlikte güncellenmelidir.

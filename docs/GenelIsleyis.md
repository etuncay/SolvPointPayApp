GENEL İŞLEYİŞ

&nbsp;

> **ENUM referansı:** Sabit değer kümeleri (kod, görünen ad, kaynak durumu) için ortak sözlük: [`Veri-Sozlugu-ENUM.md`](Veri-Sozlugu-ENUM.md). BackOffice menü dökümanları ve `0.genel-standartlar.md` dosyaları bu sözlüğe atıf yapar.

&nbsp;

1. # Ekranlarla İlgili Genel Hususlar

- Listeleme ekranlarında tablonun sol üstünde arama yapılacak alanlar, sağ üstünde Ekle ve Excel butonu olur. Excel export mevcut filtreye göre gerçekleşir. Pagination olur.

- En sol kolon Actions kolonu olur. Bu kolonun her bir satırında view (göz), update (kalem) ve delete (inactive satırlarda tick, active satırlarda X) butonlarını bulunur. Değiştirilemez işlemlerde, Actions kolonunda sadece view butonu bulunur, update ve delete butonları bulunmaz.

- Tabloların her bir kolonu için aksi belirtilmezse (açıklama, yorum, tutar, adet gibi kolonlar dışındakilerin tümü için) sağ üstte birer arama alanı olur. Bu alan textbox veya combobox olabilir. Tarih için arama yapılacaksa başlangıç ve bitiş tarihleri alınır.

- Insert, update ve view ekranları birbirinin aynısı olmalıdır. View’da tüm alanlar dolu ve değiştirilemez gelir, update de dolu ve değiştirilebilir gelir, insert de tüm alanlar boş ve değiştirilebilir gelir. Asgari olarak tablodaki kolonlar gelir. Eğer tablodakine ilave ek bir bilgi yoksa view butonu gösterilmez.

- Kişinin yetkisi olmayan butonlar aksiyonlarda gelmez.

- Kayıt ilk kez eklenirken; created_at = now, created_by = user, updated_at = null, updated_by = null, record_status = 1 olarak doldurulur. Kayıtlarda değişiklik veya silme gerektiğinde soft update veya soft delete kullanılır. Yani, aktif kayıt pasifleştirilir (record_status = 0) ve updated_at = now, updated_by = user olarak güncellenir ve yeni kayıt insert edilir. record_status, status’den farklıdır. Ekrandan listelenme esnasında record_status = 0 olan bilgiler listelenmez.

- Kullanıcı, 1. Onaycı ve 2. Onaycı farklı kişiler olmalıdır. Aynı kişi olması sistemsel olarak engellenmelidir.

- Parola sıfırlama: Parolasını unutan müşteri arayüzden Parolamı Unuttum butonunu tıkladığında e-posta adresini doğru girerse e-posta adresine 2 saat geçerli olan geçici parola sıfırlama linki iletilir. E-posta adresi doğru girilse de yanlış girilse de aynı sonuç döner: "E-posta adresi sistemde kayıtlıysa link gönderildi.". Ayrıca tek kullanımlık token + rate limit zorunludur.

- Multi Language Dil Desteği (Türkçe, İngilizce ve Arapça)

- 2FA ile login olunur. Müşteri No veya Kimlik No, Parola ve OTP kullanılır. Tüzel kişiler ve Temsilciler adına girişlerde **ilave olarak** VKN veya Tüzel Müşteri No / Temsilci No girişi yapılır.

- Bütün girdilerin başında ve sonunda boşluk varsa kırpılmalıdır.

- Günlük hesaplanan değerlerde metrikler İstanbul saat dilimindeki takvim gününü baz alarak hesaplanır.

- Notlar alanlarına girilen metinde regex pattern kontrolü uygulanır. Bu alanlara TCKN ve Kart numarası girilmediği kontrol edilir. Serbest not alanı KVKK açısından riskli bir veri sızıntı kanalıdır.

- Müşteri tanımlama, para gönderme veya para çekme esnasında verilen e-posta veya telefon başka müşteride de kullanılıyor olamaz. Bu bilgiler şahsa özgü olmalıdır.

&nbsp;

1. # Müşteri / Temsilci Kabulü

2. ## Yasal Mevzuat

İşlem yapacak kişilerden kimlik ve adres bilgilerinin alınması ve yaptırım liste kontrolü zorunludur. Para gönderimi, para çekme ve para yatırma işlemlerinin tümünde bu gerçekleştirilmelidir. Eksik bilgisi olan müşterinin işlem yapmasına müsaade edilmemelidir. Yaptırım listesindeki kullanıcılar için de manüel inceleme yapılmadan işleme izin verilmemelidir.

Yasal olarak para transferinde (başka bir tarafın dahil olmadığı) 185.000 TL üzerinde ve elektronik transfer (başka bir tarafın dahil olduğu – yurt dışı partner gibi) 15.000 TL üzerinde kimlik teyidi zorunludur, adres teyidi değildir. Elektronik transfer limiti düşük olduğu için uygulamada tüm işlemlerde kimlik teyidi yapılmaktadır.

Sürekli iş ilişkisi halinde ise adres teyidi de zorunludur. Adres paylaşım sistemi ödeme kuruluşlarının kullanımına açık değildir, bu sebeple adres teyidi manüel gerçekleştirilmektedir.

Uygulamada gerçek kişiler için KYC seviyesi aşağıdaki şekilde değerlendirilir:

**kyc**\*\*\_level\*\* **\= 0:** KYC süreci başlatılmamıştır veya doğrulama tamamlanmamıştır.

**kyc**\*\*\_level\*\* **\= 1:** Kimlik ve adres bilgisi alınmış ve kimlik doğrulaması (belge doğrulaması+KPS) tamamlanmıştır. Kişi herhangi bir yaptırım listesinde yer almamaktadır. Müşteri kısıtlı işlem yapabilir.

**kyc**\*\*\_level\*\* **\= 2:** Kimlik doğrulamasına ek olarak adres doğrulama belgesi (fatura, ikametgâh belgesi, kira sözleşmesi vb.) alınmış ve doğrulanmıştır. Müşteri işlem yapabilir.

**kyc**\*\*\_level\*\* **\= 3:** Level 2’ye ek olarak fonların kaynağı bilgileri ve belgeleri alınmış ve doğrulanmıştır. Müşteri işlem yapabilir.

1. ## Bireysel Müşteri KYC Süreci

Bireysel müşteri bilgileri sisteme kaydedildiğinde, müşteri kaydı Inactive statüsünde oluşturulur ve müşteri herhangi bir işlem yapamaz. Kimlik doğrulama süreci başlatıldığında sistem, KPS üzerinden (Türk müşteriler için) kimlik doğrulamasını gerçekleştirir ve müşteri bilgileri yaptırım listeleri ile eşleştirilir (sanction screening). Bu aşamada KYC süreci henüz başlatılmamışsa KYC Status alanı null değerindedir.

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| Durum (Müşteri / Temsilci) | KYC Level | KYC Status | Status | Açıklama |
| Sisteme girildi | 0   | NULL | Inactive | İşlem yapamaz. |
| Kimlik doğrulandı, Yaptırım Listesinde Yok | 1   | Approved | Active | Kısıtlı işlem yapabilir. |
| Yaptırım Listesi Eşleşmesi | 0   | Pending | Blocked – KycInProgress | Manuel inceleme başlatılır. |
| Kimlik bilgileri eşleşmedi | 0   | Pending | Blocked – Incomplete or Incorrect Information | Eksik bilgiler tamamlanmalı. |

&nbsp;

Yaptırım listesi eşleşmesi, kimlik doğrulama hatası veya sistem tarafından tespit edilen riskler nedeniyle manuel inceleme başlatılması durumunda, bireysel müşteri Blocked statüsüne alınır ve KYC Status değeri Pending olarak güncellenir. Bu süreçte müşteri işlem yapamaz.

Uyum görevlisi, müşteri tarafından sağlanan mevcut bilgi ve belgeleri inceler. İnceleme sırasında müşteriden ilave bilgi veya belge talep edilebilir. Manuel inceleme tamamlandığında aşağıdaki sonuçlardan biri uygulanır.

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| Durum | KYC Level | KYC Status | Status | Açıklama |
| Manuel inceleme sonrası adres ve kimlik doğrulandı | 2   | Approved | Active | Müşteri işlem yapabilir. |
| Manuel inceleme sonrası kimlik doğrulandı | 1   | Approved | Active | Müşteri kısıtlı işlem yapabilir. |
| Adres veya kimlik doğrulanmadı | 0   | Rejected | Closed – RejectedDueToKyc | Müşteri işlem yapamaz. |
| Belgeler eksik | Mevcut seviye korunur | Pending | Blocked – Missing Documents | Belgeler eklenmeli. |
| Bilgiler eksik veya hatalı | Mevcut seviye korunur | Pending | Blocked – Incomplete or Incorrect Information | Bilgi talep edilmeli. |

&nbsp;

Bireysel müşterilerin işlem yetkileri ve limitleri, KYC seviyelerine göre belirlenir. Limitler parametrik olarak yönetilir ve kurum içi risk politikalarına ve yasal mevzuata dayanır.

|     |     |     |
| --- | --- | --- |
| KYC Level | Status | İşlem Limiti |
| Level 3 | Active | 3.000.000 TL kadar işlem yapılabilir. Daha yüksek tutarlar genel müdürlükten gerçekleştirilebilir. Yasal bir kısıt değildir. |
| Level 2 | Active | 1.000.000 TL işlem yapabilir. Daha yüksek işlemler genel müdürlükten gerçekleştirilebilir. Yasal bir kısıt değildir. |
| Level 1 | Active | YASAL: Aylık 185.000 TL limiti sınırlarında temsilciden para transferi gerçekleştirebilir. |
| Level 1 | Active | YASAL: Bankadan para yatıramaz. Temsilciden kendi cüzdanına para yatıramaz. |
| Level 1 | Active | YASAL: Cüzdanda bakiye bırakılamaz, gelen paranın tümünü çekme zorunluluğu var. |

&nbsp;

Sistem, müşterinin ve temsilcinin işlemlerini otomatik olarak izler. Dolandırıcılık ve işlem izleme kapsamında, kurala göre vaka açılıp müşteri incelemeye alınabilir.

|     |     |     |
| --- | --- | --- |
| Durum (Müşteri / Temsilci) | Status | Açıklama |
| Fraud vaka açtı | Blocked – Suspicious Transaction Detected | İşlem manuel incelenmeli. |
| Kişi kara para aklama şüphesiyle soruşturmaya alındı | Blocked – Under Investigation | Kişi geçici olarak işlem yapamaz. |
| Manuel inceleme sonucu kişi temiz | Active | İşlemler devam eder. |
| Manuel inceleme sonucu kişi engellendi | Closed – RejectedDueToKyc | Kişi işlem yapamaz. |

&nbsp;

KYC Level’i 2 ve 3 olan bireysel müşteriler, periyodik olarak (örneğin ayda bir kez) yaptırım listeleri ile yeniden taranır. Yapılan tarama sonucunda riskli veya eşleşmeli bir durum tespit edilmesi halinde müşteri Blocked – UnderInvestigation statüsüne alınır ve manuel inceleme süreci başlatılır. KYC Level’i 1 olan bireysel müşteriler için ise yaptırım taraması her işlem öncesinde gerçekleştirilir.

1. ## İşlem Türlerine Göre Bireysel Müşteri KYC Gereksinimleri

**Full Bilgi Seti:** Kimlik No, Uyruğu, Doğum Tarihi, Evlenmeden Önceki Soyadı, Vergi Ülkesi, Eğitimi, Mesleği, Meslek Kategorisi, Çalıştığı Kurum, Adres, Telefon, E-Posta

**Alıcı Bilgileri:** Alıcının Adı ve Soyadı / Unvanı, Telefon Numarası, Ülkesi (Banka transferlerinde IBAN zorunludur).

**Level 1:** Kimlik doğrulaması tamamlanmış temel seviye. Temsilci üzerinden düşük tutarlı / tek seferlik para gönderme veya çekme yapılabilir; bakiye tutulamaz ve yetkiler kısıtlıdır.

**Level 2:** Kimlik + adres doğrulaması tamamlanmış müşteri seviyesi. Sürekli müşteri ilişkisi kurulabilir; mobil/web kanalları ve temsilci üzerinden genişletilmiş işlem yetkileri vardır, bakiye tutulabilir.

**Level 3:** Level 2’ye ek olarak fon kaynağı doğrulanmıştır. Yüksek tutarlı, daha sık/hacimli veya risk göstergesi artan işlemler için uygulanır; limitler ve yetkiler en geniş seviyededir.

**Kişinin** **İlk Kez Temsilciden** **Düşük Tutarlı** **Para Göndermesi**

Gerekli Bilgiler: Full Bilgi Seti + Kimlik Belgesi + Alıcı Bilgileri.

KYC Durumu: Level 1 seviyesine yükselir.

**Daha Önce Çalışılmış Kişinin Temsilciden** **Düşük Tutarlı** **Para Göndermesi**

Gerekli Bilgiler: Kimlik Numarası + Kimlik Belgesi + Alıcı Bilgileri.

KYC Durumu: KYC seviyesi değişmez, asgari Level 1 olmalıdır.

Not: Kişiden Full Bilgi Seti istenmez.

**Kişinin** **İlk Kez Temsilciden** **Düşük Tutarlı** **Para Çekmesi**

Gerekli Bilgiler: Full Bilgi Seti + Kimlik Belgesi.

KYC Durumu: Level 1 seviyesine yükselir.

Not: Tüm para çekilmelidir, cüzdanda bakiye bırakılamaz.

**Daha Önce Çalışılmış Kişinin Temsilciden** **Düşük Tutarlı** **Para Çekmesi**

Gerekli Bilgiler: Kimlik Numarası + Kimlik Belgesi.

KYC Durumu: KYC seviyesi değişmez, asgari Level 1 olmalıdır.

Not: Level 1 ise tüm para çekilmelidir.

**Müşterinin Temsilciden Para Yatırması**

Gerekli Bilgiler: Kimlik Numarası + Kimlik Belgesi.

KYC Durumu: KYC seviyesi değişmez, asgari Level 2 olmalıdır.

**Müşterinin Temsilciden Para Çekmesi**

Gerekli Bilgiler: Kimlik Numarası + Kimlik Belgesi.

KYC Durumu: KYC seviyesi değişmez, asgari Level 2 olmalıdır.

**Bireysel Müşterilerin** **Level 3’e Geçiş Koşulları**

Gerekli Bilgiler: Level 2 kapsamındaki tüm belgeler, Fon Kaynağı Beyanı, Fon Kaynağını Destekleyici Belgeler (maaş bordrosu, iş sözleşmesi, kira geliri belgesi, satış sözleşmesi, banka hesap dökümü vb.)

Not: Yüksek tutarlı işlemler, artan işlem hacmi veya sıklığı, risk skoru yükselen müşterilerde müşteriden fon kaynağı bilgileri talep edilerek Level 3 KYC uygulanır.

1. ## Bireysel Müşteri Edinim Kontrolleri

|     |     |     |     |
| --- | --- | --- | --- |
| Senaryo | İşlem Öncesi Durum | Kontroller ve Sonuç | İşlem Sonrası Durum |
| Yeni kişi kaydı açıldı (henüz KYC başlamadı) | Kayıt yok | Zorunlu alan format kontrolü | kyc_level=0, kyc_status=null, entity_status=Inactive |
| Yeni kişi düşük tutarlı para gönderme dener; kimlik doğrulama başarılı, yaptırım eşleşmesi yok | kyc_level=0, kyc_status=null, entity_status = Inactive | KPS, sanction screening, işlem onaylanır | kyc_level=1, kyc_status=Approved, entity_status=Active |
| Yeni kişi düşük tutarlı para gönderme dener; KPS kimlik doğrulama başarısız | kyc_level=0, kyc_status=null, entity_status = Inactive | KPS, sanction screening, işlem reddedilir | kyc_level=0, kyc_status=null, entity_status=Blocked, entity_blockage_reason=IncompleteOrIncorrectInformation |
| Yeni kişi düşük tutarlı para gönderme dener; yaptırım listesi eşleşmesi | kyc_level=0, kyc_status=null, entity_status = Inactive | KPS (Türkler için), sanction screening MATCH, işlem uyum onayına düşer | kyc_level=0, kyc_status=Pending, entity_status=Blocked, entity_blockage_reason= KycInProgress |
| Daha önce işlem yapılmış kişi düşük tutarlı para gönderir; kimlik doğrulama OK | kyc_level>=1, kyc_status=Approved, entity_status=Active | Alıcı min alanları, limit/policy/fraud kuralları, işlem yapılır. | Statü değişmez. |
| Kişi ilk kez düşük tutarlı para çeker; KPS OK, sanction temiz | kyc_level=0, kyc_status=null, entity_status=Inactive | KPS, sanction screening, işlem yapılır. Level1 kuralı: tüm tutar çekilir, bakiye kalmaz. | kyc_level=1, kyc_status=Approved, entity_status=Active |
| Kişi tekrar düşük tutarlı para çeker (Level1) | kyc_level=1, kyc_status=Approved, entity_status=Active | Limit/policy/fraud kuralları, işlem yapılır. Level1 kuralı: tüm tutar çekilir, bakiye kalmaz. | Statü değişmez. |
| Manuel inceleme başlatıldı | kyc_status=Pending | Uyum incelemesi, işlem yapılamaz. | entity_status=Blocked entity_blockage_reason= KycInProgress |
| Manuel inceleme sonucu doğrulandı | kyc_status=Pending | Doğrulama tamam. | kyc_level=1, kyc_status=Approved, entity_status=Active |
| Manuel inceleme: belge eksik | kyc_status=Pending | Checklist kontrol (kimlik/PoA vb.) | kyc_status=Pending, entity_status=Blocked, entity_blockage_reason=MissingDocuments |
| Manuel inceleme: bilgi eksik/hatalı | kyc_status=Pending | Veri doğrulama FAIL (adres/kimlik alan uyumsuz vb.) | kyc_status=Pending, entity_status=Blocked, entity_blockage_reason=IncompleteOrIncorrectInformation |
| Manuel inceleme sonucu reddedildi | kyc_status=Pending | Uyum kararı olumsuz | kyc_status=Rejected, entity_status=Closed, entity_closure_reason=RejectedDueToKyc |
| Level2 müşteri temsilciden kendi cüzdanına para yatırır | kyc_level>=2, kyc_status=Approved, entity_status=Active | Limit/policy/fraud kuralları, işlem yapılır. | Statü değişmez. |
| Level1 kişi/müşteri kendi cüzdanına para yatırmayı dener (yasak) | kyc_level=1, kyc_status=Approved, entity_status=Active | Min kyc_level=2, işlem reddedilir. | Statü değişmez. |
| Level2 müşteri para çeker (temsilci/web/mobil) | kyc_level>=2, kyc_status=Approved, entity_status=Active | Limit/policy/fraud kuralları, işlem yapılır. | Statü değişmez. |
| Yüksek tutarlı işlem denemesi; sistem PoF ister (Level3 tetik) | kyc_level=2, kyc_status=Approved, entity_status=Active | Politika tetik (tutar/sıklık/risk) → PoF zorunlu, işlem beklemeye alınır. | kyc_level=2, kyc_status=Pending, entity_status=Blocked, entity_blockage_reason= KycInProgress |
| PoF belgeleri yüklendi, doğrulandı (Level3 onay) | kyc_level=2, kyc_status=Pending, entity_status=Blocked | PoF belge kontrol + uyum onayı | kyc_level=3, kyc_status=Approved, entity_status=Active |
| PoF belgeleri yüklendi; incelemede ikna edici bulunmadı, Level 3 reddedildi | kyc_level=2, approval_status=Pending, entity_status=Blocked | PoF belge doğrulama, kaynak–tutar uyumu, sahtecilik kontrolleri, uyum kararı | kyc_level=2, kyc_status=Rejected, entity_status=Closed, entity_closure_reason=RejectedDueToKyc |
| Fraud vaka açtı | kyc_status=Approved, entity_status=Active | Monitoring/Fraud alarm | entity_status=Blocked, entity_blockage_reason=SuspiciousTransactionDetected |
| İnceleme: kişi temiz | entity_status=Blocked | Manuel inceleme sonucu “temiz” | entity_status=Active |
| İnceleme: kişi olumsuz | entity_status=Blocked | Manuel inceleme olumsuz | entity_status=Closed, entity_closure_reason=RejectedDueToKyc *(veya* *Fraud* *– manüel inceleme gerekçesine göre*\*)\* |
| Periyodik sanction taraması eşleşme buldu | kyc_level>=2, entity_status=Active | Batch sanction screening MATCH | entity_status=Blocked, entity_blockage_reason=UnderInvestigation, kyc_status=Pending |

&nbsp;

1. ## Tüzel Müşteri KYC (KYB) Süreci

Tüzel müşteri bilgileri sisteme kaydedildiğinde, tüzel müşteri kaydı Inactive statüsünde oluşturulur ve tüzel müşteri adına işlem yapılamaz. Tüzel müşteri oluşturma ve KYC/KYB sürecini başlatma işlemleri yalnızca Genel Müdürlük tarafından gerçekleştirilir. Süreç başlatıldığında tüzel müşteri; ticaret sicil/MERSİS/VKN doğrulamaları, belge kontrolleri ve yaptırım listeleri ile eşleştirme (sanction screening) kontrollerine tabi tutulur. Bu aşamada KYC/KYB süreci henüz başlatılmamışsa kyc_status alanı null değerindedir.

Not: kyc_level alanı tüzel müşteri için kullanılmaz (yalnızca bireysel müşterilerde kullanılır). Tüzel müşteri yeterlilik kararı kyc_status ve entity_status üzerinden yürütülür.

|     |     |     |     |
| --- | --- | --- | --- |
| Durum | KYC status | Status | Açıklama |
| Sisteme girildi (GM tarafından kayıt açıldı) | NULL | Inactive | Tüzel müşteri adına işlem yapılamaz. |
| KYC/KYB süreci başlatıldı (belge/bilgi toplama ve doğrulama) | Pending | Inactive | Süreç tamamlanana kadar işlem yapılamaz. |
| Tüzel doğrulamaları tamamlandı, yaptırım eşleşmesi yok | Approved | Active | Tüzel müşteri adına işlem yapılabilir. |
| Yaptırım listesi eşleşmesi / riskli eşleşme | Pending | Blocked – KycInProgress | Manuel inceleme başlatılır. |
| Temel bilgiler hatalı/eksik (ör. VKN/MERSİS uyuşmazlığı) | Pending | Blocked – Incomplete Or Incorrect Information | Bilgi düzeltme talep edilir. |

&nbsp;

Yaptırım listesi eşleşmesi, belge tutarsızlığı, ortaklık yapısının belirsizliği veya sistem tarafından tespit edilen riskler nedeniyle manuel inceleme başlatılması durumunda, tüzel müşteri Blocked statüsüne alınır ve kyc_status değeri Pending olarak güncellenir. Bu süreçte tüzel müşteri adına işlem yapılamaz.

Uyum görevlisi; tüzel müşteri belgelerini, ortaklık/UBO beyanını, yetki belgelerini, iş ilişkisinin amacını ve varsa risk göstergelerini inceler. İnceleme sırasında ilave bilgi veya belge talep edilebilir. Manuel inceleme tamamlandığında aşağıdaki sonuçlardan biri uygulanır.

|     |     |     |     |
| --- | --- | --- | --- |
| Durum | KYC Status | Status | Açıklama |
| İnceleme sonrası tüm belgeler yeterli, eşleşme temiz | Approved | Active | Tüzel müşteri adına işlem yapılabilir. |
| Belgeler eksik | Pending | Blocked – Missing Documents | Belgeler tamamlanmalıdır. |
| Bilgiler eksik veya hatalı | Pending | Blocked – Incomplete Or Incorrect Information | Bilgi düzeltme/teyit gerekir. |
| İnceleme sonucu olumsuz (uyum reddi) | Rejected | Closed – Rejected Due To Kyc | Tüzel müşteri adına işlem yapılamaz. |

&nbsp;

Tüzel müşteri adına işlem yapılabilmesi için, şu koşulların birlikte sağlanması zorunludur: tüzel müşteri kyc_status = Approved ve entity_status = Active; işlemi yapan kişi için (Yetkili Kişi) kyc_level >= 2. Bu koşullardan herhangi biri sağlanmıyorsa, işlem reddedilir.

Sistem, tüzel müşteri işlemlerini otomatik izler. Dolandırıcılık ve işlem izleme kapsamında, kurala göre vaka açılıp müşteri incelemeye alınabilir.

|     |     |     |
| --- | --- | --- |
| Durum  <br><br/>   <br><br/> | Status | Açıklama |
| Fraud vaka açtı | Blocked – Suspicious Transaction Detected | İşlem/ilişki manuel incelenir. |
| Kara para aklama şüphesiyle inceleme başlatıldı | Blocked – Under Investigation | Tüzel müşteri adına geçici olarak işlem yapılamaz. |
| Manuel inceleme sonucu temiz | Active | İşlemler devam eder. |
| Manuel inceleme sonucu olumsuz | Closed – Rejected Due To Kyc | Tüzel müşteri adına işlem yapılamaz. |

&nbsp;

Tüzel müşteriler ile bunlara bağlı UBO/ortaklar ve yetkili kişiler, kurum politikası kapsamında periyodik olarak (örneğin ayda bir) yaptırım listeleri ile yeniden taranır. Tarama sonucunda tüzel müşteri veya UBO/ortaklar için riskli ya da eşleşmeli bir durum tespit edilmesi halinde ilgili tüzel müşteri Blocked – UnderInvestigation statüsüne alınır ve manuel inceleme süreci başlatılır. Yetkili kişilerde riskli eşleşme tespit edilmesi halinde ilgili kişinin yetkileri askıya alınır; tüzel müşteri adına o kişi üzerinden işlem yapılması engellenir ve gerekli görülmesi halinde tüzel müşteri işlemleri geçici olarak durdurulur.

1. ## Tüzel Kişiler – Zorunlu Belgeler

Tüzel müşteri veya temsilci kaydı oluşturulurken, müşterinin Hukuki Statü alanına göre aşağıda belirtilen asgari zorunlu belgeler yüklenmiş ve sistemde en az "onay gerektirmiyor" (approval_required=false) veya "Onaylandı" (approval_status=Approved) statüsünde bulunmalıdır. Bu asgari belge setinden herhangi biri eksik ise tüzel kişi onboard edilmez, Kaydet işlemi bloklanır ve kullanıcıya eksik belge(ler) açıkça bildirilir.

|     |     |
| --- | --- |
| Tüzel Kişi | Gerekli Belgeler |
| AnonimCompany (Anonim Şirket) | TradeRegistryGazette, TaxCertificate, ArticlesOfAssociation, SignatureCircular, CorporateAddressProof, UltimateBeneficialOwnerDeclaration, SanctionsComplianceForm, (ChamberOfCommerceCertificate veya CompanyRegistrationCertificate), (BoardResolution veya AuthorizedRepresentativeProof) |
| LimitedCompany (Limited Şirket) | TradeRegistryGazette, TaxCertificate, ArticlesOfAssociation, SignatureCircular, CorporateAddressProof, UltimateBeneficialOwnerDeclaration, SanctionsComplianceForm, (ChamberOfCommerceCertificate veya CompanyRegistrationCertificate), (BoardResolution veya AuthorizedRepresentativeProof) |
| LimitedPartnership (Komandit Şirket) | TradeRegistryGazette, TaxCertificate, ArticlesOfAssociation, SignatureCircular, CorporateAddressProof, UltimateBeneficialOwnerDeclaration, SanctionsComplianceForm, (ChamberOfCommerceCertificate veya CompanyRegistrationCertificate), (BoardResolution veya AuthorizedRepresentativeProof) |
| CollectiveCompany (Kollektif Şirket) | TradeRegistryGazette, TaxCertificate, ArticlesOfAssociation, SignatureCircular, CorporateAddressProof, UltimateBeneficialOwnerDeclaration, SanctionsComplianceForm, (ChamberOfCommerceCertificate veya CompanyRegistrationCertificate), (BoardResolution veya AuthorizedRepresentativeProof) |
| SoleProprietorship (Şahıs Şirketi) | TaxCertificate, CorporateAddressProof, UltimateBeneficialOwnerDeclaration, SanctionsComplianceForm, (ChamberOfCommerceCertificate veya CompanyRegistrationCertificate), (AuthorizedRepresentativeProof veya SignatureCircular) |
| Cooperative (Kooperatif) | TradeRegistryGazette, TaxCertificate, ArticlesOfAssociation, SignatureCircular, CorporateAddressProof, UltimateBeneficialOwnerDeclaration, SanctionsComplianceForm, (ChamberOfCommerceCertificate veya CompanyRegistrationCertificate), (BoardResolution veya AuthorizedRepresentativeProof) |
| CapitalCompany (Sermaye Şirketi) | TradeRegistryGazette, TaxCertificate, ArticlesOfAssociation, SignatureCircular, CorporateAddressProof, UltimateBeneficialOwnerDeclaration, SanctionsComplianceForm, (ChamberOfCommerceCertificate veya CompanyRegistrationCertificate), (BoardResolution veya AuthorizedRepresentativeProof) |
| EconomicPublicInstitution (İktisadi Kamu Kuruluşu) | CompanyRegistrationCertificate, TaxCertificate, CorporateAddressProof, SanctionsComplianceForm, UltimateBeneficialOwnerDeclaration, (BoardResolution veya AuthorizedRepresentativeProof), (SignatureCircular veya AuthorizedRepresentativeProof) |
| OrdinaryPartnership (Adi Ortaklık) | TaxCertificate, ArticlesOfAssociation, CorporateAddressProof, UltimateBeneficialOwnerDeclaration, SanctionsComplianceForm, AuthorizedRepresentativeProof |
| ApartmentSiteManagement (Apartman / Site Yönetimi) | TaxCertificate, CorporateAddressProof, SanctionsComplianceForm, UltimateBeneficialOwnerDeclaration, (ArticlesOfAssociation veya BoardResolution), AuthorizedRepresentativeProof |
| Association (Dernek) | CompanyRegistrationCertificate, TaxCertificate, ArticlesOfAssociation, CorporateAddressProof, SanctionsComplianceForm, UltimateBeneficialOwnerDeclaration, (SignatureCircular veya AuthorizedRepresentativeProof), (BoardResolution veya AuthorizedRepresentativeProof) |
| Foundation (Vakıf) | CompanyRegistrationCertificate, TaxCertificate, ArticlesOfAssociation, CorporateAddressProof, SanctionsComplianceForm, UltimateBeneficialOwnerDeclaration, (SignatureCircular veya AuthorizedRepresentativeProof), (BoardResolution veya AuthorizedRepresentativeProof) |
| PoliticalParty (Siyasi Parti) | CompanyRegistrationCertificate, TaxCertificate, ArticlesOfAssociation, CorporateAddressProof, SanctionsComplianceForm, UltimateBeneficialOwnerDeclaration, (SignatureCircular veya AuthorizedRepresentativeProof), (BoardResolution veya AuthorizedRepresentativeProof) |
| UnionConfederation (Sendika / Konfederasyon) | CompanyRegistrationCertificate, TaxCertificate, ArticlesOfAssociation, CorporateAddressProof, SanctionsComplianceForm, UltimateBeneficialOwnerDeclaration, (SignatureCircular veya AuthorizedRepresentativeProof), (BoardResolution veya AuthorizedRepresentativeProof) |
| ForeignLegalEntity (Yurt Dışında Yerleşik Tüzel Kişi) | Onboard edilmez (kapsam dışı) |
| NonLegalEntityOrganization (Tüzel Kişiliği Olmayan Teşekkül) | TaxCertificate, ArticlesOfAssociation, CorporateAddressProof, SanctionsComplianceForm, UltimateBeneficialOwnerDeclaration, AuthorizedRepresentativeProof |
| PublicInstitution (Kamu Kurumu) | CompanyRegistrationCertificate, TaxCertificate, CorporateAddressProof, SanctionsComplianceForm, UltimateBeneficialOwnerDeclaration, (BoardResolution veya AuthorizedRepresentativeProof), (SignatureCircular veya AuthorizedRepresentativeProof) |

&nbsp;

1. ## ID & Types

- Individual (Bireysel), Corporate (Tüzel), Prospective (Aday Müşteri), Agent (Temsilci), AgentAuthorized (Yetkili Kişi)

- Bireysel müşteri kabulü yalnızca temsilci üzerinden yapılır. Tüzel müşteri kabulü ve temsilci kabulü yalnızca genel müdürlük (backoffice) üzerinden yürütülür.

- Aday/Prospect (Yetkili Kişi): Tüzel müşteri adına işlem yapabilecek yetkili kişi olmakla birlikte, müşteri ilişkisine girmek istemeyen/müşteri olmayı talep etmeyen kişilerdir. Bu kişiler için kimlik ve uyum kontrolleri (ör. sanction/PEP) yürütülür; ancak müşteri gibi işlem yapamaz, müşteri ürün yetkileri/limitleri açılmaz.

- Recipient-Only / Geçici Alıcı Kaydı: Gönderen para gönderirken alıcı sistemde kayıtlı değilse, alıcı için geçici kayıt oluşturulur. Bu kayıt, alıcı adına müşteri hesap/cüzdan yetkileri açmaz; yalnızca işlemin alıcısını ilişkilendirmek ve fonu güvenli şekilde bekletmek amacıyla kullanılır. Alıcı para çekmeye geldiğinde veya müşteri kabul süreci tamamlandığında alıcı tam müşteri haline getirilir.

- Gerçek kişi bilgileri bir tabloda tutulur, kimlik numarası (TCKN / yabancı kimlik / pasaport) tekil bir kişi kaydına bağlanır (unique). Bireysel müşteri, aday müşteri, temsilci yetkilisi veya çalışanların kişi bilgileri aynı tabloda tutulur ve kişi kaydıyla person_id (GUID) üzerinden ilişkilendirilir.

- Kimlik no tekil bir tanımlayıcıdır. Bir kimlik numarası sadece tek bir müşteri numarası ile ilişkilendirilebilir. Bir kişi hem temsilcide yetkili kişi hem tüzel kişi yetkilisi hem de bireysel müşteri olabilir, ancak bunlar için veritabanında tek bir satırda kimlik bilgileri tutulur.

- Müşteri olmayan ilişkili gerçek kişiler aday müşteri olarak kayıt altına alınır. Bir kişi hem aday müşteri hem de bireysel müşteri olmaz. Müşteri sözleşmeleri imzalamış ve bilgileri tam aday müşteri bireysel müşteri olur.

- Aday müşterinin kendisi adına para transferi yetkisi yok.

- Alıcının bilgileri para gönderme aşamasında olmadığı için ilk önce temp tabloya kaydedilir. Kişi para çekeceğinde bilgileri alınıp KYC yapılıp bireysel müşteri olur. Temp kayıtlar sadece işlem tamamlanana/iptal edilene kadar tutulur, sonrasında arşivlenir.

- Tüzel müşteri olmak sadece genel müdürlükten olabilir.

- Tüzel müşteriler için ortaklar, tüzel müşteri adına hareket edebilecek yetkili kişiler, bireysel müşteri veya aday müşteri olarak kaydedilir.

- Temsilciler tüzel müşterilere benzer şekilde, benzer belge ve bilgiler talep edilerek kaydedilir. Temsilciler sadece tüzel kişilikler olabilir.

- Temsilci adına işlem yapabilen kişiler (örneğin temsilci çalışanları) ile temsilci ortaklar Yetkili Kişi olarak kaydedilir.

- Temsilci olmak sadece genel müdürlükten olabilir. Temsilci lokasyonunda bireysel müşteri olma, para kabulü veya verilmesi işlemlerini yetkisi bulunan temsilci ile ilişkilendirilmiş yetkili kişiler gerçekleştirebilir.

- Temsilci ve Tüzel Müşteri giriş ekranında TCKN/MüşNo ve Parola bilgilerine ilave olarak Temsilci/Tüzel Müşteri VKN bilgisi de alınır. Temsilci ve Tüzel Müşteri adına gerçekleştirilen işlemlerde ayırt ediciliği sağlamak için tüm işlemlerde işlemi kimin yaptığı ve kimin adına yaptığı kayıt altına alınır: actingPersonId (işlemi yapan gerçek kişi), actingOnBehalfOfEntityType / entityId (kimin adına: IndividualCustomer / CorporateCustomer / Agent).

- customer_id, agent_id, associate_id ve employee_id çakışamaz. Aynı id'ye sahip bir çalışan, temsilci veya müşteri olamaz.

- ID değerleri en küçük 99901 olabilir. 99901 kasa hesabıdır.

- ID değerlerine son digit olarak Luhn algoritmasına uygun bir check digit eklenir.

- wallet_no tek başına unique değildir. customer_id ve wallet_no bir araya geldiğinde unique olur.

1. ## KYC Süreçleri

UN ve ülke bazlı “bloklayıcı” yaptırım listelerinde (ör. BM Güvenlik Konseyi, AB, OFAC SDN, HMT UK, Türkiye’de malvarlığı dondurma kararları) yer alan kişiler müşteri olarak kabul edilemez. Mevcut bir müşterinin sonradan bu listelere girmesi halinde, ilgili hesap ve varlıklar derhâl dondurulur, tüm işlemler durdurulur, MASAK’a bildirim yapılır ve STR (şüpheli işlem bildirimi) açısından değerlendirme gerçekleştirilir. Sözleşmesel ilişki sonlandırılabilir; ancak malvarlığı dondurma kararları kaldırılmadan fonlar serbest bırakılamaz. Bu nedenle kişi müşteri yapılmadan önce mutlaka sanction screening taramasından geçirilir. Ayrıca mevcut müşteriler ve temsilciler periyodik olarak (asgari ayda bir) sanction screening sürecine tabi tutulur.

Kişiye ilişkin sanction screening taramasında hit çıkması halinde, öncelikle uyum görevlisi tarafından detaylı doğrulama yapılmalıdır. Ad-soyad benzerlikleri nedeniyle yanlış eşleşme (false positive) olasılığı yüksektir. Bu nedenle doğum tarihi, TCKN/pasaport numarası, adres, uyruk gibi ikincil belirteçler kullanılarak eşleşmenin gerçekten ilgili kişiye ait olup olmadığı teyit edilmelidir. Eğer eşleşme false positive ise, bu sonuca ilişkin kanıtlayıcı bilgi ve belgeler dosyalanır ve kişi/müşteri ilgili kontroller tamamlanarak onaylanır.

Eşleşme false positive değilse, hit alınan listenin kapsamı değerlendirilir. Hit, hangi kategoriye girmektedir: SANCTIONS, PEP (Politically Exposed Person), RCA (Relatives and Close Associates), ADVERSE_MEDIA (Olumsuz Medya/Kötü Şöhret İçeriği)? PEP, RCA veya ADVERSE_MEDIA kapsamında olan kişiler müşteri olabilir; ancak bu durumda uyum görevlisi tarafından EDD (Enhanced Due Diligence) yapılması ve üst yönetim onayı alınması zorunludur. Hit alınan liste SANCTIONS kapsamındaysa, listenin bloklayıcı, sektörel veya ülke bazlı olup olmadığı ayrıca değerlendirilir. Bloklayıcı listede yer alan bir kişiye her türlü dolaylı fon sağlanması (vekalet ilişkisi, üçüncü taraflar, gölge müşteri vb.) da yasaktır. Diğer yaptırım türleri için de EDD ve üst yönetim onayı ile müşteri kabulü mümkündür. EDD + üst yönetim onayı ile müşteri olan tüm kişiler için, müşteri olduktan sonra artırılmış izleme sağlanması amacıyla risk skoruna ilave puan eklenir.

Aşağıda örnek bir skorlama mekanizması yer almaktadır. Otomatik risk skorlaması uygulanacaksa, KYC entegrasyonu sonrasında sağlanabilecek veri alanları dikkate alınarak model gözden geçirilmelidir; aşağıdaki yapı örnek niteliğindedir. Entegrasyon tamamlanana kadar risk skorlaması manuel olarak gerçekleştirilecek, uyum görevlisi ilgili kriterlere göre değerlendirme yapacaktır.

pep_role ('self','family','associate', 'none')

pep_origin ('domestic','foreign','io')

status ('current','former')

country_risk_band ('low','med','high')

adverse_media (bool)

years_since_office_end (int - görevden ayrılalı yıl)

Not: Bir kişide birden fazla etiket varsa öncelik: self > family > associate. io uluslararası örgütün kısaltmasıdır.

\---

(status='current' | (status='former' & years_since_office_end&lt;3)) & pep_role='self' & pep_origin='foreign' &gt; +8

(status='current' | (status='former' & years_since_office_end&lt;3)) & pep_role='self' & pep_origin='domestic' &gt; +6

(status='current' | (status='former' & years_since_office_end&lt;3)) & pep_role='self' & pep_origin='io' &gt; +5

(status='current' | (status='former' & years_since_office_end&lt;3)) & pep_role='family' &gt; +3

(status='current' | (status='former' & years_since_office_end&lt;3)) & pep_role='associate' &gt; +2

status='former' & 3&lt;=years_since_office_end<=5 & pep_role='self' & pep_origin='foreign' &gt; +4

status='former' & 3&lt;=years_since_office_end<=5 & pep_role='self' & pep_origin!='foreign' &gt; +3

status='former' & 3&lt;=years_since_office_end<=5 & pep_role='family' &gt; +2

status='former' & 3&lt;=years_since_office_end<=5 & pep_role='associate' &gt; +1

pep_role!='none' & (country_risk_band='high' | adverse_media=true) > +2

pep_role!='none' & country_risk_band='med' > +1

1. ## Adres Doğrulama

Adres doğrulaması kapsamında müşteriden, kabul edilen adres kanıtı doküman tiplerinden biri talep edilir. Müşteri tarafından sunulan fatura, ikametgâh belgesi, kira sözleşmesi, adres içeren banka ekstresi veya diğer adres belgesi; müşterinin adı, açık adres bilgisi ve belgenin düzenlenme tarihi açısından incelenir. Belgelerin güncel olması beklenir ve belge üzerindeki bilgilerin, müşterinin beyan ettiği adresle makul ölçüde uyumlu olup olmadığı değerlendirilir. Bu aşamada amaç, belgenin adli veya üçüncü taraf sistemler üzerinden kesin doğrulamasını yapmak değil; belgenin içeriği, tutarlılığı ve görünümü itibarıyla güvenilir olup olmadığını makul özen çerçevesinde değerlendirmektir. Müşteri tarafından sunulan adres kanıtı ikametgâh belgesi ise, belge üzerindeki doğrulama bilgileri veya mevcut kamu doğrulama mekanizmaları kullanılarak belgenin kaynağı teyit edilir; teknik entegrasyon bulunmayan durumlarda doğrulama, yetkili kullanıcı tarafından manuel kontrol yoluyla gerçekleştirilir.

Adres kanıtı belgesinin incelenmesi sonucunda, belge yeterli ve tutarlı bulunursa adres doğrulaması tamamlanmış kabul edilir ve müşteri bu doğrultuda işlem yapabilir veya sürekli iş ilişkisi kapsamında aktif hale getirilir. Belge üzerinde eksiklik, belirsizlik veya adres uyumsuzluğu tespit edilmesi halinde müşteriden ilave bilgi veya ek adres belgesi talep edilir. Adres doğrulaması tamamlanmadan, doğrulama gerektiren işlem veya müşteri ilişkisinin başlatılmasına izin verilmez.

Adres doğrulaması, müşteri risk profili, işlem tutarı ve işlem sıklığı gibi unsurlar dikkate alınarak risk bazlı şekilde yürütülür. Yüksek riskli müşteri profillerinde veya artan risk göstergeleri tespit edilmesi halinde adres doğrulaması güçlendirilebilir ve birden fazla belge talep edilebilir. Sürekli iş ilişkisi bulunan müşterilerde adres bilgileri periyodik olarak gözden geçirilir; müşteri tarafından adres değişikliği beyan edilmesi durumunda ise adres doğrulama süreci yeniden işletilir. Bu şekilde, adres bilgisinin güncelliği ve güvenilirliği müşteri ilişkisi süresince korunur.

&nbsp;

1. # Para Transferi

|     |     |
| --- | --- |
| Önceki Status → Yeni Status | Açıklama |
| Pending → Completed | Yurtiçi işlem başarıyla tamamlandı. |
| Pending → Sent → Completed | Yurtdışı işlem başarıyla tamamlandı. |
| Pending/Error\* → OnHold | İşlem bloke edildi. |
| OnHold → Unblocked | Bloke kaldırıldı, işlem devam edecek. |
| Unblocked → Completed | Yurtiçi işlem tamamlandı. |
| Unblocked → Sent → Completed | Yurtdışı işlem tamamlandı. |
| Pending/Unblocked/OnHold → Canceled | İşlem iptal edildi. |
| Pending → ErrorComplete | Yurtiçi hata alındı. |
| Pending → ErrorSend | Yurtdışı işlem, gönderim öncesinde hata alındı. |
| Sent → ErrorReceive | Yurtdışı işlem, gönderim sonrasında hata aldı. |
| Error\* → Retrying | İşlem başarısız oldu, tekrar deneniyor. |

&nbsp;

1. ## Para Transfer Akışı

- Gönderen para yatırdığında, gönderen temsilcisinin avans hesabı yatırılan tutar kadar azalır. Alıcı para çektiğinde ise alıcı temsilcisinin avans hesabı çekilen tutar kadar artar.

- Temsilcilerin ayrıca komisyon hesapları olur. Bu hesaplara işlem komisyonundan kendilerine düşen pay aktarılır.

- Para transferi ve yatırma işlemlerinde, temsilcinin avans hesabında yeterli bakiye bulunmalıdır. İşleme yalnızca Temsilci Avans Hesabı Bakiyesinde yeterli bakiye varsa izin verilir. Bakiye yetersizse işlem gerçekleştirilemez.

- Parametreden avans hesabı bakiyeleri için minimum değer tanımlanabilir. Temsilcilerin avans hesaplarında TRY, USD veya EUR tutulabilir. Özellikle yurt dışı bağlantılı transferlerde USD gerekliliği olabilmektedir. Parametrede tanımlanan değer tüm para birimi hesaplarının toplamına yönelik tek bir değer ile ifade edilir.

- Yurt içinde döviz transferi, yalnızca gönderen ve alıcı temsilcinin ilgili para birimi cinsinden avans hesaplarının bulunması halinde mümkündür. Farklı para birimlerindeki avans hesapları birbirinden bağımsızdır, bir hesaptan diğerine aktarım gerçekleştirilemez.

- Temsilciler arasındaki komisyon oranları farklılık gösterebilir. Örneğin, Antalya'da daha düşük, İstanbul-Aksaray'da daha yüksek komisyon uygulanabilir. Bu farklılıklar, temsilcinin kampanya yönetimi ile belirlenir. Aynı durum, müşteri bazlı komisyonlarda da geçerli olabilir.

- Müşteri hesabı tamamen bloke edildiğinde, para giriş ve çıkışı durdurulur. Kısmi blokaj durumunda ise yalnızca blokeli tutarın çıkışı engellenir. Temsilci hesabında da benzer uygulama yapılır.

- Cüzdandan cüzdana transfer izni bulunmadığı için sadece temsilciden, banka hesabından veya kasa hesabından (reserve cüzdan) gelen para müşteri CustomerPersistent cüzdana aktarılabilir. CustomerPersistent cüzdanda müşteri, istediği zaman, istediği kadar bakiyeyi kullanabilir veya çekebilir. Cüzdandan gelen para transferleri CustomerTransactional cüzdana aktarılır.

- CustomerTransactional cüzdana para yatırıldıktan sonra, bakiyenin başka cüzdana aktarılmasına izin verilmez. CustomerTransactional cüzdan, alıcı bir temsilciye gelinceye kadar bakiyeyi tutabilir. Alıcı bakiyenin tümünü çekmek zorundadır, bakiye bırakamaz.

- Alıcının gelen para birimi cinsinden bir cüzdanı yoksa, sistem tarafından otomatik olarak oluşturulur. Kaynak bir CustomerPersistent cüzdan ise veya müşteri KYC status’u Level 1 ise CustomerTransactional cüzdan, aksi durumda CustomerPersistent cüzdan oluşturulur.

- Alıcı level 1 → para CustomerTransactional cüzdana aktarılır. Alıcı level 2 ve para bir CustomerPersistent cüzdandan gönderilmiş → para CustomerTransactional cüzdana aktarılır. Alıcı level 2 ve para temsilciden gönderilmiş → para CustomerPersistent (alıcı kyc_level >= 2) veya CustomerTransactional (alıcı kyc_level < 2) cüzdana aktarılır; alıcı ilk başta tanımlı olmasa bile para çekme öncesinde sistemde kyc_level = 2 olarak tanımlanırsa CustomerPersistent cüzdana aktarılır, kyc_level = 1 olarak tanımlanırsa CustomerPersistent cüzdana aktarılır.

- Alıcı daha önce sisteme kaydolmamış ise, müşteri kabulü tamamlanana kadar gelen fon CustomerTransactional cüzdanda tutulur, kullanıma kapalıdır. Müşteri kabulü sonrasında KYC seviyesi level 1 olursa cüzdan kullanıma açılır, level 2 veya level 3’e yükseltilirse ve fon CustomerPersistent cüzdandan gelmemişse, fon otomatik olarak CustomerPersistent cüzdana aktarılır. Tüzel kişilerde KYC seviyesi uygulanmadığından, müşteri kabulü KYC Accepted olduğunda CustomerPersistent cüzdandan gelmemiş fon CustomerTransactional cüzdandan CustomerPersistent cüzdana otomatik aktarılır.

- Banka hesabından veya temsilciden gelen işlemlerde Gönderen Cüzdan boş olur. Banka hesabına giden işlemlerde Alıcı Cüzdan boş olur. Bu iki durumda IBAN dolu olur ve diğer tüm durumlarda IBAN boş olur.

- Cüzdana transferler dışındaki para transferlerinde alıcı bilgileri customers.receiver_info tablosuna yazılır. Alıcı para çekmek istediğinde girilen bilgiler kontrol edilir ve kayıt pasife çekilerek yeni müşteri kaydı oluşturulur.

- Hem gönderenin hem de alıcının yurt içinde olduğu işlemler yurt içi işlemlerdir. Gönderen veya alıcıdan birinin yurt dışında olduğu işlemler ise yurt dışı işlemlerdir.

1. ## Kontroller

- Mükerrerlik: correlation_id üret, tüm log/entegrasyonlarda kullan. İşlemi uçtan uca takip etmeni sağlar. Yeni gelen işlemde mevcut tamamlanmış veya devam eden bir correlation_id gelirse mükerrer işlem yaratma.

- Girdi doğrulama (sunucu tarafı): Zorunlu alanlar, format/allowlist, max uzunluk, destekli ülke/para birimi, işlem tipi–alan tutarlılığı (örneğin IBAN transferinde IBAN zorunlu; yurt dışı transferinde ülke + target currency zorunlu).

- Kanal/rol yetkisi: “Temsilci kanalından cüzdandan transfer yok” gibi kurallar burada enforce edilir.

- Taraf uygunluğu (status ve sahiplik): Gönderen/alıcı entity_status=Active değilse kes. Cüzdan/hesap sahipliği ve işlem tipine uygunluk (CustomerPersistent/Transactional kuralları).

- KYC & belge uygunluğu

- AML/Sanction + ülke/koridor risk kontrolleri

- Limit kontrolleri (kanal/segment bazlı)

- Ücret/komisyon + (varsa) FX quote

- Bakiye yeterlilik + rezervasyon (hold): Fee dahil toplam tutar için yeterlilik kontrolü. Başarılıysa fonları ve limitleri “hold” et (double-spend önlemi). Bundan sonraki aşamalarda hata alınırsa blokeler ve rezervasyonlar da yönetilmelidir.

- Onay gereksinimi kararı ve onay kaydı (varsa): Ekran/alan/değer bazlı kurallardan required_approvals (0/1/2) belirle.

- İcra/entegrasyon, dekont üret, imzalı dekont yükle, bildirimleri şablonlara göre gönder.

1. ## İşlem

- İşlem girildiğinde Pending (Beklemede) olur.

- Yurt içi işlemlerde: Gerekli aksiyonlar tamamlandığında, para gönderimi tamamlandığında Completed (Tamamlandı) olur. Pending → Completed

- Yurt dışı işlemlerde: Gerekli aksiyonlar tamamlandığında, para transfer mesajı partner kuruluşa gönderildiğinde Sent (Gönderildi) olur. Yurt dışındaki partner mesajı alıp onay verince Completed (Tamamlandı) olur. Pending → Sent → Completed

- Sent (Gönderildi) ve Completed (Tamamlandı) işlemler ekranlardan geri alınamaz (Canceled).

- Sent sadece yurtdışı işlemlere özgü bir statüdür.

1. ## Bloke Etme

- Pending (Beklemede) olan işlemler bloke edilebilir.

- İşlem bloke edilirse OnHold (Durduruldu / Bloke Edildi) olur.

- OnHold statüsündeki işlemler ilerletilmez ve bekletilir.

- Eğer işlem bloke edilirse işlem ve ücretlerin toplamı kadar bir tutar kişinin cüzdanından bloke edilir. Gerekmesi halinde gönderen temsilcinin AgentCommission cüzdanına işlem dolayısıyla yapılan ödeme de bloke edilir.

1. ## Bloke Kaldırılması

- On Hold işlemlerin blokesi kaldırılabilir veya iptal edilebilir.

- Bloke kaldırıldığında işlem Unblocked (Bloke Kaldırıldı) statüsüne geçer.

- Unblocked işlem, işleme devam etme açısından Pending işlemle aynı kurallara tabidir.

- Unblocked işlem iptal edilecekse Canceled (İptal Edildi) olur.

- İşlem bloke kaldırılırken cüzdanlardan bloke edilen tutar da serbest bırakılır.

1. ## Başarısız Senaryo

- İşlem teknik bir hata nedeniyle tamamlanamazsa Error\* statüsüne geçer. Yurtiçi işlemlerde hata halinde statü ErrorComplete olur. Yurtdışı işlemlerde gönderim öncesinde hata alınırsa ErrorSend, sonrasında alınırsa ErrorReceive statüsüne geçer.

- Error\* işlemler tekrar denenecekse: Retrying (Tekrar Deneniyor) olur.

- Yurtiçi hata: Pending → ErrorComplete → Retrying/OnHold/Canceled

- Yurtdışı gönderim öncesi hata: Pending → ErrorSend → Retrying/OnHold/Canceled

- Yurtdışı gönderim sonrası hata: Pending → Sent → ErrorReceive → Retrying/OnHold/Canceled

- İşlem hiç yürütülmediyse (Canceled) müşteriden ücret tahsil edilmez (0).

- İşlem yurt içi işlemlerde Completed statüsüne gelirse "İşlem başarılı", yurtdışı işlemlerde Sent statüsüne gelirse ekranda "Partner’a iletildi, onay bekleniyor" mesajı dönülür. Bu aşama öncesinde hata alınırsa işlem yurtiçi için ErrorComplete, yurtdışı için ErrorSend statüsüne geçirilir, işlemin herhangi bir hesabı etkilememesi sağlanır ve kullanıcıya hata ile ilgili bilgi verilir. Kullanıcıya 2 seçenek sunulur: Tekrar Dene ve İptal. Tekrar Dene seçilirse statü Retrying yapılır ve işlem tekrar denenir. İptal halinde ise işlem Canceled statüsüne çekilir. Hata mesajlarında sisteme dair bilgi içermemelidir, sisteme dair bilgi vermesi halinde bu durum saldırganlarca sistemin keşfi için kullanılabilmektedir. Bunun yerine kullanıcıya hata kodu dönülür ve hata koduna karşılık gelen hata mesajı loga kaydedilebilir.

- ErrorComplete ve ErrorSend statülerinde otomatik yenileme tanımı olmaz. Manüel yenileme halinde sürecin başından (Pending aşamasından) itibaren sistem işletilir. Yeniden deneme sonucunda işlem başarıyla tamamlanırsa kayıt yurt içi işlemlerde Completed, yurtdışı işlemlerde Sent statüsüne geçer; hata devam ederse yurtiçi için ErrorComplete, yurtdışı için ErrorSend statüsüne geri döner.

- Yurtdışı para transferlerinde ErrorReceive → Retrying sürecinde öncelikle ilgili isteğin dış sistemde zaten oluşup oluşmadığı kontrol edilir. Dış sistemde ilgili işlem kaydı zaten varsa, işlem doğrudan Completed statüsüne alınır ve tekrar gönderim yapılmaz. İşlem dış sistemin kuyruğunda bekliyorsa, mükerrer işlem oluşturmamak için yeniden tetikleme yapılmaz. Dış sistemde hiçbir kayıt bulunmuyorsa, Sent aşamasından itibaren işlem süreci yeniden başlatılır. Yeniden deneme sonucunda işlem başarıyla tamamlanırsa kayıt Completed durumuna geçer; hata devam ederse ilgili ErrorReceive durumuna geri döner ve retry politikaları (parametrede tanımlı otomatik deneme sayısı ve süre) çerçevesinde işlem görür.

1. ## Döviz Alım Satımı

Para havalesi işleminin her iki tarafı da Türkiye’de ise döviz alım satım işlemi yapılamaz. Döviz alım satımı yapılabilmesi için para havalesi işleminin taraflarından birinin yurtdışında olması şart. Ancak bu durumda da aşağıdaki şartların sağlanması gerekir:

- Ödeme hesabından yapılan para transfer işlemlerinde döviz alım satım tutarı para havalesi tutarı kadar olmalı ve bu tutarın ertesi işgünü sonu itibarıyla müşterinin ödeme hesabında bulunmaması (yani hesaptan çıkmış ve para havalesinde kullanılmış olması gerekir)

- Ödeme hesabı olmadan temsilciler aracılığıyla yapılan para havalesi işleminde, işlemle ilgili döviz alım satım işleminin işlemle ardışık veya yakın referans/kayıt/işlem numarası alması, yani döviz alım satım işleminin para havalesi işlemi ile ilişkili olduğunun gösterilebilmesi

1. ## Kalan Limit Hesaplama

- Risk fallback kuralı: ilgili entity için önce kendi risk seviyesindeki kayıt aranır; yoksa bir alt risk seviyesine bakılır; o da yoksa global (risk_level=null) kayıt kullanılır; global de yoksa tutar limitleri için değerler -1 (limitsiz), “Yurtdışı Gönderim” için ise “kısıt yok/izinli” kabul edilir.

- Limitlerden kasıt Tek İşlem Limiti, Günlük Toplam Limit, Aylık Toplam Limit değerleridir.

- Kullanım toplamları (günlük/aylık), toplama katkı sağlayan işlemin gerçekleştiği andaki kurla TRY’ye çevrilmiş tutarlar üzerinden hesaplanır ve bu değerler üzerinden okunur. Varsa onay bekleyen işlemler kullanım hesaplarına dahil edilmez, bu işlemler hiç gerçekleşmemiş gibi davranılır.

- Tüm hesaplamalar as_of tarihine göre yapılır. O tarihe göre günlük ve aylık limit ve kullanımlar getirilir ve kalan limit hesaplanır.

- En kısıtlayıcı değer; negatif olmayan değerler arasındaki en küçük değerin seçilmesidir. Negatif olmayan değer yoksa -1 olur. Değerler arasında 0 varsa sonuç 0’dır.

- Loga tüm limit ve toplam kullanım değerleri yazılır.

- İşlem yurtdışı ise müşterinin risk bazlı limit kaydındaki Yurtdışı Gönderim = Yasak ise next_tx_max_amount, today_remaining, month_remaining, single_tx_limit değerlerinin tamamı 0 döndürülür ve işlem sonlandırılır.

- channel=Agent ve işlem yurtdışı ise temsilci için de Yurtdışı Gönderim = Yasak ise tüm limitler 0 döndürülür ve işlem sonlandırılır.

- channel=Agent ise temsilci yetkilisi kontrol edilir: yetkilinin as_of tarihinde aktif olması ve işlem yetkisinin bulunması gerekir; yoksa tüm limitler 0 döndürülür ve işlem sonlandırılır.

- customer_type=Corporate ise tüzel müşteri yetkilisi kontrol edilir: yetkilinin as_of tarihinde aktif olması ve işlem yetkisinin bulunması gerekir; yoksa tüm limitler 0 döndürülür ve işlem sonlandırılır.

- Müşteri için ekran limitleri ve risk bazlı limitler DB’den alınır. Müşteri için etkin limitler hesaplanır: ekran limitleri ve risk limitleri birlikte değerlendirilir; her boyutta en kısıtlayıcı değer seçilir.

- customer_type=Individual ise KYC seviyesine göre KYC limitleri uygulanır (Level 2 ve 3 tek işlem; Level 1 aylık). Bu limitler gerekiyorsa müşteri etkin limitlerini daha da düşürür (yine negatif olmayanların en küçüğü mantığı).

- Müşteri limitlerinden en az biri >0 ise müşteri günlük ve aylık kullanım toplamları okunur.

- customer_type=Corporate ise tüzel müşteri yetkilisinin limitleri DB’den alınır. Yetkili limitlerinden en az biri >0 ise yetkilinin günlük ve aylık kullanım toplamları okunur.

- channel=Agent ise temsilcinin ekran limitleri ve risk bazlı limitler DB’den alınır. Temsilci için etkin limitler hesaplanır: ekran + risk birlikte değerlendirilir; her boyutta en kısıtlayıcı değer seçilir.

- Temsilci limitlerinden en az biri >0 ise temsilci günlük ve aylık kullanım toplamları okunur.

- channel=Agent ise temsilci yetkilisinin limitleri DB’den alınır. Temsilci yetkili limitlerinden en az biri >0 ise temsilci yetkilisi günlük ve aylık kullanım toplamları okunur.

- channel=Wallet ise cüzdan + işlem için limitler DB’den alınır. Cüzdan limitlerinden en az biri >0 ise günlük ve aylık kullanım toplamları (cüzdan+işlem bazında) okunur.

- Uygulanmayan aktörler (channel=Wallet iken temsilci ve temsilci yetkilisi, channel=Agent iken cüzdan, customer_type=Individual iken tüzel yetkili) hesaplamaya dahil edilmez.

- Her aktör için (müşteri, tüzel müşteri yetkilisi, temsilci, temsilci yetkilisi, cüzdan) günlük ve aylık kalan hesaplanır: limit <= 0 ise kalan = limit ; değilse kalan = max(0, limit - günlük_kullanım). Tek işlem için “kalan”, limitin kendisi kabul edilir.

- today_remaining, tüm ilgili aktörlerin günlük kalanları arasından en kısıtlayıcı değer seçilir.

- month_remaining, tüm ilgili aktörlerin aylık kalanları arasından en kısıtlayıcı değer seçilir.

- single_tx_limit, tüm ilgili aktörlerin tek işlem limitleri arasından en kısıtlayıcı değer seçilir.

- next_tx_max_amount = single_tx_limit, today_remaining, month_remaining arasından en kısıtlayıcı olanın seçilmesiyle hesaplanır.

Servis girdisi:

|     |     |     |     |
| --- | --- | --- | --- |
| Alan | Tip | Zorunlu | Açıklama |
| as_of | datetime | Evet | Hesaplamanın yapılacağı zaman (gün/ay pencereleri için) |
| operation_type | enum | Evet | İşlem tipi / limit anahtarı |
| channel | enum | Evet | AGENT / WALLET |
| currency | ENUM | Evet | currency |
| customer_id | string | Evet | Müşteri id |
| agent_id | string |     | channel=AGENT ise zorunlu |
| agent_authorized_person_id | string |     | channel=AGENT ise zorunlu |
| wallet_id | string |     | channel=WALLET ise zorunlu |
| corporate_authorized_person_id | string |     | Müşteri tüzel ise zorunlu |

&nbsp;

Servis çıktısı:

|     |     |     |
| --- | --- | --- |
| Alan | Tip | Açıklama |
| as_of | datetime | Hesaplama zamanı |
| operation_type | enum/string | İstekle aynı |
| channel | enum | İstekle aynı |
| currency | enum/string | İstekle aynı |
| next_tx_max_amount | number \| -1 \| 0 | Bugün bir sonraki işlemde yapılabilecek maksimum tutar. 0=kapalı, -1=limitsiz |
| today_remaining | number \| -1 \| 0 | Bugün kalan limit (günlük limit - bugünkü kullanım). Günlük kullanım limitsizse -1 döner. |
| month_remaining | number \| -1 \| 0 | Bu ay kalan limit (aylık limit - aylık kullanım). Aylık kullanım limitsizse -1 döner. |
| single_tx_limit | number \| -1 \| 0 | Etkin tek işlem limiti |

&nbsp;

1. # Hesaplar

2. ## Ödeme Hesapları

- Reserve (Şirket Ana Hesabı): Şirketin operasyonel rezervlerinin ve genel fon havuzunun tutulduğu ana hesap.

- Revenue (Gelir Hesabı): İşlemlerden şirkete düşen ücret ve komisyonların biriktiği hesap.

- Suspense (Geçici Hesap): İşleme veya tarafa henüz eşleştirilemeyen ya da mutabakatı belirsiz tutarların geçici olarak tutulduğu hesap.

- AgentAdvance (Temsilci Avans Hesabı): Acentelerin ön finansman (avans) olarak şirkete aktardığı bakiyelerin tutulduğu hesap. Temsilci, firmanın banka hesabına açıklama alanında kendi temsilci numarasını belirterek para gönderdiğinde, gönderilen tutar kadar temsilcinin AgentAdvance hesabı bakiyesi artırılır.

- AgentCommission (Temsilci Komisyon Hesabı): Acentelere ait komisyon ve ücret paylarının biriktiği hesap.

- PartnerAdvance (Muhabir Avans ve Mutabakat Hesabı): Yurtdışı partnerlerle yapılan settlement süreçlerinde partner lehine veya aleyhine oluşan avans / net pozisyonun tutulduğu hesap.

- PartnerCommission (Muhabir Komisyon Hesabı): Partnerlere ait komisyon ve gelir paylarının tutulduğu hesap.

- CustomerPersistent (Kalıcı Müşteri Hesabı): Kayıtlı ve tekrar eden işlem yapabilen müşterilerin kalıcı bakiyelerinin tutulduğu hesap.

- CustomerTransactional (Tek İşlemlik Müşteri Hesabı): Tek seferlik veya geçici işlemler için oluşturulan müşteri balansının tutulduğu hesap. Tüzel kişilerin CustomerTransactional cüzdanı olamaz. Yani, onboarding sürecinden geçmemiş ve hesabı olmayan bir şirkete para yollanamaz.

1. ## Para Transferi Hesap Hareketleri

Standart bir yurtiçi para transferinde hesaplar aşağıdaki şekilde değişir:

P = gönderilen ana tutar (principal)

F = müşteriden tahsil edilen toplam ücret/komisyon (varsa)

Cs = gönderen temsilcisine düşen komisyon payı (F içinden)

Cr = alıcı temsilcisine düşen komisyon payı (F içinden)

**Para Gönderme:**

Gönderen: fiziki nakit hareketi -(P + F)

Gönderen temsilcisi: fiziki nakit hareketi +(P + F), AgentAdvance -(P+F), AgentCommission +Cs

Payment Company: Suspense +(F - Cs)

Alıcı: CustomerTransactional: +P

**Para Çekme:**

Alıcı: fiziki nakit hareketi +P, CustomerTransactional : -P

Alıcı temsilcisi: fiziki nakit hareketi -P, AgentAdvance +P, AgentCommission +Cr

Payment Company: Revenue +(F - Cs - Cr), Suspense -(F - Cs)

1. ## Banka Hesapları

- Temsilciler, ödeme kuruluşu ile aynı bankada hesap açmaktadır. Böylelikle temsilci hesabına aktarım havale ile gerçekleşmektedir.

- Temsilcinin avans tutarı ve komisyon gelirleri, bankadaki kullanım hesabında (cari hesap) tutulur ve koruma hesabına aktarılmaz.

- Temsilcinin komisyon dışı avans hesabındaki artış, bir sonraki iş günü otomatik olarak temsilcinin banka hesabına aktarılır. Temsilcinin banka hesabına geçecek tutar, taraflar arasında belirlenen minimum eşiği aşan bakiyeden oluşur.

- Temsilcilerle yapılacak komisyon mahsuplaşmaları, haftalık, aylık veya parametre olarak tanımlanmış belirli bir eşik tutarına ulaşıldığında gerçekleştirilir. Ödeme yapılacaksa, mutabakat sonrası temsilcinin banka hesabına otomatik aktarılır.

- Koruma hesabı, banka tarafından bloke edilen bir hesap olup, gün içinde sürekli işlem yapılmasına izin vermez. Gün içerisinde gerekli hesaplamalar yapıldıktan sonra tek seferde işlem gerçekleştirilir ve bakiye bir sonraki iş gününe kadar korunur.

- Sonlanmayan işlemler, yani müşteri tarafından yatırılan ancak çekilmeyen veya cüzdana eklenen bakiyeler, ertesi gün saat 15:00’e kadar bankadaki cari hesaptan bankadaki koruma hesabına aktarılmalıdır.

- Koruma hesabına günlük olarak tek bir işlemle aktarılması gereken tutar yatırılır veya çıkarılması gereken tutar çekilir.

- Komisyon hesabındaki bakiyenin müşteri bazında dağılımını gösteren rapor, günlük olarak oluşturulur ve arşivlenir. Koruma hesabında hangi gün, hangi müşteri adına ne kadar para tutulduğu açıkça belirlenmelidir.

&nbsp;

1. # Dekont

- Müşterinin dil tercihine göre dekont Türkçe, İngilizce veya Arapça oluşturulabilir. Alanlar zorunlu değil opsiyoneldir, bilgi varsa doldurulur.

- Firma Adı, Vergi Dairesi-No, Adres, Telefon, Web Adresi, E-posta

- İşlem No, Referans No

- Gönderen: Adı ve Soyadı / Unvanı, Müşteri No-Cüzdan Numarası, IBAN, Telefon, E-posta, Ülke-İl-İlçe

- Alıcı: Adı ve Soyadı / Unvanı, Müşteri No-Cüzdan Numarası, IBAN, Telefon, E-posta, Ülke-İl-İlçe

- İşlem ve Tutarlar: Gönderilen Tutar, Para Birimi, Sabit Ücret, Oransal Ücret, Toplam Ücret (Sabit Ücret + Oransal Ücret toplamı), Müşterinin Ödeyeceği Toplam Tutar (Gönderilen Tutar + Toplam Ücret), Hedef Para Birimi, Döviz Kuru, Alıcının Alacağı Net Tutar

- İşlem Detayları: İşlem Türü (ENUM: transaction_type), Ödeme Türü (ENUM: payment_purpose), İşlem Açıklaması.

- Temsilci İmzası, Müşteri İmzası

- Dekontun en altında bir QR kod bulunur. QR kod, firma tarafından yönetilen merkezi bir sözleşme sayfasına yönlendirmeli; ancak bu yönlendirme genel bir sayfa yerine, işlem anında geçerli olan sözleşme/politika metninin versiyonunu (tarih/versiyon numarası ile) işaret eden versiyonlu ve değişmez bir URL olmalıdır. Sayfanın içeriğinde şunlar bulunmalı: Kullanıcı Sözleşmesi (Eğer sürekli müşteri ilişkisi varsa), Gizlilik Politikası, Açık Rıza Metni, İşlem Koşulları & İptal/İade Politikası, Sıkça Sorulan Sorular, Dilek, Şikâyet ve Öneriler, Destek Bağlantıları.

- Müşteri sözleşmesi imzalanmadığı için dekont altında bazı önemli hükümler yer alır.

&nbsp;

Dekont.png bak yada Sablonlar\dekont-sablonu.md

&nbsp;

1. # İşlem İzleme ve Dolandırıcılık Tespiti

Suistimal ve dolandırıcılık olduğu kesin olan işlemlerin reddedilmesi önleyici bir kontroldür. Bunun yanı sıra, doğru olmadığı kesin olmamakla birlikte, anormal değerlere yönelik tespit edici kontroller tesis edilmelidir. Bu kapsamda, dolandırıcılık faaliyetine işaret eden örüntü, uygulama ve aktivitelerin izlenmesi ve bunlara yönelik aksiyon alınmasına yönelik fraud izleme aracı mevcut olmalıdır. Fraud izleme kapsamında asgari olarak kural tabanlı izleme bulunmalıdır.

Kural tabanlı izleme iki şekilde olmaktadır: işlem öncesi ve işlem sonrası. İşlem öncesi (real-time) kural tabanlı izlemede, engine işlem gerçekleşmeden önce analizini yapar ve belirlenmiş kural listesindeki durumlar tespit ederse işlem gerçekleşmeden aksiyon alır. Kuralların false positive oranlarını azaltmak ve müşterileri daha az sıkmak adına kurallarda tanımlanan eşik değerleri, dolandırıcılık ve suistimallerin anlık olarak tespitine yönelik avantaj sağlarken; daha uzun vadeye yayılmış ve eşik değerlerinin altında kalarak gerçekleştirilen dolandırıcılık ve suistimallerin tespitine imkân tanımamaktadır. Bu gibi analiz faaliyetleri için işlem sonrası izleme yapılır.

FAZ 2: SAR reports (Directly report suspicious activities to the government authority automatically after the approval of Compliance Officer), Rule threshold optimization with machine learning (i.e. tree-based methods), Entity risk weight optimization (i.e.  isolation forest)

1. ## Rules

Bir işlemin şüpheli olup olmadığını belirlemek için kullanılan mantıksal ifadedir. Kurallar, bir veya birden fazla varlığın (entity) özniteliklerine (attribute) dayanarak operatörler ve referans veriler ile ifade edilir.

1. ## Entities

Fraud sistemindeki temel varlıkları temsil eder. Her entity, belli bir gerçek dünya nesnesine karşılık gelir ve kendi özniteliklerine sahiptir.

Kullanılan Entity'ler:

- Sender: Parayı gönderen müşteri

- Receiver: Parayı alan müşteri

- SenderAgent: Göndericiyle ilişkili temsilci

- ReceiverAgent: Alıcıyla ilişkili temsilci

- Transaction: Transfer edilen işlemin kendisi

1. ## Attributes

Entity'lerin sahip olduğu veri alanlarıdır. Her attribute bir müşteri, işlem veya temsilcinin bir özelliğini temsil eder.

**Customer** **(****Sender****,** **Receiver**\*\*):\*\*

Id, Type (ENUM: customer_type), BirthCountry, AddressCountry, Nationality, IncomeDeclared, Occupation, PhonePrefix, EmailDomain, RiskCategory, PreviousRiskCategory, CustomerBalance, AccountType (ENUM: customer_wallet_type), AccountAge (kişinin ilk hesap açışından bu yana geçen süre – gün), LastContactInfoChangeDate, LastTxDate, IsAddressVerified, IP

LinkedCustomersCount (Aynı telefon, eposta veya adrese  bağlı müşteri sayısı), DeviceCountToday, SameDeviceCustomerCountToday (Aynı cihazdan aynı günde işlem yapan kullanıcı sayısı), IPCountToday, SameIPCustomerCountToday (Aynı IP'den aynı günde işlem yapan kullanıcı sayısı), EODBalanceAvg(30), SendingTxCount (1, 7, 30), ReceivingTxCount (1, 7, 30), TxCountLastHour, SendingAmountTotal (1, 7, 30), ReceivingAmountTotal (1, 7, 30), SendingAmountLastHour, ReceivingAmountLastHour, SendingAmountAvg (1, 7, 30), ReceivingAmountAvg (1, 7, 30), SendingAmountStdDev(30), IncomingFlatAmountShare(30), ComplaintCount (30), ManualReviewCount (30), ChargebackCount (30), ImpossibleTravel (DistanceFromLastTx kullanılarak hesaplanır: >500 km ve <2 saat), FailedLoginAttemptsLastHour, UniqueReceiverCount (1, 7, 30), UniqueSenderCount (1, 7, 30)

**Agent (****SenderAgent****,** **ReceiverAgent**\*\*):\*\*

Id, Country, City, RiskCategory

TxCountDays (1, 7, 30), TxCountLastHour, AmountTotal (1, 7, 30), AmountAvg (1, 7, 30), ComplaintCount (30), ManualReviewCount (30), ChargebackCount (30)

**Transaction**\*\*:\*\*

Amount, Currency, Date, Time, Type, Status, Description, Channel (ENUM: channel)

**Notlar**

(1, 7, 30) ve (30) gün ifadesidir; 1 gün, 7 gün ve 30 gün ifade eder. Parasal hesaplamalar TRY cinsine çevrilerek yapılır.

Hesaplama yapılırken; 1 gün hesaplamaları saatte 1 kez yapılır. 7 ve 30 gün hesaplamaları günde 1 kez 6 ve 29 için yapılır ve üzerine 1 gün değeri eklenir. Hesaplanması gereken attribute’lerden sadece herhangi bir kuralda geçenler hesaplanır.

LinkedCustomersCount hem kayıt sırasında hem de işlem sırasında kullanılabilir, ancak sadece yeni müşteri kayıt veya mevcut müşteri contact bilgisi güncellenirken hesaplanır.

IncomingFlatAmountShare % birimindedir ve Received Amount % 1000 == 0 şartını sağlayan işlem adedinin toplam para alma işlem adedine oranıdır.

Sender Behavior Change gibi bilgiler için örüntü analizi yapmak yerine SendingAmountLastHour / SendingAmountAvg(30) şeklinde kurallar yazılmalıdır. Oran bazlı kurallarda payda 0 veya çok küçükse veya yeterli örnek yoksa oran kullanılmaz ve kural atlanır.

Temsilci Enlem ve Boylam’lar tanımlı olduğu için 2 saat içerisinde farklı temsilcilerde gerçekleşen işlemlerde temsilciler arası mesafe 500 km üzeri ise bu değişken True değerini alır, aksi durumda veya coğrafi verinin bulunmaması durumunda false değerini alır.

Gönderim esnasında müşteri olmayan alıcılar dolayısıyla Receiver bilgilerinin pek çoğu null olabilir. Motor çalışmasında bu durumlar problem yaratmamalıdır.

1. ## Operators

Kurallar içinde attribute'lar arasında ilişki kurmak için kullanılan mantıksal, karşılaştırmalı, matematiksel ve zamansal sembollerdir.

Karşılaştırma Operatörleri: =, !=, >, &lt;, &gt;=, <=, IN, NOT IN.

Mantıksal Operatörler: AND (&&), OR (||), NOT (!).

Matematiksel Operatörler: \*, +, -, /, %.

Zaman Operatörleri: NOW, DATEDIFF, TIMEDIFF, WITHINLAST(days), BETWEEN(date1, date2).

Metin Operatörleri: CONTAINS, STARTSWITH, ENDSWITH, REGEXMATCH.

Fonksiyonlar: ABS, ROUND, LOWER, UPPER, COALESCE, FLOOR.

Parantez: (, ).

1. ## Reference Data

Sistemde önceden tanımlanmış referans listeleri, eşik değerleri veya tablo yapılarıdır. Kurallar tarafından veri okuması yapılabilir, RiskyAgents, RiskyCustomers, RiskyCredentials ve RiskyIPs listelerine yeni ekleme ve veriden çıkarma yapılabilir.

Listeler: RiskyCountries, RiskyPhonePrefixes, RiskyEmailProviders, RiskyCities, UsuallyUsedCurrencies, BlacklistedKeywords, RiskyAgents, RiskyCustomers, RiskyCredentials, RiskyIPs, RiskyOccupations

Tablolar: OccupationTransactionThresholds: OccupationId, MaxMonthlyIncome, MaxSingleTxAmount, MaxMonthlyTxAmount (Meslek bazında beklenen max gelir, beklenen max tek seferlik para transfer tutarı ve beklenen max aylık para transfer tutarı)

1. ## Örnekler

T-006-2.5: Sender.SendingTxCount(1) >= 3 AND ABS(Transaction.Amount - Sender.SendingAmountAvg(7)) <= 0.2 \* Sender.SendingAmountAvg(7) AND Sender.UniqueReceiverCount(1) < 3

T-006-2.8: Sender.SendingTxCount(1) >= 4 AND Sender.UniqueReceiverCount(1) >= 4 AND Sender.SendingAmountAvg(1) < 10000

T-006-2.20: Sender.EODBalanceAvg(30) &lt; 1000 AND Transaction.Amount &gt; 100000 AND (Sender.SendingAmountLastHour > 0  OR  Transaction.Type IN (AgentWithdrawal, BankWithdrawal))

T-006-2.70: Sender.UniqueSenderCount(7) >= 5 AND Sender.UniqueReceiverCount(7) >= 4 AND Receiver.ReceivingAmountTotal(7) > 0 AND ABS(Sender.SendingAmountTotal(7)/Receiver.ReceivingAmountTotal(7) - 1) <= 0.05

1. ## Mevzuat Gereği Para Transfer Sisteminde Asgari Bulunması Gereken Kurallar

T-006-1.4: Müşterilerin işi/mesleği, mali durumu ile işlemleri arasında makul bir orantı bulunmaması.

T-006-2.2: Müşterinin sık kullanılmayan bir döviz ile ödeme yapmak istemesi gibi ödeme araçlarının alışılmışın dışında kullanılması.

T-006-2.3: Görünürde birbirinden bağımsız hareket eden müşterilerin; aynı adres, telefon ve benzeri iletişim bilgilerini vermesi, aynı kişiler ile para transferi ilişkisi içerisinde olması.

T-006-2.4: Çok sayıda müşterinin hesaplarında biriken bakiyeyi ortak bir kişiye aktarması.

T-006-2.5: Mutad uygulamalarda toplu yapılması gereken mali işlemlerin, tespit ve bildirimlerden kaçınmak amacıyla, mantıklı bir gerekçesi olmaksızın bölünmesi.

T-006-2.8: Müşterilerin bildirim prosedürlerinden kaçınmak amacıyla işleme konu parayı birden fazla hesaba, havaleye veya nakde bölmek suretiyle işlem yapması veya buna teşebbüs etmesi.

T-006-2.9: Müşterinin bilinen mesleği ve faaliyetleri, gelir kaynakları ve gelir düzeyi ile ilgisi kurulamayan, dikkat çekici sıklıkta ve tutarda işlem yapmak istemesi

T-006-2.10: Riskli ülkeler veya off-shore merkezlerden veya bu ülke ve merkezlere; makul açıklama yapılmadan belli bir zaman aralığında önemli tutarlara ulaşan transferlerin yapılması.

T-006-2.11: Genellikle sabit/birbirine yakın tutarlar ile birbirine yakın dönemlerde yabancı uyruklu kişilere ya da yabancı uyruklu kişilerden aynı kişiye dikkat çekici para transferlerinin yapılması.

T-006-2.13: Müşterinin hesabına, hesap açıldıktan kısa bir süre sonra yüksek tutarlı transferlerin gelmesi ve gelen transferlerle ilgili olarak uzunca bir süre herhangi bir işlem yapılmaması.

T-006-2.14: Uzun süre işlem görmeyen hesabın belli dönemlerde birdenbire aktif hale gelmesi ve sonrasında tekrar uzun süre işlem görmemesi.

T-006-2.16: Müşterinin, günlük, haftalık ve aylık dönemlerde farklı kişilere yönelik dikkat çekici sayıda ödeme/transfer gerçekleştirilmesi.

T-006-2.18: Müşterinin hesabına çok fazla sayıda ve/veya sıklıkla farklı kişilerden/hesaplardan para transferi yapılması. Günlük, haftalık ve aylık periyotlarda belirlenen kişi sayısından fazla işlem yapması.

T-006-2.19: Müşterinin, hesabında; hayat standardı, işi ve gelir seviyesi ile ilgisi kurulamayan dikkat çekici meblağlara tekabül eden (sık sık düşük tutarlı veya tek işlemde yüksek tutarlı) para yatırma işlemlerinin gözlenmesi.

T-006-2.20: Çok düşük bakiyeye sahip olan bir hesaba yüklü tutarlarda nakit yatırılması ve müteakiben yatırılan nakdin belli aralıklarla çekilmesi.

T-006-2.22: Uzun süre işlem yapılmayan ödeme hesabına yüklü miktarda para yatırılması ve bu paraların küçük tutarlara bölünerek farklı kullanıcılara transfer edilmesi.

T-006-2.23: Müşterinin gerçekleştirdiği transferlerin yasadışı bahis-kumar sitelerinde veya bu suçlar amacıyla kullanıldığından şüphe duyulması.

T-006-2.34: Temsilcide gerçekleşen işlemlere olağan dışı sayıda itiraz gelmesi.

T-006-2.37: Ödeme hesabına gelen işlemlerin büyük oranda düz tutarlardan (50,100, 200 vb.) oluşması.

T-006-2.41: Temsilcide gerçekleşen işlemlerin lokasyonuna veya geçmiş ortalamasına oranla olağandışı adet ve hacimde olması

T-006-2.42: Aynı gün içerisinde aynı IP’den 5 veya daha fazla farklı bireysel müşterinin ödeme hesabına erişilerek işlem gerçekleştirilmesi.

T-006-2.43: Aynı müşterinin ödeme hesaplarına aynı gün içerisinde 5 farklı IP’den erişilerek işlem gerçekleştirilmesi.

T-006-2.44: Güvenilmeyen ya da kriptografik gizlilik sunan e-posta sunucularına ait e-posta adresleri kullanılarak hesap açılması ve ödeme işlemi gerçekleştirilmesi.

T-006-2.47: Riskli ülkeler veya off-shore merkezler ile bahis faaliyetlerinin yasal olduğu ülkeler veya bu ülke ve merkezlere ait cep telefonu numaraları ile işlem gerçekleşmesi

T-006-2.49: İşlem açıklama metninin anlamlı olmaması, ardışık, alfa-numerik veya tekrar eden karakterler içermesi veya “kumar, kmr, bahis, bhs, bet, betting, gambling, kacak, sanal bahis, snl, casino” gibi kelimelerin veya kısaltmaların kullanılması

T-006-2.66: Ödeme hesabının bakiyesinin, hesabın uzun vadeli ortalamasına kıyasla aniden ve önemli ölçüde değişmesi.

T-006-2.70: Müşteri adına veya hesabına kısa sürede çok sayıda kişiden düşük ve birbirine yakın tutarlarda aktarılan fonların yine çok sayıda kişiye gönderilmesi.

T-006-2.75: Müşteri tarafından sıklıkla farklı para birimleri kullanılarak işlem yapılması ya da nadir kullanılan para birimleri ile işlem yapmaya çalışması.

19-4-c: Kaybolmuş, çalınmış ya da yetkisiz kişilerce ele geçirilmiş kimlik doğrulama unsurlarının listesinde yer alan bir kimlik doğrulama aracı ile işlem yapılmaya çalışılması.

19-4-d: Müşterinin ödeme yaptığı kişinin daha önce dolandırıcılık kapsamına giren işlem gerçekleştirenler listesinde yer alması.

19-3: Düşük değerli olan ödeme işlemlerinin kısa bir süre içinde sıklıkla gerçekleştirilmesi ya da düşük değerli ödeme aracının kısa bir süre içinde sıklıkla kullanılması yüksek riskli işlem olarak değerlendirilir.

19-5: Kuruluş, yüksek riskli işlemleri filtreleyerek değerlendirir ve bu filtrelere takılan müşterileri daha yakından takip eder.

1. ## Kural Motoru

- Kurallar, tanımlı kapsamlarına göre (ENUM: fraud_scope) çalıştırılır. Kapsamı Onboarding olan kurallar, yeni bir müşterinin sisteme ilk kez tanımlanması sürecinde ve mevcut müşterilere ait kimlik, adres, iletişim bilgileri veya benzeri müşteri verilerinin güncellenmesi, KYC bilgilerinin girilmesi veya güncellenmesi gibi işlemler öncesinde işletilir. Kapsamı Remittance olan kurallar ise, müşterinin para yatırma, para çekme ve yurt içi veya yurt dışı tüm para transferi işlemlerinden önce işletilir.

- Kurallar yukarıdan aşağıya sırayla çalıştırılacaktır. Herhangi bir kural tetiklenirse sonraki kurallar çalıştırılmayacaktır.

- Aksiyon olarak sadece şu kümede olan kurallar işlem onaylandıktan sonra işletilebilir: AddRisk, NotifyCustomer, ContactCustomer. İşlem öncesi çalışması gereken kurallara Real-Time (Block Rules), işlemden sonra ama işleme yakın zamanda çalışması gereken kurallara Near Real-Time (Inform Rules) denir. Varsayalım ki son 10 kuraldaki tüm aksiyonlar Near Real-Time olsun; ilk kurallarda takılmamış bir işleme önce onay verilir, sonra bu 10 kural işletilir.

- Timeout süresi aşıldığında kuralların kalanı işletilmeden işleme onay verilir, ancak timeout aldığı için kaç kuralı işletmeden onay aldığı veritabanına kaydedilir ve daha sonra oluşturulan raporlara konu edilir. Ayrıca işlem onaylansa da Near Real-Time kurallar işletilir.

&nbsp;

1. # Doküman Yönetimi

Dosya yüklemelerinde sunucu tarafında; uzantı + content-type + gerçek mime doğrulaması birlikte uygulanır. Tarayıcı taraflı content-type’a güvenilmez. Mimetype sniffing engellenir ve indirme/görüntülemede güvenli header’lar kullanılır. Yüklenen tüm dosyalar antivirüs/malware taramasından geçirilir. Tarama tamamlanana kadar dosyaya statü atanmaz; tarama başarısızsa dosya karantinaya alınır ve kullanıma açılmaz. Dosya boyutu (max size), dosya sayısı (işlem başına/günlük), ve toplam upload hacmi limitlenir; limitler parametrelerden yönetilir. Office/PDF kuralları: Office dosyalarında makrolar engellenir veya makrolar temizlenmeden kabul edilmez. PDF/Office dosyalarında aktif içerik (script/embedded object) politikası uygulanır; desteklenmeyen içerik türleri reddedilir.

1. ## Metadata Katmanı

Her belge yüklenirken SHA-256 hash değeri oluşturulacak ve dms.document tablosunda saklanacaktır. Periyodik (örneğin aylık) "integrity check" ile storage'tan okunup tekrar hash'lenir, file_hash ile karşılaştırılır. Hatalı olanlar ile ilgili uyum görevlisine mail atılır.

Dosya isimlendirme: Yüklenen belgeler standart isimlendirilir. ID-Belge Türü (document_type tablosundaki Code alanı)-Timestamp. ID document_category ProofOfTransaction iken transactions.remittance.reference_no, diğer durumlarda entity ID (örneğin müşteri no) bilgisidir.

Temsilciler yalnızca sadece adına işlem yaptığı temsilcilikte yüklenilen belgeleri 1 (parametre olarak tanımlı) günlüğüne erişebilecektir. Genel Müdürlük personeli belge türüne göre yetkisi olan türlere erişebilecek (örneğin: "Kimlik Belgeleri" yalnızca Uyum Birimi tarafından görülebilir). Approve yetkisi olanın otomatik view yetkisi de vardır.

document_status ve approval_status: Bazı dokümanlar onay gerektirmediği için Approved yerine Active statüsü kullanılmıştır. Rejected, Expired ve Archived dokümanlar arşivde, Inactive ve Active dokümanlar canlı sistemde saklanır. Active ve Archived dokümanlar sistem açısından kullanılabilir dokümanlardır, diğer statülerdeki dokümanlar sistemde kanıt niteliği için saklanmaktadır. Doküman girişi esnasında girilen süreye gelindiğinde doküman arşive kaldırılır ve document_status = Expired olur.

Onay gerekmeyen belgeler için (approval_required = false ise) approval_status = NULL olur. Diğer belgeler (approval_required = true ise) için:

- İlk yüklemede: document_status = Inactive, approval_status = Pending

- Onaylanınca: document_status = Active, approval_status = Approved

- Reddedilince: document_status = Rejected, approval_status = Rejected

1. ## Workflow (İş Akışı)

Temsilci belge yüklediğinde iş akışı tetiklenecek, onay için ilgili genel müdürlük personeline görev atanacaktır.

Dokümanlarda çift onay akışı bulunmayacaktır. Doküman türü document_type.approval_required = false ise approval_status, approval_date ve approved_by null olur.

Reddedilen belge doğrudan arşive kaldırılacaktır. Status değeri rejected olup lokasyon olarak arşivdeki belgeler ile benzer lokasyona kaydedilecektir.

1. ## OCR

Kimlik belgesi OCR (Tesseract) işlemine tabi tutulacak. Çıkarılan metin ile ilgili servis çağırılacak ve MERNİS 'den gelen bilgiler ile otomatik kıyaslama yapılacak.

Kimlik belgesi yüklendiğinde temsilci sadece TCKN alanını doldurur. Diğer kimlik alanları otomatik dolar.

Kalitesiz OCR çıktısı (örneğin çok eksik karakter varsa) halinde belgenin yeniden taranması talep edilir. Yine kalitesiz gelirse kimlik belgesinin onaycısına ivedilikli manuel kontrol flag’i üretilir.

Taranan veriler ile MERNİS arasında fark varsa Uyum’a vaka açılır. Yüklenen belge, okunan değer ve MERNİS’ten gelen bilgi vaka içerisinde yer alır.

1. ## Doküman Yaşam Döngüsü Yönetimi

Süresi dolan belgeler otomatik olarak "Arşiv" lokasyonuna alınacak. Gerekirse imha politikaları uygulanabilecek. Arşivlenmiş belgelere yalnızca yetkili kullanıcılarca erişilebilir olacak. Dokümanın retention_period’ü dolduğunda aktif kullanımdan çıkarılır; archive_period sonunda ise imha/anomizasyon politikaları uygulanır.

&nbsp;

&nbsp;

1. # Entegrasyonlar

Entegrasyonların genel işleyişi, dış sistemlere gönderilen her bir isteğin yaşam döngüsünü yöneten standart bir durum (status) modeli üzerinden kurgulanır. Bu model, muhasebe, bankacılık, GİB, KYC, SMS gibi tüm dış entegrasyon kanalları için ortak olarak kullanılır. Amaç, farklı entegrasyonların teknik detaylarından bağımsız olarak, hepsi için aynı dili konuşan, izlenebilir ve yönetilebilir bir akış oluşturmaktır.

Her entegrasyon kaydı, sürece Pending (Beklemede) durumu ile başlar. Bu durum, ilgili işlemin entegrasyon kapsamına alındığını, ancak henüz payload hazırlama veya dış sisteme gönderim sürecinin başlamadığını ifade eder. Sistem, uygun zamanda bu kaydı işleme alarak bir sonraki aşamaya taşır.

Payload hazırlama süreci başladığında kayıt Preparing (Oluşturuluyor) durumuna geçer. Bu aşamada, dış sistemin beklediği formatta istek (request) hazırlanır; alan eşlemeleri yapılır, zorunlu alan kontrolleri tamamlanır. Hazırlama adımı başarıyla tamamlanırsa, kayıt Prepared (Oluşturuldu) durumuna alınır. Prepared, dış sisteme gönderilmeye hazır, teknik ve işsel ön kontrolleri geçilmiş bir isteği ifade eder.

Prepared durumundaki kayıtlar entegrasyon kanalı üzerinden dış sisteme gönderilmek üzere kuyruğa alındığında Sending (Gönderiliyor), gönderme işlemi başarıyla gerçekleştiğinde Sent (Gönderildi) olarak güncellenir. Sent, isteğin başarıyla karşı sistemin API’sine iletilmiş olduğunu, ancak işlemenin henüz dış sistem tarafından tamamlanmadığını gösterir. Bu aşamada sistem, asenkron olarak, dış sistemden gelen yanıtı veya durum güncellemesini bekler.

Dış sistem isteği başarıyla işlediğinde ve işlem sonucunun olumlu olduğu teyit edildiğinde kayıt Completed (Tamamlandı) durumuna geçer. Completed, söz konusu entegrasyon için terminal (nihai) durumdur; kayıt, ilgili dış sistemde kalıcı olarak işlenmiş, gerekirse referans numarası alınmış ve normal şartlar altında tekrar gönderim gerektirmeyen bir hale gelmiştir.

- Pending → Preparing → Prepared → Sending → Sent → Completed

Hazırlık veya gönderim aşamalarında hata oluşması halinde, süreç ilgili hata tipine göre dallanır. Eğer istek oluşturma aşamasında teknik veya iş kuralı kaynaklı bir problem yaşanırsa (zorunlu alan eksikliği, yanlış format, mapping hatası vb.), kayıt ErrorPrepare (Hata: Oluşturulamadı) durumuna alınır. Eğer payload oluşturulabilmiş ancak dış sisteme gönderim sırasında hata oluşmuşsa (ağ hatası, timeout, karşı sistemden 4xx/5xx hata kodları vb.), durum ErrorSend (Hata: Gönderilemedi) olarak güncellenir. Veri tutarsızlığı, iş kuralı ihlali veya manuel müdahale gerektiren nitelikte bir problem söz konusuysa (örneğin yanlış müşteri, geçersiz hesap kodu, tanımsız para birimi gibi) kayıt ErrorData (Hata: Data) durumuna getirilir. Error\* için entegrasyondaki tekrar deneme politikasına göre otomatik Retrying'e geçilebilir, kullanıcı tetiklemesi ile manüel Retrying yapılabilir.

Hata durumundaki kayıtlar, sistem tarafından otomatik veya kullanıcı tarafından manuel olarak yeniden denenebilir. Yeniden deneme süreci başlatıldığında kayıt Retrying durumuna geçer. Sistem öncelikle ilgili isteğin dış sistemde zaten oluşup oluşmadığını kontrol eder. Dış sistemde ilgili işlem kaydı zaten varsa, entegrasyon kaydı doğrudan Completed statüsüne alınır ve tekrar gönderim yapılmaz. İstek dış sistemin entegrasyon kuyruğunda bekliyorsa, mükerrer işlem oluşturmamak için yeniden tetikleme yapılmaz. Dış sistemde hiçbir kayıt bulunmuyorsa, entegrasyon süreci yeniden başlatılır. Önceki statü ErrorPrepare, ErrorData veya OnHold ise Preparing aşamasından itibaren, ErrorSend ise Sending aşamasından itibaren sistem işletilir. Yeniden deneme sonucunda entegrasyon başarıyla tamamlanırsa kayıt Completed durumuna geçer; hata devam ederse ilgili Error\* durumuna geri döner ve retry politikaları (deneme sayısı, süre, limitler) çerçevesinde işlem görür.

- Preparing → ErrorPrepare → Retrying/OnHold/Canceled

- Prepared/Sending → ErrorSend → Retrying/OnHold/Canceled

- Sent → ErrorData → Retrying/OnHold/Canceled

Bazı kayıtlar ise, sistem veya operasyon kararı gereği geçici olarak durdurulabilir. Bu durumda kayıt OnHold (Durduruldu) durumuna alınır. OnHold, otomatik yeniden deneme veya gönderim yapılmaması gereken, manuel inceleme, ek onay veya dış bir koşulun gerçekleşmesini bekleyen kayıtları temsil eder. OnHold durumundan, blokaj kaldırıldığında kayıt tekrar Retrying veya uygun başka bir ara duruma alınarak sürece devam ettirilebilir ya da gerekli görülürse iptal edilebilir.

Entegrasyon süreci belirli bir noktadan sonra hiç devam ettirilmeyecekse, yani ilgili kayıt için dış sistemde işlem yapılmaması gerektiğine karar verilmişse, durum Canceled (İptal Edildi) olarak güncellenir. Canceled, Completed gibi terminal bir durumdur; bu kayda ilişkin entegrasyon süreci kapatılmış olur ve sistem tarafından yeniden işlenmez. Bu durum, örneğin iptal edilen işlemler veya tamamen geçersiz hale gelmiş kayıtlar için kullanılır.

- Retrying → Preparing/Sending

- OnHold → Retrying/Canceled

Bu statü modeli, tüm dış entegrasyonlar için ortak bir yaşam döngüsü sağlar. Böylece farklı entegrasyon kanallarında çalışan süreçler, aynı statü seti üzerinden izlenebilir, raporlanabilir ve yönetilebilir hale gelir; operasyon, yazılım geliştirme ve izleme ekipleri için tutarlı ve anlaşılır bir entegrasyon çerçevesi oluşturulur.

Entegrasyon durumlarının izlendiği ekranlar entegrasyon servisinden gelen verilerle otomatik olarak doldurulur. Tablo, yalnızca bu özet alanları içerir; yatay scroll kullanımını engellemek ve okunabilirliği artırmak amacıyla detay niteliğindeki alanlar tabloya eklenmez. İşleme ilişkin ilgili dış sisteme gönderilen ve sistemden alınan ham JSON mesajları view butonu tıklandığında açılan detay panelinde gösterilir. Varsayılan olarak en yeniden en eskiye doğru sıralanır.

Ekranda kullanıcıdan beklenen temel işlem, entegrasyon sürecindeki işlemlerin detayları incelenerek gerektiğinde

- Error\* durumundaki kayıtlar için Tekrar Dene (Retrying), İşlemi Durdur (OnHold) ve İptal Et (Canceled)

- OnHold durumundaki kayıtlar için ise Tekrar Dene (Retrying) ve İptal Et (Canceled)

aksiyonlarından uygun olanını tetiklemektir. Bu tip ekranlarda, Actions kolonunda Update ve Delete butonu bulunmaz, bunun yerine gereken kolonlarda Tekrar Dene, İşlemi Durdur ve İptal Et butonları bulunur.

&nbsp;

1. # Log Kayıtları

Finansal sonuç doğuran işlemlere, müşteri bilgilerine gerçekleştirilen fiziksel veya mantıksal erişimler ile yetkisiz erişim teşebbüslerine, user hesaplarındaki ve yetkilerindeki değişikliklere, hassas bilgiler üzerinde sorgu amaçlı yapılan ve hiçbir değişikliğe sebep olmayan işlemlere, katmanlı yapılarda her bir katmanda hatalara, konfigürasyon ve parametre güncellemelerine ilişkin loglar tutulmalıdır.

Loglar işlemlerin başından sonuna kadar izlenmesine olanak tanımalıdır. Ayrıca, uygulamayla ilişkili ihlal olaylarının kim tarafından ve ne zaman gerçekleştirilmiş olduğunun anlaşılmasında kullanılabilecek detay seviyesinde log tutulmalıdır. Hassas veriler (PIN, parola, kart numarası, kimlik doğrulamada kullanılabilen diğer bilgiler, kriptografik anahtarlar gibi) asla tam haliyle loglarda yer almamalıdır, sadece maskelenmiş olarak loglanabilir.

Loglanacak verinin kötü amaçlı script / kod içermediğinden (XSS, injection gibi saldırıları engellemek için) emin olunur. Mesaj gövdesi PII içerebileceğinden log ekranında maskelenmiş özet gösterilir; tam içerik sadece yetkili roller tarafından ve gerekçeli erişimle görüntülenebilir. Log görüntüleme yazılımlarında bu özellik mevcuttur. Örneğin, ELK Kibana veya Logstash katmanlarında maskeleme yapılabilmektedir.

Loglar asgari olarak şu detayları içermesi beklenir:

- Başarılı erişimler ve başarısız erişim teşebbüsleri

- İşlemi gerçekleştiren uygulama (ödeme aracıyla gerçekleştirilen işlemler için ödeme aracını ayırt edici bilgi)

- İşlemi gerçekleştiren ve varsa onaylayan kişiler (müşterinin belli olmadığı ödeme araçlarıyla gerçekleştirilen işlemler hariç)

- İşlemin açıklaması, finansal sonuç doğuran işlemlerde, işleme konu tutar bilgisi

- Yapılan işlemin zaman bilgisi (varsa onaylama zamanları)

- İşlemin olumlu veya olumsuz sonucu (varsa hata kodu)

- İşlemin kaynağı (IP adresi vs.)

- Etkilenen veri ve sistemlerin bilgisi

- Değişiklikler için eski ve yeni değerler (Eski değer yalnızca gizli olmayan alanlarda tutulur, parola, PIN, token, gizli anahtar gibi bilgilerde sadece “değişiklik yapıldı” bilgisi tutulur.)

&nbsp;

1. # Idempotency ve Retry Güvenliği

Aşağıdaki geliştirmeler; veri değiştiren ve özellikle finansal etkisi bulunan veya status geçişi yapan servislerde uygulanacaktır. Amaç, aynı isteğin tekrar gönderilmesi (timeout, ağ kesintisi, kullanıcı tekrarı vb.) veya eşzamanlı işlemler nedeniyle çift işlem/çift kayıt oluşmasını engellemektir.

- İstemciden, tercihen header’da Idempotency-Key; alternatif olarak request body içinde requestId alınacaktır.

- Aynı Idempotency-Key ile gelen tekrar isteklerde servis davranışı aşağıdaki gibi olacaktır:

- Aynı Idempotency-Key ile farklı içerik (farklı request payload) gönderilmesi durumunda istek 409 ile reddedilir.

- İşlem daha önce başarıyla tamamlandıysa aynı sonucu döndürür ve çift kayıt oluşturmaz.

- İşlem daha önce hata ile sonuçlandıysa, retry edilebilirlik politikasına göre (ör. belirli hata sınıfları için) yeniden denenebilir veya aynı hata sonucu döndürülebilir.

- İşlem halen devam ediyorsa 409 veya 202 benzeri kontrollü bir yanıt döndürür ve “işleniyor” bilgisini sağlar.

- Tekrar denemelerde istemci aynı Idempotency-Key’i kullanmalıdır. Tek bir iş ihtiyacı/işlem için bir anahtar üretilmeli ve tüm retry denemeleri boyunca aynı anahtarla çağrı yapılmalıdır.

- Sunucu tarafında idempotency kayıtlarının tutulacağı merkezi bir tablo (ör. dedup_store) oluşturulmalı; kayıtların ne kadar süre saklanacağına ilişkin TTL (Time To Live – kaydın geçerlilik/saklama süresi) ve temizlik mekanizması (otomatik silme/retention job vb.) tanımlanmalıdır.

- DEDUP_STORE: idempotency_key (unique), endpoint, request_hash (aynı key ile farklı body gelirse yakalamak için), status (IN_PROGRESS, SUCCEEDED, FAILED), response_ref, external_ref_id (örn. claimId/paymentId), expires_at.

- Standart hata davranışı ve izlenebilirlik:

- 400: eksik/yanlış idempotency key veya geçersiz request

- 409: aynı key ile farklı request, concurrency conflict veya işlem halen devam ediyor

- 202: işlem asenkron ise “kabul edildi, işleniyor”

- 200/201: başarı

&nbsp;

1. # Inhouse Sanction Screening (Faz-2)

Faz-2 kapsamında, üçüncü taraf sanction screening servislerine bağımlılığı azaltmak ve veri/algoritma kontrolünü kuruma almak amacıyla inhouse yaptırım tarama (sanction screening) altyapısı devreye alınacaktır. Bu fazda temel yaklaşım; OpenSanctions'dan (<https://www.opensanctions.org/>) düzenli veri indirerek, kuruma ait bir watchlist veri katmanı oluşturmak ve taramayı bu katman üzerinden gerçekleştirmektir. İlerleyen dönemde eksik kalan veri kaynakları (ülkemizce yayınlanan sakıncalılar listelerinden OpenSanctions bünyesinde olmayanları) gap analizi ile tespit edilerek, aynı mimariye uygun biçimde sisteme ilave edilecektir; ancak ana veri kaynağı ve master watchlist omurgası OpenSanctions kaynaklı olacaktır.


1. ## Veri Yükleme

Veri sisteme alındığında tarama kalitesini artırmak ve operasyonel false-positive/false-negative risklerini azaltmak için aşağıdaki süreçler yükleme sırasında zorunlu olarak uygulanacaktır:

Versiyonlama ve izlenebilirlik: Her veri yükleme çalışması (ham veri, tarih, kaynak, checksum, kayıt adedi, değişim adedi) zaman damgası ile saklanır; gerektiğinde önceki versiyona geri dönüş yapılabilir.

Normalize etme (Normalization): Farklı kaynaklardan gelen alanların tek bir şemaya dönüştürülmesi (ad, tarih, ülke, kimlik, adres vb.), karakter ve format standardizasyonu (büyük-küçük harf, diakritik, noktalama, ülke kodları, tarih formatları).

Tekilleştirme (Deduplication / Entity Resolution): Aynı kişi/kurumun farklı listelerde veya aynı liste içinde farklı varyasyonlarla tekrar eden kayıtlarının bir “master entity” altında birleştirilmesi; böylece mükerrer alarmların azaltılması ve tek vaka üzerinden yönetim.

Alternatif Yazımlar (Aliases): İsim varyasyonları, transliterasyonlar, farklı dil/alfabe yazımları, kısaltmalar ve “aka/also known as” bilgileri üzerinden alternatif ad setlerinin oluşturulması ve arama indeksine dahil edilmesi.

İlişkilendirme (Relationships / Linking): Kişi–kurum ilişkileri (ownership/UBO, yönetici, bağlı ortaklık, associate vb.) ve listeler arası referansların ilişki grafı şeklinde modellenmesi; screening sonucunda yalnızca doğrudan eşleşme değil, ilişkili eşleşmelerin de risk değerlendirmesine girdi olabilmesi.

**Normalize Etme**

- Alan adları: DOB / DateOfBirth / Birth date

- Veri tipleri: Tarih formatları (DD.MM.YYYY vs YYYY-MM-DD), ülke kodları (TR/TUR/Türkiye), para birimleri, cinsiyet vb.

- Metin temizliği: Gereksiz boşluk, noktalama, büyük-küçük harf

- Özel karakter: İ/ı, ş, ğ

- İsim parçalama: “DOE, JOHN MICHAEL” → first_name=John, last_name=Doe, middle_name=Michael

- Adres standardizasyonu: “Istanbul / İstanbul / IST” → aynı temsile çekmek.

**Tekilleştirme**

- Aynı kişi/kurumun aynı kaynak içinde veya farklı kaynaklar arasında birden fazla kaydını bulup birleştirmek.

- Doğum tarihi, pasaport no, ülke, adres, unvan gibi ipuçlarıyla bunların aynı kişi olduğuna karar verilip tek “master entity” altında toplanması.

**Alternatif Yazımlar**

- Transliterasyon: “Muhammad / Mohammed / Mohammad”

- Yerel yazımlar: “İstanbul / Istanbul”

- Lakab / takma ad: “Abu …”, “aka …”

- Şirket kısaltmaları: “A.Ş. / AS / Inc / Ltd”

- Dil/alfabe dönüşümü: Arapça/Kiril’den Latine farklı çevrimler

**İlişkilendirme**

- Ownership / UBO ilişkileri: Şirket A’nın %60 sahibi B, B’nin sahibi C…

- Aile/bağlantı ilişkileri: “spouse, sibling, associate”

- Aynı adres/telefon/cihaz/IP gibi ortak sinyaller

- Sanctions program/authority bağlantısı: “OFAC SDN – program: XYZ”

- Listeler arası bağlantı: “Bu entity UN’deki şu kaydın AB’deki karşılığı”

1. ## Arama ve Eşleştirme

Tarama motoru, yalnızca birebir eşleşmeye dayanmayan, toleranslı (fuzzy) eşleştirme yeteneğine sahip olacaktır. Kullanıcı arayüzünde eşleştirme toleransı % olarak belirlenebilir (örn. %80, %90). Bu eşik, isim/alias/adres gibi alanlarda fuzzy skorlamayı etkiler.

**Arama öncesi girdi temizliği**

Trim, çoklu boşlukları tek boşluğa indir. Case-fold (küçük harfe çevir). Noktalama temizliği (.,-,' vb.). Diakritik normalize (ç,ğ,ı,ö,ş,ü → c,g,i,o,s,u). Tokenization: kelimelere böl. Stopword (opsiyonel): "ltd, a.ş., inc" gibi organization suffix’leri ayrı kural setiyle ele alınır. Kişilerin ad ve soyadları ayrı tutulur, kullanıcı tek alan girdiyse "full name" olarak kabul edilir.

**Arama Mantığı (Hangi alan girildiyse onunla)**

Arama, kullanıcının verdiği alanlara göre otomatik “kademeli daraltma” yapar:

- Sadece ad/ünvan girildiyse: Arama yalnızca Name/Unvan üzerinden yapılır. Fuzzy matching devrededir (threshold’a göre). Sonuçlar skorlanır ve listelenir.

- Ad + Doğum Tarihi girildiyse: Arama Name/Unvan + DOB ile yapılır. Skorlama DOB sinyalini de içerir (DOB uyuşmazsa skor düşer; exact DOB match güçlü artırır). Uygulama NOTU: DOB girildiğinde sistem “yalnız DOB match olanları getir” şeklinde hard filter uygulamaz; bunun yerine DOB’yi skorlayıcı sinyal olarak kullanır. (Hard filter sadece “ExactOnly” modunda uygulanır.)

- Ad + Kimlik No girildiyse: Kimlik No watchlist kaydında varsa, deterministik eşleşme önceliklidir. Kimlik No exact match varsa sonuçlar en üste taşınır ve “Exact ID match” etiketi konur. ID match yoksa Name fuzzy ile devam eder.

- Ad + Ülke/Nationality girildiyse: Country/Nationality varsa skorlamaya dahil edilir. Ülke bilgisi girilmişse ve watchlist kaydında ülke bilgisi de varsa; uyumluysa skor artar, uyumsuzsa skor azalır, watchlist’te ülke yoksa nötrdür.

- Ad + Alias/AKA kapsamı: Arama her zaman watchlist’in name + alias alanlarını kapsar. Sonuçlarda “hangi alan eşleşti” (primary name mi alias mı) etiketi gösterilir.

**Arama Örnekleri (Davranış Netliği)**

- Örnek 1: Kullanıcı “Ahmet Yılmaz” girdi. Sadece Name fuzzy çalışır. Threshold 85 ise TotalScore≥85 olanlar döner.

- Örnek 2: Kullanıcı “Ahmet Yılmaz”, DOB=01.01.1980 girdi. Name + DOB skoru birlikte hesaplanır. DOB exact ise güçlü yükseltir; mismatch ise düşürür. Watchlist’te DOB yoksa DOB sinyali devre dışı kalır.

- Örnek 3: Kullanıcı “Ahmet Yılmaz”, PassportNo=U1234567 girdi. ID exact match varsa en üstte. ID yoksa Name üzerinden devam.

1. ## Harici İstihbarat Beslemeleri

Risk ve Uyum ekranlarında kullanılan RiskyCountries ve RiskyIPs listelerini doldurmak için otomatik entegrasyonların geliştirilmesidir.

Tor exit node ve bilinen proxy/VPN/anonymous IP kaynakları için düzenli besleme entegrasyonu yapılır; veri çekimi API/HTTP(S) download yöntemleriyle, konfigürasyon tablosunda tanımlı kaynaklardan gerçekleştirilir. Veri sisteme alındığında IP ve CIDR formatları normalize edilir; mükerrer kayıtlar tekilleştirilir; her kayıt kaynağıyla etiketlenir (source_tag) ve aktif versiyon altında yayınlanır.

RiskyCountries listesi en az FATF “Call for Action (black list)” ve “Jurisdictions under Increased Monitoring (grey list)” yayınları baz alınarak güncellenir; ayrıca BM/AB/OFAC yaptırım listeleri ve kurum içi istihbarat kaynakları ile zenginleştirilebilir. FATF güncellemeleri her yayınlandığında (örn. 24 Ekim 2025 güncellemesi) sistemde karşılığı oluşturulmalı ve aktif versiyona yansıtılmalıdır; bu amaçla periyodik “yeni yayın kontrolü” veya manuel yükleme mekanizması sağlanır.

Güncelleme periyodu varsayılan günlük olacak şekilde planlanır; ayrıca manuel “güncelle” tetikleme imkânı bulunur. Her güncelleme snapshot mantığıyla saklanır; yürürlük başlangıç tarihi, kaynak referansları ve değişen kayıtların dif’i izlenebilir olmalıdır.

Yanlış/erken güncelleme riskine karşı yeni versiyon tek tıkla pasife alınabilir; önceki versiyona rollback yapılabilir ve bu işlemler log’da izlenir.

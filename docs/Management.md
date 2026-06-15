BACK-OFİS

&nbsp;

&nbsp;

1. # Ana Sayfa – Dashboard

Son başarılı girişten sonra başarısız erişim teşebbüsü tespit edilmesi halinde kullanıcıya bilgilendirme mesajı gösterilir.

Dashboard üzerindeki her widget için rol bazlı görünürlük ve detay seviyesi tanımlanır.

Dashboard’taki bekleyen iş widget’ları birbirini dışlayacak şekilde tanımlanır. Örneğin AML kontrolüne takılan işlemler Bekleyen Transferler widget’ına dahil edilmez ve yalnızca "AML Kontrollerine Takılan Transferler" altında gösterilir.

Dashboard tutar metrikleri raporlama para birimi olarak TRY üzerinden gösterilir. Çoklu para birimindeki işlemler, işlem gerçekleşme anındaki kur ile TRY’ye çevrilerek raporlanır.

İlk girişte görülmesi istenen widget’lar için aşağıda çeşitli örnekler hazırlanmıştır, ancak bunlar yazılımda ilk aşamada bulunmayacaktır. Sadece yapının oluşturulması beklenmektedir.

- Onayımı Bekleyen İşler

- Bekleyen Transferler

- KYC Manuel Doğrulama Talepleri

- AML Kontrollerine Takılan Transferler

- Reddedilen/İptal Edilen İşlemler

- Başarılı ve Başarısız Günlük İşlem Adet ve Tutarları Grafikleri

- Günlük Yeni Müşteri Adet Grafiği

- Gün içerisinde en fazla para gönderen 10 müşteri ve tutarları

- Gün içerisinde en fazla para alan 10 müşteri ve tutarları

- Gün içerisinde en fazla para çeken 10 müşteri ve tutarları

- Gün içerisinde en fazla para alan 10 temsilci ve tutarları

- Gün içerisinde en fazla para veren 10 temsilci ve tutarları

- Sistem Hataları (Örneğin; gün içerisindeki başarılı istek oranı, en çok hata üreten 3 servis, p95 / p99 latency (en kritik 3 endpoint))

&nbsp;

**Ayarlar**

- Sağ üstte gözükür, menüde yer almaz.

- Parola: Eski Parola, Yeni Parola, Yeni Parola (Tekrar), Hangi Sıklıkla Güncellensin (Combobox: 1 Ay, 3 Ay, 6 Ay)

- Karşılama Mesajı: Phishing önlemi olarak kullanıcıya özgü karşılama mesajı

- Uygulama Ayarları: Dil Tercihi, Tema (Açık, Koyu), Metin Boyutu (Küçük, Standard, Büyük, Ekstra Büyük)

- Hatalı Girişler

&nbsp;

1. # Müşteriler

- Müşteri No, Adı ve Soyadı / Unvanı, E-posta, Telefon, Kimlik No, Müşteri Tipi (ENUM: customer_type), Kampanya, KYC Durumu (ENUM: bireysel müşteriler için kyc_level tüzel müşteriler için approval_status), Risk Skoru, Risk Segmenti, Oluşturma Tarihi, Status (ENUM: entity_status) kolonlarının olduğu, tüm müşterilerin listelendiği bir tablo. Status değeri Blocked (ENUM: entity_blockage_reason) veya Closed (ENUM: entity_closure_reason) ise gerekçesi de yanına tire eklenerek yazılır, örneğin Bloke – Belge Eksik, Kapalı – Uzun Süre Kullanılmama, gibi.

- Müşteriler ekranı varsayılan olarak ‘Aktif Müşteriler’ filtresiyle açılır. Kullanıcı isterse ‘Tümü’ seçeneği ile tüm kayıtları listeleyebilir.

1. ## Yeni Bireysel Müşteri

- Butonlar: Müşteri Aktiviteleri (müşteri işlem geçmişi), Bloke Et, Bloke Kaldır, Belge Yükleme, Belge Görme/İndirme, Taslak Kaydet (daha sonra devam etmek için), Kaydet, Vazgeç (Değişiklik varsa “Kaydetmeden çıkılsın mı?” uyarısı.)

- Adı ve Soyadı, Kimlik No, Kimlik Tipi (ENUM: identity_document), Kimlik Ülkesi (Uyruğu), Doğum Tarihi, Müşteri Tipi (Bireysel, Aday Müşteri).

- Müşteri Bilgileri Paneli: Müşteri No (değiştirilemez), Kampanya (combobox – kampanyalar listelenir), Kampanya Sonlanma Tarihi (otomatik gelir, değiştirilemez), KYC Seviyesi (ENUM: kyc_level), Risk Skoru, Risk Segmenti (ENUM: level), Oluşturma Tarihi, Status (ENUM: entity_status). Status değeri Blocked (ENUM: entity_blockage_reason) veya Closed (ENUM: entity_closure_reason) ise gerekçesi de yanına tire eklenerek yazılır, örneğin Bloke – Belge Eksik, Kapalı – Uzun Süre Kullanılmama, gibi.

- Erişim Bilgileri: Son Login (tarih-saat), Başarısız Erişim Teşebbüsü Sayısı (son login olduktan sonra), Cihaz Bilgileri, IP Lokasyonu. Servisten gelir değiştirilemez.

- Banka Hesapları Paneli: Banka, IBAN, Para Birimi, Şube Kodu, Hesap No, Ek No, Varsayılan Hesap Mı (checkbox), Status (ENUM: entity_status) kolonlarından oluşan banka hesap bilgilerinin tutulduğu ve yeni eklemelerin yapıldığı tablo. Her para biriminden sadece 1 adet varsayılan hesap seçilebilir, varsayılan seçilince aynı para birimindeki diğerlerinde otomatik kaldır ve kullanıcıya bilgi mesajı dönülür. Yabancı banka hesabı girişi yapılamaz.

- Finansal Bilgiler Paneli: No, Bakiye, Para Birimi, Bloke Miktarı, Günlük İşlem Adedi, Günlük İşlem Tutarı kolonlarının olduğu, müşterinin cüzdanlarının listelendiği tablo. Bu ekranda ürün bilgileri üzerinde değişiklik yapılamaz. Ürün bilgilerinde güncelleme yapılması gerektiğinde, kullanıcıya ilgili ürünün yönetildiği ekrana yönlendirme sağlayan bir bağlantı sunulur ve değişiklik işlemleri bu ekran üzerinden gerçekleştirilir.

- Nüfus Bilgileri Paneli: Doğum Yeri, Medeni Durum (ENUM: marital_status), Seri No / Doküman No, Veriliş Tarihi, Veren Makam, Geçerlilik Tarihi, Anne Adı, Baba Adı, Cinsiyeti (ENUM: gender).

- Detay Bilgiler Paneli: Evlenmeden Önceki Soyadı, Vergi Ülkesi, Eğitim Durumu (ENUM: education_level), Çalışma Durumu (ENUM: employment_category), Mesleği (ENUM: employment_occupation), Çalıştığı Kurum, Dil Tercihi, Notlar.

- Yabancı Müşteri Paneli: Vize Tipi (ENUM: visa_type), Vize Bitiş Tarihi, Oturum İzni, Oturum İzni Bitiş Tarihi, Doğum Ülkesi, Yerleşik Olduğu Ülke. Sadece yabancı müşterilerde görülür.

- Adres Paneli: Adres Adı, Tipi (ENUM: address_type), Ülke (combobox), İl (Türkiye ise combobox), İlçe (Türkiye ise combobox), Mahalle/Semt (Türkiye ise combobox), Cadde, Sokak, Bina No, Daire No, Posta Kodu, UAVT No (sadece Türkiye ise görülür ve otomatik çekilir), Ek Bilgiler (Apartman adı, site adı veya diğer açıklamalar...), İrtibat Adresi (checkbox). Ülke Türkiye değilse; Ülke, İl, İlçe, Posta Kodu, Adres (textarea) olarak adres bilgisi alınır, diğer bilgiler alınmaz. Müşterinin birden fazla adresi olabilir. Bir tanesini irtibat adresi seçmesi gerekmektedir.

- İletişim Bilgileri Paneli: İletişim Adresi, Asıl Adres (checkbox), Durum (ENUM: status), Actions (Tekrar Gönder, Düzenle, Sil) kolonlarını içeren ve E-posta ve Telefon bilgilerinin tutulduğu tablo. Tekrar Gönder aksiyonu, doğrulanmış satırlarda tetiklenirse kullanıcıya uyarı gösterilir: "İletişim adresi zaten doğrulandı!". Birden fazla e-posta ve telefon bilgisi eklenebilir. Telefonlardan 1 tanesi ve e-posta adreslerinden 1 tanesi asıl iletişim kanalı seçilmelidir. Kullanıcı bir satırı Asıl seçtiğinde, aynı kanaldaki önceki asıl otomatik olarak kaldırılır; sistem eski asıl adrese bilgilendirme gönderir: "Asıl iletişim adresiniz değiştirildi!" ve kullanıcıya UI’da bilgi mesajı gösterir. Kullanıcı yeni satır ekleyebilir, mevcut satırları düzenleyebilir veya silebilir. Silme ve iletişim adresinin güncellenmesi (adres alanı değişimi) işlemlerinde sistem, değişiklik öncesi (eski) adrese bilgilendirme gönderir: "İletişim adresiniz güncellendi!". (Asıl değişikliğinde ayrıca bilgilendirme zaten gönderilir.) Yeni satır ekleme esnasında tablonun altında yeni ve boş bir satır açılır; satır güncellemede mevcut bilgiler değiştirilebilir şekilde gösterilir; her ikisinde de satırın en sağında Kaydet ve İptal ikonları yer alır. Ekleme ve adres değişikliği içeren güncelleme esnasında yeni irtibat bilgileri doğrulanmalıdır. E-posta adresi doğrulama linki ile, Telefon numarası OTP ile doğrulanır. Kullanıcı girişi tamamladıktan sonra ilgili satırın sağında yer alan Kaydet ikonunu tetikler. Satır Telefon ise Doğrulama Modal’ı açılır (Doğrulama Kodu alanı ve Tekrar Gönder, Doğrula, İptal butonları). Doğrulama başarılı oluncaya veya kullanıcı İptal’e basıncaya kadar modal kapanmaz. İptal’e basılırsa modal kapanır ve satır Kaydet öncesi haline döner. Sabit telefonlar doğrulanmaz ve Asıl seçilemez. Tekrar Gönderme rate limit ile kısıtlanır (saniyede 1 adet, bir adres için 5 adet)

- İşlem Limitleri Paneli: İşlem özelinde müşteriye limit koyulabilen panelidir: İşlem Limiti, Günlük İşlem Limiti, Aylık İşlem Limiti.

- Müşteri olmayan ilişkili kişiler aday müşteri olarak kayıt altına alınır.

- Türk vatandaşları TCKN ve doğum tarihi bilgilerini verdiğinde Nüfus Bilgileri Paneli KPS’den otomatik dolar ve değiştirilemez.

- Yeni müşteri girişlerinde Müşteri Bilgileri Paneli, Erişim Bilgileri, Finansal Bilgiler Paneli ve İşlem Limitleri Paneli gösterilmez.

- Müşteri Tipi Aday Müşteri olan kayıtlarda Finansal Bilgiler Paneli ve İşlem Limitleri Paneli gösterilmez.

- Kimlik No bilgisi girildikten sonra bu kimlik ile müşteri tanımı var ise mevcut bilgiler ile ekran doldurulur. Bu durumda eksik bilgiler girilebilir. Uyruğu Türkiye olan müşterilerde Nüfus Bilgileri Paneli değiştirilemez, bunun dışındaki durumlarda bilgilerde değişiklik yapılabilir.

- Daha önce tanımlı müşteri yoksa TCKN ve doğum tarihi bilgisi girildikten sonra yerli müşteriler için KPS’den kimlik bilgileri gelir ve Nüfus Bilgileri Paneli doldurulur. Nüfus Bilgileri Paneli bu müşteriler için değiştirilemez.

- Nüfus Bilgileri Paneli, Temsilci uygulamasında kimlik belgesi yüklemesi ikinci taba geçmeden zorunlu tutulduğu için taranan kimlik üzerinden OCR ile otomatik doldurulur. Back-ofis uygulamasında ise tek sayfa (single page) olduğundan, belge yükleme adımına bağımlı bir akış kurgulanmadığı için Nüfus Bilgileri Paneli KPS’den otomatik doldurulur. Back-ofis ekranı da tablı/adım adım yapıya dönüştürülürse, "Nüfus Bilgileri" taba geçiş öncesi kimlik belgesi yüklemesi zorunlu hale getirilir ve Nüfus Bilgileri Paneli OCR çıktısından doldurulur.

- Yeni müşteri oluşturma esnasında kullanıcı Kaydet butonuna bastığında sistem, zorunlu alanlar için yaptığı kontrollerden sonra belge kontrolü yapar; kişinin asgari olarak Identity kategorisinde onay gerektirmeyen veya onaylanmış (approval_required = false veya approval_status = Approved) belgesi olmalıdır. Son olarak da kimlik doğrulama ve sanction/kara liste/IBAN kontrollerini otomatik biçimde arka planda başlatır. Kimlik doğrulama kapsamında, taranan kimlik belgesinin OCR ile elde edilen alanları KPS’den dönen kimlik bilgileri ile karşılaştırılır. Bu kontroller için kullanıcıdan ayrıca bir aksiyon (ayrı bir butona basma, ayrı bir ekran/işlem başlatma gibi) beklenmez.

- Mevcut müşteri güncelleme esnasında Nüfus Bilgileri Paneli'nde değişiklik yapılmışsa, Kaydet’e basıldığında sistem kimlik doğrulama ve sanction/kara liste kontrolünü otomatik olarak tekrar çalıştırır. Bunun dışında müşterinin KYC seviyesinin yükselmesi, adres ve ülke bilgilerinin değişikliği sanction/kara liste kontrolü tamamlanıp sonuç “uygun/temiz” olarak doğrulanmadan gerçekleştirilemez; kişinin kara liste kaydına rastlanırsa Status’u Blocked yapılır. Bunlar dışındaki değişikliklerde Kaydet butonunda kimlik doğrulama ve sanction/kara liste kontrolleri tetiklenmez.

- Taslak olarak kaydedilmiş müşterilerin statüleri Inactive olur.

- Belge Yükleme modalında Ekle ve İptal butonu bulunur. Form panelinde ise Belge Kategorisi (ENUM: document_category), Belge Türü (combobox – seçilen belge kategorisi için tanımlanmış belge türleri), Geçerlilik Süresi (bu alana valid_from – valid_until şeklinde iki tarih girişi yapılabilir), Dosya (Browse) alanları yer alır. Belge Görme/İndirme butonuyla ise Doküman Yönetim Sistemi sayfası müşteri numarası filtrelenmiş biçimde açılır.

- Bloke Et / Bloke Kaldır butonları, müşterinin sistem üzerindeki işlem yapma yetkisinin geçici veya kalıcı olarak kısıtlanmasını ya da yeniden aktif hale getirilmesini sağlar. Bloke Et ve Bloke Kaldır işlemleri yetki bazlıdır. Buton tetiklendiğinde açılan modal ile bloke etme/kaldırma nedeni kullanıcıdan alınır ve işlemi yapan kullanıcı ile tarih / saat bilgileri birlikte kayıt altına alınır.

- Bloke Et butonu tetiklendiğinde müşterinin status değeri Blocked olarak güncellenir. Böylelikle müşteri adına yeni işlem başlatılması engellenir; ancak devam eden veya daha önce tamamlanmış işlemler geriye dönük olarak etkilenmez. Sistem, bloke durumundaki müşteriler için işlem başlatılmasını servis seviyesinde de engeller (yalnızca UI değil, backend kontrolü).

- Bloke Et modal'ında opsiyonel olarak bir Bloke Bitiş Tarihi girilebilir. Bloke Bitiş Tarihi gün bazlıdır, saat bilgisi içermez. Bloke Bitiş Tarihi girilmemesi durumunda blokaj süresiz (kalıcı) olarak değerlendirilir. Bloke Bitiş Tarihi yalnızca ileri tarih olabilir. Girilen Bloke Bitiş Tarihi’ne ulaşılması durumunda, günlük çalışan batch süreç tarafından ilgili müşterinin blokajı otomatik olarak kaldırılır ve müşterinin status değeri Active olarak güncellenir.

- Bloke Kaldır butonu manuel olarak tetiklendiğinde, varsa tanımlı Bloke Bitiş Tarihi dikkate alınmaksızın müşterinin status değeri Active olarak güncellenir ve müşteri tekrar işlem yapabilir hale gelir.

- Bakiye Blokesi işlemleri (belirli bir tutarın bloke edilmesi), yalnızca Dijital Cüzdan ekranı üzerinden gerçekleştirilir. Müşteri ekranı üzerinden yapılan bloke işlemleri tam bloke niteliğindedir ve müşterinin tüm işlem yapma yetkisini kapsar.

|     |     |     |
| --- | --- | --- |
| Alan | Kontroller | Hata Mesajı |
| Adı ve Soyadı | \- Boş bırakılamaz. - En az 2, en fazla 255 karakter olmalıdır. - Sayısal karakter ve özel karakter içeremez. | "Ad ve Soyad alanı boş bırakılamaz." "Ad ve Soyad sadece harf içermelidir." "Ad ve Soyad en az 2, en fazla 255 karakter olmalıdır." |
| Kimlik No | \- TUR müşterilerde: 11 haneli, sadece rakam içermelidir. İlk rakam 0 olamaz. - Yabancı müşterilerde: Pasaport No 1-20 karakter arasında alfanümerik olmalıdır. | "Kimlik No 11 haneli olmalıdır." "Kimlik No sadece rakam içermelidir."  <br><br/>"Pasaport No 1-20 alfanümerik karakterden oluşmalıdır." |
| Kimlik Tipi | \- Seçim yapılması zorunludur. | "Lütfen kimlik tipi seçin." |
| Kimlik Ülkesi | \- Seçim yapılması zorunludur. | "Lütfen kimlik ülkesini seçin." |
| Doğum Tarihi | \- Boş bırakılamaz. - Format: GG.AA.YYYY olmalıdır. - Gelecek tarih olamaz. - 18 yaş altı para gönderemez ve alamaz. | "Lütfen geçerli bir doğum tarihi girin." "Doğum tarihi gelecek bir tarih olamaz." |
| Müşteri Tipi | \- Seçim yapılması zorunludur. | "Lütfen müşteri tipini seçin." |
| Banka Hesapları | \- Maksimum 34 karakter girilmesi zorunludur.  <br><br/>\- TR için uzunluk = 26 karakter olmalı, TR ile başlamalı ve IBAN checksum kontrolü yapılmalıdır.  <br><br/>\- Mükerrer eklenemez. | "Lütfen geçerli bir IBAN girin."  <br><br/>"Mükerrer IBAN." |
| Doğum Yeri | \- Boş bırakılamaz. - En az 2, en fazla 100 karakter olmalıdır. | "Lütfen doğum yerini girin." |
| Medeni Durum | \- Seçim yapılması zorunludur. | "Lütfen medeni durumunu seçin." |
| Seri No / Doküman No | \- Boş bırakılamaz. - En az 5, en fazla 30 karakter içermelidir. | "Lütfen geçerli bir belge numarası girin." |
| Veriliş Tarihi | \- Boş bırakılamaz. - Format: GG.AA.YYYY olmalıdır. - Gelecek tarih olamaz. | "Lütfen geçerli bir veriliş tarihi girin." |
| Veren Makam | \- Boş bırakılamaz. - En az 3, en fazla 50 karakter olmalıdır. | "Lütfen veren makamı girin." |
| Geçerlilik Tarihi | \- Format: GG.AA.YYYY olmalıdır. - Veriliş tarihinden önce olamaz.  <br><br/>\- Geçmiş bir tarih olamaz. | "Lütfen geçerli bir geçerlilik tarihi girin." |
| Anne Adı / Baba Adı | \- Kimlik Ülkesi Türkiye ise boş bırakılamaz. - En az 2, en fazla 50 karakter olmalıdır. | "Lütfen anne ve baba adını girin." |
| Cinsiyet | \- Seçim yapılması zorunludur. | "Lütfen cinsiyet seçin." |
| Evlenmeden Önceki Soyadı | \- Kadınlarda medeni durum Married ise zorunludur. | "Evlenmeden önceki soyadı girilmelidir." |
| Vergi Ülkesi | \- Seçim yapılması zorunludur. | "Lütfen vergi ülkesini seçin." |
| Eğitim Durumu  <br><br/> | \- Seçim yapılması zorunludur. | "Lütfen eğitim durumunu seçin." |
| Çalışma Durumu | \- Seçim yapılması zorunludur. | "Lütfen çalışma durumunu seçin." |
| Mesleği | \- Seçim yapılması zorunludur. | "Lütfen mesleği seçin." |
| Dil Tercihi | \- Seçim yapılması zorunludur. | "Lütfen bir dil tercihi seçin." |
| Vize Tipi | \- Uyruğu TUR olmayan kişiler için seçim yapılması zorunludur. | "Lütfen vize tipini seçin." |
| Vize Bitiş Tarihi | \- Uyruğu TUR olmayan kişiler için Vize Tipi VisaExempt değilse boş bırakılamaz, geçerli ve gelecekte bir tarih olmalıdır. | "Lütfen vize bitiş tarihini girin." |
| Oturum İzni | \- Zorunlu alan değildir, ancak en fazla 50 karakter içermelidir. | "Oturum izni en fazla 50 karakter olmalıdır." |
| Doğum Ülkesi / Yerleşik Olduğu Ülke | \- Uyruğu TUR olmayan kişiler için seçim yapılması zorunludur. | "Lütfen ülke seçin." |
| Adres Adı | \- En az 3, en fazla 50 karakter içermelidir. | "Lütfen adres adı girin." |
| Adres Tipi | \- Seçim yapılması zorunludur. | "Lütfen adres tipi seçin." |
| Ülke | \- Seçim yapılması zorunludur. | "Lütfen ülke seçin." |
| İl / İlçe / Mahalle (Türkiye) | \- Türkiye seçildiğinde zorunlu olmalıdır. | "Lütfen il, ilçe ve mahalle seçin." |
| Cadde / Sokak | \- Zorunlu alan değildir, ancak en fazla 50 karakter içermelidir. | "Cadde ve sokak en fazla 50 karakter olmalıdır." |
| Bina No / Daire No | \- En az 1, en fazla 10 karakter olmalıdır. | "Bina/Daire numarası 1–10 karakter olmalıdır." |
| Posta Kodu | \- En az 4, en fazla 10 karakter olmalıdır. | "Lütfen geçerli bir posta kodu girin." |
| E-posta | \- Boş bırakılamaz.  <br><br/>\- Tümü doğrulanmış olmalıdır. - Geçerli formatta olmalıdır (@ ve . içermelidir).  <br><br/>\- Tekrar eklenemez (case-insensitive e-posta). | "Lütfen geçerli bir e-posta adresi girin."  <br><br/>"Mükerrer iletişim adresi." |
| Telefon | \- Boş bırakılamaz.  <br><br/>\- Sabit telefon dışındakilerin tümü doğrulanmış olmalıdır. - Geçerli formatta olmalıdır (ülke kodu dahil 10-15 karakter).  <br><br/>\- Tekrar eklenemez (normalize telefon). | "Lütfen geçerli bir telefon numarası girin." "Telefon numarası OTP ile doğrulanmalıdır."  <br><br/>"Mükerrer iletişim adresi." |
| Asıl İletişim Kanalı | \- Aktif iletişim adreslerinden en az 1 e-posta ve 1 telefon asıl iletişim kanalı olarak seçilmelidir. | "Lütfen asıl iletişim kanalını belirleyin." |

&nbsp;

1. ## Yeni Tüzel Müşteri

- Butonlar: Müşteri Aktiviteleri (müşteri işlem geçmişi), Bloke Et, Bloke Kaldır, Belge Yükleme, Belge Görme/İndirme, Taslak Kaydet (daha sonra devam etmek için), Kaydet, Vazgeç (Değişiklik varsa “Kaydetmeden çıkılsın mı?” uyarısı.)

- Müşteri Bilgileri Paneli: Müşteri No (değiştirilemez), Ticari Unvanı, Vergi Kimlik No, Kampanya (combobox – kampanyalar listelenir), Kampanya Sonlanma Tarihi (otomatik gelir, değiştirilemez), KYC Status (ENUM: approval_status), Risk Skoru, Risk Segmenti (ENUM: level), Oluşturma Tarihi, Status (ENUM: entity_status). Status değeri Blocked (ENUM: entity_blockage_reason) veya Closed (ENUM: entity_closure_reason) ise gerekçesi de yanına tire eklenerek yazılır, örneğin Bloke – Belge Eksik, Kapalı – Uzun Süre Kullanılmama, gibi.

- Banka Hesapları Paneli: Banka, IBAN, Para Birimi, Şube Kodu, Hesap No, Ek No, Varsayılan Hesap Mı (checkbox), Status (ENUM: entity_status) kolonlarından oluşan banka hesap bilgilerinin tutulduğu ve yeni eklemelerin yapıldığı tablo. Her para biriminden sadece 1 adet varsayılan hesap seçilebilir, varsayılan seçilince aynı para birimindeki diğerlerinde otomatik kaldır ve kullanıcıya bilgi mesajı dönülür. Yabancı banka hesabı girişi yapılamaz.

- Finansal Bilgiler Paneli: No, Bakiye, Para Birimi, Bloke Miktarı, Günlük İşlem Adedi, Günlük İşlem Tutarı kolonlarının olduğu, müşterinin cüzdanlarının listelendiği tablo. Ürün bilgilerinde güncelleme yapılması gerektiğinde, kullanıcıya ilgili ürünün yönetildiği ekrana yönlendirme sağlayan bir bağlantı sunulur ve değişiklik işlemleri bu ekran üzerinden gerçekleştirilir.

- Tüzel Kişi Paneli: Hukuki Statü (ENUM: organization_type), Sicil Numarası, Mersis Numarası, Vergi Dairesi (combobox), Faaliyet Konusu, Kuruluş Tarihi, Kurulduğu Ülke, Sermaye Yapısı (ENUM: ownership_type), Personel Sayısı, Dil Tercihi, Notlar.

- Ortaklar Paneli: TCKN/VKN/Müşteri No, Tür (Gerçek Kişi, Tüzel Kişi), Adı, Doğrudan Pay Sahipliği, Dolaylı Pay Sahipliği, UBO (checkbox), Açıklama, Başlangıç Tarihi, Bitiş Tarihi (opsiyonel), Status (ENUM: status) kolonlarını içeren ve ekleme yapılabilen tablo. Doğrudan Pay Sahipliği ve Dolaylı Pay Sahipliği 0–100 aralığında değerler alabilir. 0 ≤ toplam Doğrudan Pay Sahipliği ≤ 100 olmalıdır, Dolaylı Pay Sahipliği için toplam kontrolü bulunmamaktadır. Aynı kişi aynı tüzelde çakışan tarihlerde tekrar ortak olarak eklenemez (unique). UBO checkbox sadece Tür = Gerçek Kişi ise aktif olur. UBO işaretlendiğinde veya Dolaylı Pay Sahipliği'ne değer girildiğinde Açıklama alanı zorunlu olur.

- Yetkililer Paneli: TC Kimlik/Müşteri No, Adı, İşlem Yetkisi (checkbox), İmza Yetkisi (checkbox), Tek İşlem Limiti, Günlük Toplam Limit, Aylık Toplam Limit, Başlangıç Tarihi, Bitiş Tarihi (opsiyonel), Status (ENUM: status) kolonlarını içeren ve ekleme yapılabilen tablo. İşlem Yetkisi seçili değilken limit alanları görünmez, kişiye sadece görüntüleme yetkileri tanımlanır, veritabanına limit 0 olarak kaydedilir. Limitlerde 0 = yetkisiz, -1 = sınırsız anlamına gelir. Yetkili kişi için tanımlanan limitler tüzel müşteri için tanımlı global/kurumsal limitleri aşıyorsa kısıtlayıcı olan uygulanır. Tüzel müşteri onaylı değilse (kyc_status!=Approved ve entity_status!=Active) yetki tanımlanabilir ama işlem yaptırılamaz.

- Adres Paneli: Adres Adı, Tipi (ENUM: address_type), İl (combobox), İlçe (combobox), Mahalle/Semt (combobox), Cadde, Sokak, Bina No, Daire No, Posta Kodu, UAVT No (otomatik çekilir), Ek Bilgiler (Apartman adı, site adı veya diğer açıklamalar...), İrtibat Adresi (checkbox). Müşterinin birden fazla adresi olabilir. Bir tanesini irtibat adresi seçmesi gerekmektedir. En az bir adet Registered olarak seçilmiş adres bulunmalıdır.

- İletişim Bilgileri Paneli: İletişim Adresi, Asıl Adres (checkbox), Durum (ENUM: status), Actions (Tekrar Gönder, Düzenle, Sil) kolonlarını içeren ve E-posta ve Telefon bilgilerinin tutulduğu tablo. Tekrar Gönder aksiyonu, doğrulanmış satırlarda tetiklenirse kullanıcıya uyarı gösterilir: "İletişim adresi zaten doğrulandı!". Birden fazla e-posta ve telefon bilgisi eklenebilir. Telefonlardan 1 tanesi ve e-posta adreslerinden 1 tanesi asıl iletişim kanalı seçilmelidir. Kullanıcı bir satırı Asıl seçtiğinde, aynı kanaldaki önceki asıl otomatik olarak kaldırılır; sistem eski asıl adrese bilgilendirme gönderir: "Asıl iletişim adresiniz değiştirildi!" ve kullanıcıya UI’da bilgi mesajı gösterir. Kullanıcı yeni satır ekleyebilir, mevcut satırları düzenleyebilir veya silebilir. Silme ve iletişim adresinin güncellenmesi (adres alanı değişimi) işlemlerinde sistem, değişiklik öncesi (eski) adrese bilgilendirme gönderir: "İletişim adresiniz güncellendi!". (Asıl değişikliğinde ayrıca bilgilendirme zaten gönderilir.) Yeni satır ekleme esnasında tablonun altında yeni ve boş bir satır açılır; satır güncellemede mevcut bilgiler değiştirilebilir şekilde gösterilir; her ikisinde de satırın en sağında Kaydet ve İptal ikonları yer alır. Ekleme ve adres değişikliği içeren güncelleme esnasında yeni irtibat bilgileri doğrulanmalıdır. E-posta adresi doğrulama linki ile, Telefon numarası OTP ile doğrulanır. Kullanıcı girişi tamamladıktan sonra ilgili satırın sağında yer alan Kaydet ikonunu tetikler. Satır Telefon ise Doğrulama Modal’ı açılır (Doğrulama Kodu alanı ve Tekrar Gönder, Doğrula, İptal butonları). Doğrulama başarılı oluncaya veya kullanıcı İptal’e basıncaya kadar modal kapanmaz. İptal’e basılırsa modal kapanır ve satır Kaydet öncesi haline döner. Sabit telefonlar doğrulanmaz ve Asıl seçilemez. Tekrar Gönderme rate limit ile kısıtlanır (saniyede 1 adet, bir adres için 5 adet)

- İşlem Limitleri Paneli: İşlem özelinde müşteriye limit koyulabilen panelidir: İşlem Limiti, Günlük İşlem Limiti, Aylık İşlem Limiti.

- Müşteri olmayan ilişkili kişiler aday müşteri olarak kayıt altına alınır.

- Yeni müşteri girişlerinde Finansal Bilgiler Paneli ve İşlem Limitleri Paneli gösterilmez.

- Vergi Kimlik No bilgisi girildikten sonra bu kimlik ile müşteri tanımı var ise mevcut bilgiler ile ekran doldurulur. Bu durumda eksik bilgiler girilebilir, bilgilerde değişiklik yapılabilir.

- Belge Yükleme modalında Ekle ve İptal butonu bulunur. Form panelinde ise Belge Kategorisi (ENUM: document_category), Belge Türü (combobox – seçilen belge kategorisi için tanımlanmış belge türleri), Geçerlilik Süresi (bu alana valid_from – valid_until şeklinde iki tarih girişi yapılabilir), Dosya (Browse) alanları yer alır. Belge Görme/İndirme butonuyla ise Doküman Yönetim Sistemi sayfası müşteri numarası filtrelenmiş biçimde açılır.

- Yabancı tüzel müşteri kabul edilmez.

- Bloke Et / Bloke Kaldır butonları, müşterinin sistem üzerindeki işlem yapma yetkisinin geçici veya kalıcı olarak kısıtlanmasını ya da yeniden aktif hale getirilmesini sağlar. Bloke Et ve Bloke Kaldır işlemleri yetki bazlıdır. Buton tetiklendiğinde açılan modal ile bloke etme/kaldırma nedeni kullanıcıdan alınır ve işlemi yapan kullanıcı ile tarih / saat bilgileri birlikte kayıt altına alınır.

- Bloke Et butonu tetiklendiğinde müşterinin status değeri Blocked olarak güncellenir. Böylelikle müşteri adına yeni işlem başlatılması engellenir; ancak devam eden veya daha önce tamamlanmış işlemler geriye dönük olarak etkilenmez. Sistem, bloke durumundaki müşteriler için işlem başlatılmasını servis seviyesinde de engeller (yalnızca UI değil, backend kontrolü).

- Bloke Et modal'ında opsiyonel olarak bir Bloke Bitiş Tarihi girilebilir. Bloke Bitiş Tarihi gün bazlıdır, saat bilgisi içermez. Bloke Bitiş Tarihi girilmemesi durumunda blokaj süresiz (kalıcı) olarak değerlendirilir. Bloke Bitiş Tarihi yalnızca ileri tarih olabilir. Girilen Bloke Bitiş Tarihi’ne ulaşılması durumunda, günlük çalışan batch süreç tarafından ilgili müşterinin blokajı otomatik olarak kaldırılır ve müşterinin status değeri Active olarak güncellenir.

- Bloke Kaldır butonu manuel olarak tetiklendiğinde, varsa tanımlı Bloke Bitiş Tarihi dikkate alınmaksızın müşterinin status değeri Active olarak güncellenir ve müşteri tekrar işlem yapabilir hale gelir.

- Bakiye Blokesi işlemleri (belirli bir tutarın bloke edilmesi), yalnızca Dijital Cüzdan ekranı üzerinden gerçekleştirilir. Müşteri ekranı üzerinden yapılan bloke işlemleri tam bloke niteliğindedir ve müşterinin tüm işlem yapma yetkisini kapsar.

- Yetkililer paneli sadece sistem erişimi ve işlem yetkilerini yönetir; UBO yönetimi ortaklar panelinde yapılır. Aynı gerçek kişi aynı tüzel müşteri için hem ortak hem yetkili olarak tanımlanabilir. Aynı ortak aynı tüzel müşteri için birden fazla satırla tanımlanabilir; ancak tarih aralıkları çakışamaz.

- Yetkili kişi limitleri opsiyoneldir; tanımlanırsa tüzel müşteri limitlerini aşamaz. Değişiklik yapılırken kontrol edilmelidir.

- Şirket ortakları tüzel kişi ise, tüzel kişinin nihai gerçek kişi ortağına ulaşıncaya kadar zincirleme takip edilir. Karmaşık yapılarda en az 3 kademe izlenir; 3 kademeden sonra da UBO’ya ulaşılamıyorsa uyum onayıyla devam edilir veya sonlandırılır. Her tüzel ortak için kanıt dokümanları (örneğin ticaret sicil, ortaklık yapısı belgesi) Doküman Yönetim Sistemi'ne eklenir. Kişilerin tüzel kişi üzerindeki dolaylı pay sahiplikleri manuel olarak hesaplanır ve Ortaklar Panelindeki Dolaylı Pay Sahipliği alanına girilir. Girilen Dolaylı Pay Sahipliği tüzel müşteri üzerindeki nihai dolaylı payı ifade edecektir.

- Tüzel kişilerde, %25 ve üzeri pay sahibi gerçek/tüzel ortakları ile kontrol yetkisi bulunanlar (pay oranından bağımsız: yönetim kontrolü, imza yetkisiyle fiili kontrol, oy sözleşmesi, yönetim kurulu atama/azil gücü, çoğunluk oy hakkı, veto vb.) için ortaklar paneline giriş yapılması zorunludur. Pay oranı hesaplanırken şirket ortağı tüzel kişilerdeki ortaklıklardan kaynaklanan dolaylı pay(lar) da dikkate alınarak hesaplanan nihai pay oranı dikkate alınır. %25 altı kontrol sahibi olmayan ortaklar için ortaklar paneline ekleme opsiyoneldir.

- %25 pay oranı UBO için zorunlu olmayan sınırdır; gereken durumlarda "{Adı} için UBO seçili ama pay oranı çok düşük" ve "{Adı} için UBO seçili değil ama pay oranı yüksek” uyarıları verilir ancak bloklanmaz.

- İşlem yapan veya sisteme erişen tüm yetkililerin ve UBO'ların aday veya bireysel müşteri kaydı olmalıdır. İşlem yapan yetkililer KYC Level asgari 2, read-only erişen yetkililer ve UBO’lar asgari 1 olmalıdır. UBO'ların aday veya bireysel müşteri kaydı yoksa veya kyc_level asgari 1 değilse tüzel müşteri işlem yapamaz. Yetkili kişi aday veya bireysel müşteri kaydı yoksa veya kyc_level şartını sağlamıyorsa sadece ilgili yetkili kişi tüzel kişi adına işlem yapamaz.

- Tüzel müşteri adına işlem yapılabilmesi için kyc_status=Approved ve entity_status=Active olmalıdır. KYC süreci tamamlanana kadar entity_status Inactive kalır ve entity_status adına işlem başlatılamaz.

- Yeni müşteri oluşturma esnasında kullanıcı Kaydet butonuna bastığında sistem, zorunlu alanlar için yaptığı kontrollerden sonra yetkili KYC seviyelerini kontrol eder. Sonrasında belge kontrolü yapar; tüzel müşteri Hukuki Statü’sü için gerekli belge listesi eksiksiz olmalı ve tüm belgeler onay gerektirmeyen veya onaylanmış (approval_required = false veya approval_status = Approved) olmalıdır. Son olarak da tüzel müşteri için sanction/kara liste kontrollerini otomatik biçimde arka planda başlatır. Bu kontroller için kullanıcıdan ayrıca bir aksiyon (ayrı bir butona basma, ayrı bir ekran/işlem başlatma gibi) beklenmez.

- Mevcut müşteri güncelleme esnasında Tüzel Kişi Paneli, Ortaklar Paneli, Yetkililer Paneli veya Adres Paneli'nde değişiklik yapılmışsa sistem tüm kontrolleri tekrar işletir, bunun dışındaki değişikliklerde bu kontroller işletilmez.

- Taslak olarak kaydedilmiş tüzel müşterilerin statüleri Inactive olur.

|     |     |     |
| --- | --- | --- |
| Alan | Kontroller | Hata Mesajı |
| Ticari Unvanı | \- Boş bırakılamaz. - En az 2, en fazla 255 karakter olmalıdır. | "Lütfen ticari unvanı girin." "Ticari unvan en az 2, en fazla 255 karakter olmalıdır." |
| Vergi Kimlik No | \- 10 haneli rakamlardan oluşmalıdır. - İlk rakam 0 olamaz. | "Vergi Kimlik No 10 haneli olmalıdır." "Vergi Kimlik No yalnızca rakamlardan oluşmalıdır." |
| Banka Hesapları | \- Maksimum 34 karakter girilmesi zorunludur.  <br><br/>\- TR için uzunluk = 26 karakter olmalı, TR ile başlamalı ve IBAN checksum kontrolü yapılmalıdır.  <br><br/>\- Mükerrer eklenemez. | "Lütfen geçerli bir IBAN girin."  <br><br/>"Mükerrer IBAN." |
| Hukuki Statü | \- Seçim yapılması zorunludur. | "Lütfen hukuki statüyü seçin." |
| Sicil Numarası | \- OrdinaryPartnership, ApartmentSiteManagement, Association, Foundation, PoliticalParty, UnionConfederation, ForeignLegalEntity, NonLegalEntityOrganization, PublicInstitution için zorunlu değildir, diğer tip organizasyonlarda zorunludur.  <br><br/>\- En az 5, en fazla 30 karakter içermelidir. | "Lütfen geçerli bir sicil numarası girin." |
| Mersis Numarası | \- SoleProprietorship, OrdinaryPartnership, ApartmentSiteManagement, Association, Foundation, PoliticalParty, UnionConfederation, ForeignLegalEntity, NonLegalEntityOrganization, PublicInstitution için zorunlu değildir, diğer tip organizasyonlarda zorunludur.  <br><br/>\- 16 haneli olmalıdır. | "MERSİS numarası 16 haneli olmalıdır." |
| Vergi Dairesi | \- Seçim yapılması zorunludur. | "Lütfen vergi dairesini seçin." |
| Faaliyet Konusu | \- En az 3, en fazla 255 karakter olmalıdır. | "Lütfen faaliyet konusunu girin." |
| Kuruluş Tarihi | \- OrdinaryPartnership, ApartmentSiteManagement, NonLegalEntityOrganization tipinde olmayan kuruluşlarda boş bırakılamaz. - Geçerli bir tarih formatında olmalıdır. - Gelecek tarih olamaz. | "Lütfen geçerli bir kuruluş tarihi girin." |
| Kurulduğu Ülke | \- Seçim yapılması zorunludur. | "Lütfen kurulduğu ülkeyi seçin." |
| Sermaye Yapısı | \- Seçim yapılması zorunludur. | "Lütfen sermaye yapısını seçin." |
| Personel Sayısı | \- Pozitif bir tam sayı olmalıdır. | "Lütfen geçerli bir personel sayısı girin." |
| Dil Tercihi | \- Seçim yapılması zorunludur. | "Lütfen bir dil tercihi seçin." |
| Adres Adı | \- En az 3, en fazla 50 karakter içermelidir. | "Lütfen adres adı girin." |
| Adres Tipi | \- Seçim yapılması zorunludur. | "Lütfen adres tipi seçin." |
| İl / İlçe / Mahalle (Türkiye) | \- Türkiye seçildiğinde zorunlu olmalıdır. | "Lütfen il, ilçe ve mahalle seçin." |
| Cadde / Sokak | \- Opsiyoneldir. - En fazla 50 karakter içermelidir. | "Cadde ve sokak en fazla 50 karakter olmalıdır." |
| Bina No / Daire No | \- En az 1, en fazla 10 karakter olmalıdır. | "Bina/Daire numarası 1–10 karakter olmalıdır." |
| Posta Kodu | \- En az 4, en fazla 10 karakter olmalıdır. | "Lütfen geçerli bir posta kodu girin." |
| İrtibat Adresi | \- En az bir adres irtibat adresi olarak seçilmelidir. | "Lütfen bir irtibat adresi belirleyin." |
| E-posta | \- Boş bırakılamaz.  <br><br/>\- Tümü doğrulanmış olmalıdır. - Geçerli formatta olmalıdır (@ ve . içermelidir).  <br><br/>\- Tekrar eklenemez (case-insensitive e-posta). | "Lütfen geçerli bir e-posta adresi girin."  <br><br/>"Mükerrer iletişim adresi." |
| Telefon | \- Boş bırakılamaz.  <br><br/>\- Sabit telefon dışındakilerin tümü doğrulanmış olmalıdır. - Geçerli formatta olmalıdır (ülke kodu dahil 10-15 karakter).  <br><br/>\- Tekrar eklenemez (normalize telefon). | "Lütfen geçerli bir telefon numarası girin." "Telefon numarası OTP ile doğrulanmalıdır."  <br><br/>"Mükerrer iletişim adresi." |
| Asıl İletişim Kanalı | \- Aktif iletişim adreslerinden en az 1 e-posta ve 1 telefon asıl iletişim kanalı olarak seçilmelidir. | "Lütfen asıl iletişim kanalını belirleyin." |
| İşlem Limiti | \- Negatif bir sayı olmamalıdır. | "Lütfen geçerli bir işlem limiti girin." |
| Günlük İşlem Limiti | \- Negatif bir sayı olmamalıdır. | "Lütfen geçerli bir günlük işlem limiti girin." |
| Aylık İşlem Limiti | \- Negatif bir sayı olmamalıdır. | "Lütfen geçerli bir aylık işlem limiti girin." |

&nbsp;

1. ## Müşteri Notları

- Müşteri No, Bilgilendirme Metni, Bilgilendirilen (ENUM: entity_type_core), Öncelik Seviyesi (ENUM: level), Gösterim Limiti, Gösterim Adedi, Bitiş Tarihi kolonlarının olduğu tablo.

- Temsilci müşteri ekranı açtığında müşteriye dair görmesi istenilen notlar ile müşteri kendi ekranını açtığında görmesi istenilen notlar bu ekrandan girilir.

- Gösterim Limiti opsiyoneldir; dolu ise not ilgili kullanıcıya en fazla bu sayı kadar gösterilir. Gösterim Sayacı sistemsel alandır; not her görüntülendiğinde otomatik artar ve kullanıcı tarafından değiştirilemez. Bitiş Tarihi doluysa not bu tarihten sonra gösterilmez.

- Yeni ekleme yapılacağında en alta boş satır açılır, değişiklik yapılacağında satırdaki değerler değiştirilebilir olur. Veya modal veya yeni sayfa da kullanılabilir, hangisi kolaysa. Ancak detay sayfasına ihtiyaç bulunmamaktadır.

1. ## Müşteri Belge İnceleme

- Müşteri No, Adı ve Soyadı / Unvanı, Uyruğu, Şüpheli İşareti, Oluşturma Tarihi, Belge Kategorisi (ENUM: document_category), Belge Türü, Belge İncelenme Durumu (ENUM: approval_status) kolonlarının bulunduğu; kontrol edilmemiş dokümanların (approval_required=true && approval_status=Pending) listelendiği tablo.

- Default sıralamada öncelikle Şüpheli İşareti True olup Uyruğu TUR olmayanlar, sonra Şüpheli İşareti True olanlar, sonra Uyruğu TUR olmayanlar son olarak da diğer müşteriler kendi içlerinde Oluşturma Tarihine göre eskiden yeniye olacak şekilde getirilir. Taslak olarak kaydedilmiş müşteri belgeleri de bu listede yer alır.

- Detay ekranında 2 panel olur: Müşteri Bilgileri Paneli ve Doküman Paneli.

- Butonlar: Onayla, Reddet, Ek Belge İste.

- Müşteri Bilgileri Paneli: Müşteri No, Kimlik No, Kimlik Tipi (ENUM: identity_document), Uyruğu, Doğum Tarihi, Adı ve Soyadı / Unvanı, Doğum Yeri, Medeni Durum (ENUM: marital_status), Seri No / Doküman No, Veriliş Tarihi, Veren Makam, Geçerlilik Tarihi, Anne Adı, Baba Adı, Cinsiyeti (ENUM: gender), Müşteri Tipi (ENUM: customer_type), Oluşturma Tarihi, Dil Tercihi, Notlar, KYC Seviyesi (ENUM: kyc_level – sadece bireysel müşteriler için gösterilir, tüzel müşteriler için gösterilmez), KYC Status (ENUM: approval_status), Belge İncelenme Durumu (ENUM: approval_status), Status (ENUM: entity_status). Status değeri Blocked (ENUM: entity_blockage_reason) veya Closed (ENUM: entity_closure_reason) ise gerekçesi de yanına tire eklenerek yazılır, örneğin Bloke – Belge Eksik, Kapalı – Uzun Süre Kullanılmama, gibi.

- Doküman Paneli: Belge Kategorisi (ENUM: document_category), Belge Türü, Oluşturulma Tarihi, Oluşturan Kullanıcı, Status (ENUM: document_status), Onay Tarihi, Onaylayan Kullanıcı, Onay Status (ENUM: approval_status), Onay Zorunlu (checkbox) alanlarından oluşan müşteri belgelerinin indirilebildiği panel.

- Ekranda alanlar doğrudan düzenlenemez; güncellemeler yalnızca butonlar üzerinden yapılır.

- Onayla butonu ile Belge İncelenme Durumu Approved olarak; Reddet butonu ile Rejected olarak güncellenir. Ek Belge İste işleminde Belge İncelenme Durumu değişmez.

- Ek Belge İste işleminde KYC Seviyesi, KYC Status, Belge İncelenme Durumu ve Status değişmez. Açılan modal’da ek istenecek Belge Kategorisi (ENUM: document_category) ve Belge Türü (combobox – tanımlı belge türleri listelenir) seçilir. İstenirse açıklama girilir.

- Onayla ve Reddet işlemlerinde açılan modal’da müşterinin KYC Status ve Status değerleri seçilir ve açıklama girilir; bireysel müşteriler için ayrıca KYC Seviyesi seçilir. Status değeri Blocked veya Closed seçilirse, kullanıcının Gerekçe’yi (ENUM: entity_blockage_reason veya entity_closure_reason) seçmesi zorunludur.

- Reddetme işleminde kullanıcı KYC Status değerini Rejected yapabilir veya değiştirmeden bırakabilir. Onaylama işleminde kullanıcı KYC Status değerini Approved yapabilir veya değiştirmeden bırakabilir. KYC Status = Approved iken Status değeri Blocked veya Closed seçilirse kullanıcının onayına sunulur: "KYC Status Approved seçili iken Status XXX seçilmektedir. Onaylıyor musunuz?". Uyarı iş kesici değildir; kullanıcı onay verirse işlem devam eder.

- Bireysel müşteri: Reddetme işleminde mevcut KYC Seviyesi veya daha düşük bir seviye seçilebilir. Onaylama işleminde; ProofOfAddress kategorisinde bir doküman onaylanıyorsa veya müşteride en az 1 adet ProofOfAddress dokümanı varsa KYC Seviyesi 2 seçilebilir, aksi takdirde 2 veya 3 seçilemez. ProofOfFunds kategorisinde bir doküman onaylanıyorsa veya müşteride en az 1 adet ProofOfFunds dokümanı varsa KYC Seviyesi 3 seçilebilir, aksi takdirde 3 seçilemez. KYC Seviyesi artırılırken Status değeri Blocked veya Closed ise bu durum kullanıcının onayına sunulur: "KYC Seviyesi YYY seçili iken Status XXX seçilmektedir. Onaylıyor musunuz?". Uyarı iş kesici değildir; kullanıcı onay verirse işlem devam eder.

- KYC Seviyesi, KYC Status veya Status değişimlerinde; müşterinin onay gerektiren belgelerinden bazıları hâlâ Pending ise sistem şu uyarıyı üretir: "Müşterinin onay gerektiren belgesi/belgeleri bulunmaktadır: {Belge Kategorisi} – {Belge Türü}, XXX.". Uyarı iş kesici değildir; kullanıcı onay verirse işlem devam eder.

- Status değeri Closed olarak güncellenmek istenirse kullanıcıdan onay alınır: "Müşterinin Status'u Closed olarak güncellenmektedir, emin misiniz?". Uyarı iş kesici değildir; kullanıcı onay verirse işlem devam eder.

1. ## Müşteri Ücret ve Komisyonları

- Müşterilere uygulanacak standart ücret ve komisyon tarifesinin yönetildiği ekrandır. Müşteri tarafında tek bir ücret yapısı esas alınır; farklılaşma ihtiyacı kampanyalar üzerinden yönetilir.

- İşlem (ENUM: transaction_type), Para Birimi (ENUM: currency), Alt Limit, Sabit Ücret, Değişken Ücret (%), Başlangıç Tarihi, Bitiş Tarihi, Kaynak Ülke, Hedef Ülke, Değiştiren Kullanıcı, Değişiklik Tarihi, Status (ENUM: status) kolonlarının olduğu tüm ücret ve komisyonların listelendiği tablo. Varsayılan sıralamada aktif değerler en üstte yer alır.

- Yeni ekleme yapılacağında en alta boş satır açılır, değişiklik yapılacağında satırdaki değerler değiştirilebilir olur. Veya modal veya yeni sayfa da kullanılabilir, hangisi kolaysa. Ancak detay sayfasına ihtiyaç bulunmamaktadır.

- Değiştiren Kullanıcı ve Değişiklik Tarihi alanları otomatik gelir. Başlangıç Tarihi ve Bitiş Tarihi alanları opsiyoneldir; kullanıcının doldurması zorunlu değildir. Boş ise başlangıç tarihi giriş yapılan tarih olur.

- Aynı İşlem, Para Birimi, Alt Limit ve ülke kombinasyonu için yeni bir kayıt oluşturulduğunda, mevcut kayıt pasife alınır; ilgili satırın Bitiş Tarihi otomatik doldurulur ve Status alanı güncellenir. Alt Limit alanına tabloda mevcut olmayan yeni bir değer (örneğin 0, 10.000 ve 20.000 TL kademeleri varken 15.000 TL) girildiğinde bu kayıt yeni bir kademe olarak değerlendirilir, mevcut kademeler korunur. Hesaplama sırasında sistem, işlem tutarı için işlem tutarına eşit veya ondan küçük olan en yüksek Alt Limit değerine ait ücret/komisyon tanımını uygular.

- Ücret skalasında yalnızca minimum tutar bilgisi tutulur, maksimum tutar alanı kullanılmaz. Her aralık, kendi alt sınırı üzerinden değerlendirilir ve bir üst aralığa geçildiğinde sistem otomatik olarak o aralığın ücret/komisyon değerlerini uygular. Örneğin 0–10.000 TL için %5, 10.000–20.000 TL için %2 ve 20.000 TL üzeri için %1 oran tanımlandığında, sistemde bu yapı sırasıyla 0 için %5, 10.000 için %2 ve 20.000 için %1 şeklinde saklanır. Bu nedenle 15.000 TL’lik bir işlemde otomatik olarak %2, 30.000 TL’lik bir işlemde ise %1 komisyon oranı uygulanır.

- Kaynak Ülke / Hedef Ülke alanları için tüm ülkeler seçeneği desteklenir. Ücret hesaplamasında en spesifik kural önceliklidir (ülke bazlı > tüm ülkeler). Öncelik sırası: (Kaynak+Hedef spesifik) > (Kaynak spesifik + hedef tüm) > (Kaynak tüm + hedef spesifik) > (tüm+tüm). Eşitlikte en yüksek Alt Limit uygulanır.

- Her İşlem ve Para Birimi için en az bir "tüm ülkeler – tüm ülkeler" ve Alt Limit = 0 aktif kuralı bulunması zorunludur; aksi halde ücret hesaplaması yapılmaz.

- Başlangıç tarihi henüz gelmemiş veya Bitiş Tarihi geçmiş kayıtlar günlük batch job ile pasife alınır. Ücret ve komisyon hesaplaması işlem tarihi itibarıyla geçerli olan aktif kayıtlar üzerinden yapılır.

1. ## Müşteri Kampanya Yönetimi

- Müşterilere uygulanacak kampanyaların yönetildiği ekrandır. Kampanyalar, standart müşteri ücret tarifesi üzerine ayarlama (indirim/ücretsiz/avantaj) uygulanmasını sağlar.

- Kampanya Kodu, Kampanya Adı, Açıklama, Sabit Ücret Kazanç Oranı, Komisyon Kazanç Oranı, İşlem (ENUM: transaction_type), Para Birimi (ENUM: currency), Başlangıç Tarihi, Bitiş Tarihi, Minimum İşlem Tutarı, Maksimum Kazanç – İşlem Başı, Maksimum Kazanç – Toplam, Maksimum Kullanım Adedi, Status (ENUM: status) kolonlarının olduğu mevcut kampanyaların listelenebildiği tablo.

- Yeni ekleme yapılacağında en alta boş satır açılır, değişiklik yapılacağında satırdaki değerler değiştirilebilir olur. Veya modal veya yeni sayfa da kullanılabilir, hangisi kolaysa. Ancak detay sayfasına ihtiyaç bulunmamaktadır.

- Kampanya Kodu sistemsel anahtar niteliğindedir ve update ekranında değiştirilemez. Değişiklik ihtiyacında yeni kampanya tanımlanmalıdır.

- Sabit Ücret Ayarlama Oranı ve Komisyon Ayarlama Oranı alanları kampanyanın etkisini ifade eder. Bu oranlar standart müşteri ücret tarifesine uygulanır.

- Minimum İşlem Tutarı alanı opsiyoneldir; dolu ise kampanya yalnızca bu tutar ve üzerindeki işlemlerde uygulanır.

- Maksimum Kazanç – İşlem Başı alanı, kampanyanın tek bir işlemde sağlayabileceği en yüksek avantaj tutarını ifade eder. Maksimum Kazanç – Toplam alanı, kampanya süresi boyunca bir müşterinin kampanyadan toplamda elde edebileceği en yüksek avantaj tutarını ifade eder. Yabancı para cinsinden işlemlerde, kampanya kapsamındaki her bir işlemin sağladığı kazanç, işlemin gerçekleştiği tarihte geçerli döviz kuru esas alınarak Türk Lirası karşılığına çevrilir. Toplam kazanç hesabı, her işlem için Türk Lirası cinsinden hesaplanan bu kazançların kümülatif toplamı üzerinden yapılır ve Maksimum Kazanç – Toplam limiti bu tutara göre kontrol edilir.

- Maksimum Kullanım Adedi alanı, kampanyanın bir müşteri tarafından kullanılabileceği maksimum işlem adedini ifade eder.

- Başlangıç tarihi henüz gelmemiş veya Bitiş Tarihi geçmiş kampanyalar günlük batch job ile pasife alınır.

- Müşteriye aynı anda birden fazla kampanya tanımlanamaz. Eğer yeni bir kampanya tanımlanırsa, uyarı verilerek kullanıcıdan validasyon alınır, mevcut aktif kayıt otomatik olarak pasife alınır; ilgili satırın Bitiş Tarihi doldurulur ve Status alanı güncellenir.

&nbsp;

1. # Temsilciler

- Temsilci No, Ticari Unvan, E-posta, Telefon, Vergi Kimlik No, Temsilci Grubu, Avans Hesap Bakiyesi (Tek bir kolon altında gösterilir: TRY: … | USD: … | EUR: …), Komisyon Mahsuplaşma (ENUM: settlement_frequency), Oluşturma Tarihi, Son İşlem Tarihi, Status (ENUM: entity_status) kolonlarının olduğu, tüm temsilcilerin listelendiği bir tablo. Status değeri Blocked (ENUM: entity_blockage_reason) veya Closed (ENUM: entity_closure_reason) ise gerekçesi de yanına tire eklenerek yazılır, örneğin Bloke – Belge Eksik, Kapalı – Uzun Süre Kullanılmama, gibi.

1. ## Yeni Temsilci

- Butonlar: Temsilci Aktiviteleri (temsilci işlem geçmişi), Bloke Et, Bloke Kaldır, Belge Yükleme, Belge Görme/İndirme, Taslak Kaydet (daha sonra devam etmek için), Kaydet, Vazgeç (Değişiklik varsa “Kaydetmeden çıkılsın mı?” uyarısı.)

- Temsilci Bilgileri Paneli: Temsilci No (değiştirilemez), Ticari Unvan, Vergi Kimlik No, Temsilci Grubu (combobox – temsilci grupları listelenir), Komisyon Mahsuplaşma (ENUM: settlement_frequency), Oluşturma Tarihi, Risk Segmenti (ENUM: level), Status (ENUM: entity_status). Status değeri Blocked (ENUM: entity_blockage_reason) veya Closed (ENUM: entity_closure_reason) ise gerekçesi de yanına tire eklenerek yazılır, örneğin Bloke – Belge Eksik, Kapalı – Uzun Süre Kullanılmama, gibi.

- Banka Hesapları Paneli: Banka, IBAN, Para Birimi, Şube Kodu, Hesap No, Ek No, Varsayılan Hesap Mı (checkbox), Status (ENUM: entity_status) kolonlarından oluşan banka hesap bilgilerinin tutulduğu ve yeni eklemelerin yapıldığı tablo. Her para biriminden sadece 1 adet varsayılan hesap seçilebilir, varsayılan seçilince aynı para birimindeki diğerlerinde otomatik kaldır ve kullanıcıya bilgi mesajı dönülür. Yabancı banka hesabı girişi yapılamaz.

- Finansal Bilgiler Paneli: No, Tür (Avans, Komisyon), Bakiye, Para Birimi, Bloke Miktarı, Günlük İşlem Adedi, Günlük İşlem Tutarı kolonlarının olduğu, temsilcinin Avans ve Komisyon hesaplarının listelendiği tablo. Alanların hiçbirisi değiştirilemez.

- Tüzel Kişi Paneli: Hukuki Statü (ENUM: organization_type_commercial), Sicil Numarası, Mersis Numarası, Vergi Dairesi (combobox), Faaliyet Konusu, Kuruluş Tarihi, Kurulduğu Ülke, Sermaye Yapısı ENUM: ownership_type), Personel Sayısı, Dil Tercihi, Notlar.

- Ortaklar Paneli: TCKN/VKN/Müşteri No, Tür (Gerçek Kişi, Tüzel Kişi), Adı, Doğrudan Pay Sahipliği, Dolaylı Pay Sahipliği, UBO (checkbox), Açıklama, Başlangıç Tarihi, Bitiş Tarihi (opsiyonel), Status (ENUM: status) kolonlarını içeren ve ekleme yapılabilen tablo. Doğrudan Pay Sahipliği ve Dolaylı Pay Sahipliği 0–100 aralığında değerler alabilir. 0 ≤ toplam Doğrudan Pay Sahipliği ≤ 100 olmalıdır, Dolaylı Pay Sahipliği için toplam kontrolü bulunmamaktadır. Aynı kişi aynı temsilcide çakışan tarihlerde tekrar ortak olarak eklenemez (unique). UBO checkbox sadece Tür = Gerçek Kişi ise aktif olur. UBO işaretlendiğinde veya Dolaylı Pay Sahipliği'ne değer girildiğinde Açıklama alanı zorunlu olur.

- Yetkililer Paneli: T.C. Kimlik/Müşteri No, Adı, İşlem Yetkisi (checkbox), İmza Yetkisi (checkbox), Tek İşlem Limiti, Günlük Toplam Limit, Aylık Toplam Limit, Başlangıç Tarihi, Bitiş Tarihi (opsiyonel), Status (ENUM: status) kolonlarını içeren ve ekleme yapılabilen tablo. İşlem Yetkisi seçili değilken limit alanları görünmez, kişiye sadece görüntüleme yetkileri tanımlanır, veritabanına limit 0 olarak kaydedilir. Limitlerde 0 = yetkisiz, -1 = sınırsız anlamına gelir. Yetkili kişi için tanımlanan limitler temsilci için tanımlı global/kurumsal limitleri aşıyorsa kısıtlayıcı olan uygulanır. Temsilci onaylı değilse (kyc_status!=Approved ve entity_status!=Active) yetki tanımlanabilir ama işlem yaptırılamaz. Temsilci adına herhangi bir işlem yapılabilmesi için işlemi gerçekleştiren kişinin Yetkililer panelinde tanımlı ve Status değerinin Active olması zorunludur; aksi durumda işlem backend seviyesinde reddedilir.

- Adres Paneli: Adres Adı, Tipi (ENUM: address_type), Ülke (combobox), İl (Türkiye ise combobox), İlçe (Türkiye ise combobox), Mahalle/Semt (Türkiye ise combobox), Cadde, Sokak, Bina No, Daire No, Posta Kodu, UAVT No (sadece Türkiye ise görülür ve otomatik çekilir), Ek Bilgiler (Apartman adı, site adı veya diğer açıklamalar...), Enlem, Boylam, İrtibat Adresi (checkbox). Temsilcinin birden fazla adresi olabilir. Bir tanesini irtibat adresi seçmesi gerekmektedir. En az bir adet Registered olarak seçilmiş adres bulunmalıdır.

- İletişim Bilgileri Paneli: İletişim Adresi, Asıl Adres (checkbox), Durum (ENUM: status), Actions (Tekrar Gönder, Düzenle, Sil) kolonlarını içeren ve E-posta ve Telefon bilgilerinin tutulduğu tablo. Tekrar Gönder aksiyonu, doğrulanmış satırlarda tetiklenirse kullanıcıya uyarı gösterilir: "İletişim adresi zaten doğrulandı!". Birden fazla e-posta ve telefon bilgisi eklenebilir. Telefonlardan 1 tanesi ve e-posta adreslerinden 1 tanesi asıl iletişim kanalı seçilmelidir. Kullanıcı bir satırı Asıl seçtiğinde, aynı kanaldaki önceki asıl otomatik olarak kaldırılır; sistem eski asıl adrese bilgilendirme gönderir: "Asıl iletişim adresiniz değiştirildi!" ve kullanıcıya UI’da bilgi mesajı gösterir. Kullanıcı yeni satır ekleyebilir, mevcut satırları düzenleyebilir veya silebilir. Silme ve iletişim adresinin güncellenmesi (adres alanı değişimi) işlemlerinde sistem, değişiklik öncesi (eski) adrese bilgilendirme gönderir: "İletişim adresiniz güncellendi!". (Asıl değişikliğinde ayrıca bilgilendirme zaten gönderilir.) Yeni satır ekleme esnasında tablonun altında yeni ve boş bir satır açılır; satır güncellemede mevcut bilgiler değiştirilebilir şekilde gösterilir; her ikisinde de satırın en sağında Kaydet ve İptal ikonları yer alır. Ekleme ve adres değişikliği içeren güncelleme esnasında yeni irtibat bilgileri doğrulanmalıdır. E-posta adresi doğrulama linki ile, Telefon numarası OTP ile doğrulanır. Kullanıcı girişi tamamladıktan sonra ilgili satırın sağında yer alan Kaydet ikonunu tetikler. Satır Telefon ise Doğrulama Modal’ı açılır (Doğrulama Kodu alanı ve Tekrar Gönder, Doğrula, İptal butonları). Doğrulama başarılı oluncaya veya kullanıcı İptal’e basıncaya kadar modal kapanmaz. İptal’e basılırsa modal kapanır ve satır Kaydet öncesi haline döner. Sabit telefonlar doğrulanmaz ve Asıl seçilemez. Tekrar Gönderme rate limit ile kısıtlanır (saniyede 1 adet, bir adres için 5 adet)

- İşlem Limitleri Paneli: İşlem özelinde temsilciye limit koyulabilen panelidir: İşlem Limiti, Günlük İşlem Limiti, Aylık İşlem Limiti.

- Yeni temsilci girişlerinde Finansal Bilgiler Paneli ve İşlem Limitleri Paneli gösterilmez.

- Vergi Kimlik No bilgisi girildikten sonra bu kimlik ile temsilci tanımı var ise mevcut bilgiler ile ekran doldurulur. Bu durumda eksik bilgiler girilebilir, bilgilerde değişiklik yapılabilir.

- Temsilciler sadece tüzel kişilikler olabilir. KYC süreçleri de tüzel kişilerde olduğu şekilde yürütülür.

- Bloke Et / Bloke Kaldır butonları, temsilcinin sistem üzerindeki işlem yapma yetkisinin geçici veya kalıcı olarak kısıtlanmasını ya da yeniden aktif hale getirilmesini sağlar. Bloke Et ve Bloke Kaldır işlemleri yetki bazlıdır. Buton tetiklendiğinde açılan modal ile bloke etme/kaldırma nedeni kullanıcıdan alınır ve işlemi yapan kullanıcı ile tarih / saat bilgileri birlikte kayıt altına alınır.

- Bloke Et butonu tetiklendiğinde temsilcinin status değeri Blocked olarak güncellenir. Böylelikle temsilci adına yeni işlem başlatılması engellenir; ancak devam eden veya daha önce tamamlanmış işlemler geriye dönük olarak etkilenmez. Sistem, bloke durumundaki temsilciler için işlem başlatılmasını servis seviyesinde de engeller (yalnızca UI değil, backend kontrolü).

- Bloke Et modal'ında opsiyonel olarak bir Bloke Bitiş Tarihi girilebilir. Bloke Bitiş Tarihi gün bazlıdır, saat bilgisi içermez. Bloke Bitiş Tarihi girilmemesi durumunda blokaj süresiz (kalıcı) olarak değerlendirilir. Bloke Bitiş Tarihi yalnızca ileri tarih olabilir. Girilen Bloke Bitiş Tarihi’ne ulaşılması durumunda, günlük çalışan batch süreç tarafından ilgili temsilcinin blokajı otomatik olarak kaldırılır ve temsilcinin status değeri Active olarak güncellenir.

- Bloke Kaldır butonu manuel olarak tetiklendiğinde, varsa tanımlı Bloke Bitiş Tarihi dikkate alınmaksızın temsilcinin status değeri Active olarak güncellenir ve temsilci tekrar işlem yapabilir hale gelir.

- Bakiye Blokesi işlemleri (belirli bir tutarın bloke edilmesi), yalnızca Dijital Cüzdan ekranı üzerinden gerçekleştirilir. Temsilci ekranı üzerinden yapılan bloke işlemleri tam bloke niteliğindedir ve temsilcinin tüm işlem yapma yetkisini kapsar.

- Yetkililer paneli sadece sistem erişimi ve işlem yetkilerini yönetir; UBO yönetimi ortaklar panelinde yapılır. Aynı gerçek kişi aynı temsilci için hem ortak hem yetkili olarak tanımlanabilir.

- Yetkili kişi limitleri opsiyoneldir; tanımlanırsa temsilci limitlerini aşamaz. Değişiklik yapılırken kontrol edilmelidir.

- Şirket ortakları tüzel kişi ise, tüzel kişinin nihai gerçek kişi ortağına ulaşıncaya kadar zincirleme takip edilir. Karmaşık yapılarda en az 3 kademe izlenir; 3 kademeden sonra da UBO’ya ulaşılamıyorsa uyum onayıyla devam edilir veya sonlandırılır. Her tüzel ortak için kanıt dokümanları (örneğin ticaret sicil, ortaklık yapısı belgesi) Doküman Yönetim Sistemi'ne eklenir. Kişilerin temsilci üzerindeki dolaylı pay sahiplikleri manuel olarak hesaplanır ve Ortaklar Panelindeki Dolaylı Pay Sahipliği alanına girilir. Girilen Dolaylı Pay Sahipliği temsilci üzerindeki nihai dolaylı payı ifade edecektir.

- Temsilcilerde, %25 ve üzeri pay sahibi gerçek/tüzel ortakları ile kontrol yetkisi bulunanlar (pay oranından bağımsız: yönetim kontrolü, imza yetkisiyle fiili kontrol, oy sözleşmesi, yönetim kurulu atama/azil gücü, çoğunluk oy hakkı, veto vb.) için ortaklar paneline giriş yapılması zorunludur. Pay oranı hesaplanırken şirket ortağı tüzel kişilerdeki ortaklıklardan kaynaklanan dolaylı pay(lar) da dikkate alınarak hesaplanan nihai pay oranı dikkate alınır. %25 altı kontrol sahibi olmayan ortaklar için ortaklar paneline ekleme opsiyoneldir.

- %25 pay oranı UBO için zorunlu olmayan sınırdır; gereken durumlarda "{Adı} için UBO seçili ama pay oranı çok düşük" ve "{Adı} için UBO seçili değil ama pay oranı yüksek” uyarıları verilir ancak bloklanmaz.

- Temsilci adına işlem yapan veya sisteme erişen tüm yetkililerin ve tüm UBO'ların yetkili kişi, aday müşteri veya bireysel müşteri kaydı olmalıdır. Temsilcide müşteri verilerine erişim bulunduğundan, temsilci adına işlem yapabilen veya sadece görüntüleme yetkisi olan tüm yetkililer için KYC Level asgari 2 şartı aranır. UBO’lar için KYC Level asgari 1 olmalıdır. UBO'ların yetkili kişi, aday müşteri veya bireysel müşteri kaydı yoksa veya kyc_level asgari 1 değilse temsilci işlem yapamaz ve temsilci süreçleri tamamen durdurulur. Yetkili kişi yetkili kişi, aday müşteri veya bireysel müşteri kaydı yoksa veya kyc_level asgari 2 şartını sağlamıyorsa sadece ilgili yetkili kişi temsilci adına işlem yapamaz; ayrıca ilgili kişinin Status değeri Inactive yapılabilir.

- Temsilci adına işlem yapılabilmesi için kyc_status=Approved ve entity_status=Active olmalıdır. KYC süreci tamamlanana kadar entity_status=Inactive kalır ve temsilci adına işlem başlatılamaz.

- Yeni temsilci oluşturma esnasında kullanıcı Kaydet butonuna bastığında sistem, zorunlu alanlar için yaptığı kontrollerden sonra yetkili KYC seviyelerini kontrol eder. Sonrasında belge kontrolü yapar; temsilci Hukuki Statü’sü için gerekli belge listesi eksiksiz olmalı ve tüm belgeler onay gerektirmeyen veya onaylanmış (approval_required = false veya approval_status = Approved) olmalıdır. Son olarak da temsilcinin tüzel kişiliği için sanction/kara liste kontrollerini otomatik biçimde arka planda başlatır. Bu kontroller için kullanıcıdan ayrıca bir aksiyon (ayrı bir butona basma, ayrı bir ekran/işlem başlatma gibi) beklenmez.

- Mevcut temsilci güncelleme esnasında Tüzel Kişi Paneli, Ortaklar Paneli, Yetkililer Paneli veya Adres Paneli'nde değişiklik yapılmışsa sistem tüm kontrolleri tekrar işletir, bunun dışındaki değişikliklerde bu kontroller işletilmez.

- Taslak olarak kaydedilmiş temsilcilerin statüleri Inactive olur.

|     |     |     |
| --- | --- | --- |
| Alan | Kontroller | Hata Mesajı |
| Adı ve Soyadı / Unvanı | \- Boş bırakılamaz. - En az 2, en fazla 255 karakter olmalıdır. | "Lütfen adı ve soyadı / unvanı girin." "Adı ve soyadı / unvanı en az 2, en fazla 255 karakter olmalıdır." |
| Vergi Kimlik No | \- 10 haneli rakamlardan oluşmalıdır. - İlk rakam 0 olamaz. | "Vergi Kimlik No 10 haneli olmalıdır." "Vergi Kimlik No yalnızca rakamlardan oluşmalıdır." |
| Banka Hesapları | \- Maksimum 34 karakter girilmesi zorunludur.  <br><br/>\- TR için uzunluk = 26 karakter olmalı, TR ile başlamalı ve IBAN checksum kontrolü yapılmalıdır.  <br><br/>\- Mükerrer eklenemez. | "Lütfen geçerli bir IBAN girin."  <br><br/>"Mükerrer IBAN." |
| Hukuki Statü | \- Seçim yapılması zorunludur. | "Lütfen hukuki statüyü seçin." |
| Sicil Numarası | \- OrdinaryPartnership için zorunlu değildir, diğer tip organizasyonlarda zorunludur.  <br><br/>\- En az 5, en fazla 30 karakter içermelidir. | "Lütfen geçerli bir sicil numarası girin." |
| MERSİS Numarası | \- SoleProprietorship, OrdinaryPartnership için zorunlu değildir, diğer tip organizasyonlarda zorunludur.  <br><br/>\- 16 haneli olmalıdır. | "MERSİS numarası 16 haneli olmalıdır." |
| Vergi Dairesi | \- Seçim yapılması zorunludur. | "Lütfen vergi dairesini seçin." |
| Faaliyet Konusu | \- En az 3, en fazla 255 karakter olmalıdır. | "Lütfen faaliyet konusunu girin." |
| Kuruluş Tarihi | \- OrdinaryPartnership tipinde olmayan kuruluşlarda boş bırakılamaz. - Geçerli bir tarih formatında olmalıdır. - Gelecek tarih olamaz. | "Lütfen geçerli bir kuruluş tarihi girin." |
| Kurulduğu Ülke | \- Seçim yapılması zorunludur. | "Lütfen kurulduğu ülkeyi seçin." |
| Sermaye Yapısı | \- Seçim yapılması zorunludur. | "Lütfen sermaye yapısını seçin." |
| Personel Sayısı | \- Pozitif bir tam sayı olmalıdır. | "Lütfen geçerli bir personel sayısı girin." |
| Dil Tercihi | \- Seçim yapılması zorunludur. | "Lütfen bir dil tercihi seçin." |
| Adres Adı | \- En az 3, en fazla 50 karakter içermelidir. | "Lütfen adres adı girin." |
| Adres Tipi | \- Seçim yapılması zorunludur. | "Lütfen adres tipi seçin." |
| Ülke | \- Seçim yapılması zorunludur. | "Lütfen ülke seçin." |
| İl / İlçe / Mahalle (Türkiye) | \- Türkiye seçildiğinde zorunlu olmalıdır. | "Lütfen il, ilçe ve mahalle seçin." |
| Cadde / Sokak | \- Opsiyoneldir. - En fazla 50 karakter içermelidir. | "Cadde ve sokak en fazla 50 karakter olmalıdır." |
| Bina No / Daire No | \- En az 1, en fazla 10 karakter olmalıdır. | "Bina/Daire numarası 1–10 karakter olmalıdır." |
| Posta Kodu | \- En az 4, en fazla 10 karakter olmalıdır. | "Lütfen geçerli bir posta kodu girin." |
| İrtibat Adresi | \- En az bir adres irtibat adresi olarak seçilmelidir. | "Lütfen bir irtibat adresi belirleyin." |
| E-posta | \- Boş bırakılamaz.  <br><br/>\- Tümü doğrulanmış olmalıdır. - Geçerli formatta olmalıdır (@ ve . içermelidir).  <br><br/>\- Tekrar eklenemez (case-insensitive e-posta). | "Lütfen geçerli bir e-posta adresi girin."  <br><br/>"Mükerrer iletişim adresi." |
| Telefon | \- Boş bırakılamaz.  <br><br/>\- Sabit telefon dışındakilerin tümü doğrulanmış olmalıdır. - Geçerli formatta olmalıdır (ülke kodu dahil 10-15 karakter).  <br><br/>\- Tekrar eklenemez (normalize telefon). | "Lütfen geçerli bir telefon numarası girin." "Telefon numarası OTP ile doğrulanmalıdır."  <br><br/>"Mükerrer iletişim adresi." |
| Asıl İletişim Kanalı | \- Aktif iletişim adreslerinden en az 1 e-posta ve 1 telefon asıl iletişim kanalı olarak seçilmelidir. | "Lütfen asıl iletişim kanalını belirleyin." |

&nbsp;

1. ## Yeni Yetkili Kişi

- Butonlar: Kişi Aktiviteleri (kişi işlem geçmişi), Bloke Et, Bloke Kaldır, Belge Yükleme, Belge Görme/İndirme, Taslak Kaydet (daha sonra devam etmek için), Kaydet, Vazgeç (Değişiklik varsa “Kaydetmeden çıkılsın mı?” uyarısı.)

- Adı ve Soyadı, Uyruğu, Kimlik No, Kimlik Tipi (ENUM: identity_document), Doğum Tarihi.

- Kişisel Bilgiler Paneli: Kişi No (değiştirilemez), KYC Seviyesi (ENUM: kyc_level), Oluşturma Tarihi, Status (ENUM: entity_status). Status değeri Blocked (ENUM: entity_blockage_reason) veya Closed (ENUM: entity_closure_reason) ise gerekçesi de yanına tire eklenerek yazılır, örneğin Bloke – Belge Eksik, Kapalı – Uzun Süre Kullanılmama, gibi.

- Erişim Bilgileri: Son Login (tarih-saat), Başarısız Erişim Teşebbüsü Sayısı (son login olduktan sonra), Cihaz Bilgileri, IP Lokasyonu. Servisten gelir değiştirilemez.

- Nüfus Bilgileri Paneli: Doğum Yeri, Medeni Durum (ENUM: marital_status), Seri No / Doküman No, Veriliş Tarihi, Veren Makam, Geçerlilik Tarihi, Anne Adı, Baba Adı, Cinsiyeti (ENUM: gender)

- Detay Bilgiler Paneli: Evlenmeden Önceki Soyadı, Vergi Ülkesi, Eğitim Durumu (ENUM: education_level), Çalışma Durumu (ENUM: employment_category), Mesleği (ENUM: employment_occupation).

- Yabancı Bireysel Kişi Paneli: Vize Tipi (ENUM: visa_type), Vize Bitiş Tarihi, Oturum İzni, Oturum İzni Bitiş Tarihi, Doğum Ülkesi, Yerleşik Olduğu Ülke. Sadece yabancı kişilerde görülür.

- Adres Paneli: Adres Adı, Tipi (ENUM: address_type), Ülke (combobox), İl (Türkiye ise combobox), İlçe (Türkiye ise combobox), Mahalle/Semt (Türkiye ise combobox), Cadde, Sokak, Bina No, Daire No, Posta Kodu, UAVT No (sadece Türkiye ise görülür ve otomatik çekilir), Ek Bilgiler (Apartman adı, site adı veya diğer açıklamalar...), İrtibat Adresi (checkbox). Yabancı yetkili kişilerde Ülke, İl, İlçe, Posta Kodu, Adres (textarea) olarak adres bilgisi alınır, diğer bilgiler alınmaz. Yetkili kişinin birden fazla adresi olabilir. Bir tanesini irtibat adresi seçmesi gerekmektedir.

- İletişim Bilgileri Paneli: İletişim Adresi, Asıl Adres (checkbox), Durum (ENUM: status), Actions (Tekrar Gönder, Düzenle, Sil) kolonlarını içeren ve E-posta ve Telefon bilgilerinin tutulduğu tablo. Tekrar Gönder aksiyonu, doğrulanmış satırlarda tetiklenirse kullanıcıya uyarı gösterilir: "İletişim adresi zaten doğrulandı!". Birden fazla e-posta ve telefon bilgisi eklenebilir. Telefonlardan 1 tanesi ve e-posta adreslerinden 1 tanesi asıl iletişim kanalı seçilmelidir. Kullanıcı bir satırı Asıl seçtiğinde, aynı kanaldaki önceki asıl otomatik olarak kaldırılır; sistem eski asıl adrese bilgilendirme gönderir: "Asıl iletişim adresiniz değiştirildi!" ve kullanıcıya UI’da bilgi mesajı gösterir. Kullanıcı yeni satır ekleyebilir, mevcut satırları düzenleyebilir veya silebilir. Silme ve iletişim adresinin güncellenmesi (adres alanı değişimi) işlemlerinde sistem, değişiklik öncesi (eski) adrese bilgilendirme gönderir: "İletişim adresiniz güncellendi!". (Asıl değişikliğinde ayrıca bilgilendirme zaten gönderilir.) Yeni satır ekleme esnasında tablonun altında yeni ve boş bir satır açılır; satır güncellemede mevcut bilgiler değiştirilebilir şekilde gösterilir; her ikisinde de satırın en sağında Kaydet ve İptal ikonları yer alır. Ekleme ve adres değişikliği içeren güncelleme esnasında yeni irtibat bilgileri doğrulanmalıdır. E-posta adresi doğrulama linki ile, Telefon numarası OTP ile doğrulanır. Kullanıcı girişi tamamladıktan sonra ilgili satırın sağında yer alan Kaydet ikonunu tetikler. Satır Telefon ise Doğrulama Modal’ı açılır (Doğrulama Kodu alanı ve Tekrar Gönder, Doğrula, İptal butonları). Doğrulama başarılı oluncaya veya kullanıcı İptal’e basıncaya kadar modal kapanmaz. İptal’e basılırsa modal kapanır ve satır Kaydet öncesi haline döner. Sabit telefonlar doğrulanmaz ve Asıl seçilemez. Tekrar Gönderme rate limit ile kısıtlanır (saniyede 1 adet, bir adres için 5 adet)

- Yeni kişi girişlerinde Kişisel Bilgiler Paneli ve Erişim Bilgileri gösterilmez.

- Kimlik No bilgisi girildikten sonra bu kimlik ile kişinin tanımı var ise mevcut bilgiler ile ekran doldurulur. Bu durumda eksik bilgiler girilebilir. Uyruğu Türkiye olan kişilerde Nüfus Bilgileri Paneli değiştirilemez, bunun dışındaki durumlarda bilgilerde değişiklik yapılabilir.

- Daha önce tanımlı yetkili kişi yoksa doğum tarihi bilgisi girildikten sonra yabancı olmayan kişiler için KPS’den kimlik bilgileri gelir ve Nüfus Bilgileri Paneli doldurulur. Nüfus Bilgileri Paneli bu kişiler için değiştirilemez.

- Nüfus Bilgileri Paneli, Temsilci uygulamasında kimlik belgesi yüklemesi ikinci taba geçmeden zorunlu tutulduğu için taranan kimlik üzerinden OCR ile otomatik doldurulur. Back-ofis uygulamasında ise tek sayfa (single page) olduğundan, belge yükleme adımına bağımlı bir akış kurgulanmadığı için Nüfus Bilgileri Paneli KPS’den otomatik doldurulur. Back-ofis ekranı da tablı/adım adım yapıya dönüştürülürse, "Nüfus Bilgileri" taba geçiş öncesi kimlik belgesi yüklemesi zorunlu hale getirilir ve Nüfus Bilgileri Paneli OCR çıktısından doldurulur.

- Yeni yetkili kişi oluşturma esnasında kullanıcı Kaydet butonuna bastığında sistem, zorunlu alanlar için yaptığı kontrollerden sonra belge kontrolü yapar; kişinin asgari olarak Identity kategorisinde onay gerektirmeyen veya onaylanmış (approval_required = false veya approval_status = Approved) belgesi olmalıdır. Son olarak da kimlik doğrulama ve sanction/kara liste kontrollerini otomatik biçimde arka planda başlatır. Kimlik doğrulama kapsamında, taranan kimlik belgesinin OCR ile elde edilen alanları KPS’den dönen kimlik bilgileri ile karşılaştırılır. Bu kontroller için kullanıcıdan ayrıca bir aksiyon (ayrı bir butona basma, ayrı bir ekran/işlem başlatma gibi) beklenmez.

- Mevcut yetkili kişi güncelleme esnasında Nüfus Bilgileri Paneli'nde değişiklik yapılmışsa, Kaydet’e basıldığında sistem kimlik doğrulama ve sanction/kara liste kontrolünü otomatik olarak tekrar çalıştırır. Bunun dışında yetkili kişinin KYC seviyesinin yükselmesi, adres ve ülke bilgilerinin değişikliği sanction/kara liste kontrolü tamamlanıp sonuç “uygun/temiz” olarak doğrulanmadan gerçekleştirilemez; kişinin kara liste kaydına rastlanırsa Status’u Blocked yapılır. Bunlar dışındaki değişikliklerde Kaydet butonunda kimlik doğrulama ve sanction/kara liste kontrolleri tetiklenmez.

- Taslak olarak kaydedilmiş yetkililerin statüleri Inactive olur.

|     |     |     |
| --- | --- | --- |
| Alan | Kontroller | Hata Mesajı |
| Adı ve Soyadı | \- Boş bırakılamaz. - En az 2, en fazla 255 karakter olmalıdır. - Sayısal ve özel karakter içeremez. | "Lütfen adı ve soyadı girin." "Adı ve soyadı en az 2, en fazla 255 karakter olmalıdır." "Adı ve soyadı yalnızca harf içermelidir." |
| Uyruğu | \- Seçim yapılması zorunludur. | "Lütfen uyruğu seçin." |
| Kimlik No | \- TUR vatandaşları için: 11 haneli, yalnızca rakam içermeli, ilk rakam 0 olamaz. - Yabancılar için: Pasaport No 1-20 karakter arasında alfanümerik olabilir. | "Kimlik No 11 haneli olmalıdır." "Kimlik No yalnızca rakam içermelidir."  <br><br/>"Pasaport No 1-20 alfanümerik karakterden oluşmalıdır." |
| Kimlik Tipi | \- Seçim yapılması zorunludur. | "Lütfen kimlik tipini seçin." |
| Doğum Tarihi | \- Boş bırakılamaz. - Geçerli format: GG.AA.YYYY. - Gelecek tarih olamaz. - 18 yaş altı olamaz. | "Lütfen geçerli bir doğum tarihi girin." "Doğum tarihi gelecek bir tarih olamaz." |
| Doğum Yeri | \- Boş bırakılamaz. - En az 2, en fazla 100 karakter içermelidir. | "Lütfen doğum yerini girin." |
| Medeni Durum | \- Seçim yapılması zorunludur. | "Lütfen medeni durumu seçin." |
| Seri No / Doküman No | \- Boş bırakılamaz.  <br><br/>\- En az 5, en fazla 30 karakter içermelidir. | "Lütfen geçerli bir belge numarası girin." |
| Veriliş Tarihi | \- Boş bırakılamaz. - Gelecek tarih olamaz. | "Lütfen geçerli bir veriliş tarihi girin." |
| Veren Makam | \- Boş bırakılamaz. - En az 3, en fazla 50 karakter içermelidir. | "Lütfen veren makamı girin." |
| Geçerlilik Tarihi | \- Format: GG.AA.YYYY olmalıdır. - Veriliş tarihinden önce olamaz.  <br><br/>\- Geçmiş bir tarih olamaz. | "Lütfen geçerli bir geçerlilik tarihi girin." |
| Anne Adı / Baba Adı | \- Kimlik Ülkesi Türkiye ise boş bırakılamaz.  <br><br/>\- En az 2, en fazla 50 karakter içermelidir. | "Lütfen anne ve baba adını girin." |
| Cinsiyet | \- Seçim yapılması zorunludur. | "Lütfen cinsiyet seçin." |
| Evlenmeden Önceki Soyadı | \- Kadınlarda medeni durum Married ise zorunludur. | "Evlenmeden önceki soyadı girilmelidir." |
| Vergi Ülkesi | \- Seçim yapılması zorunludur. | "Lütfen vergi ülkesini seçin." |
| Eğitim Durumu | \- Seçim yapılması zorunludur. | "Lütfen eğitim durumunu seçin." |
| Çalışma Durumu | \- Seçim yapılması zorunludur. | "Lütfen çalışma durumunu seçin." |
| Mesleği | \- Seçim yapılması zorunludur. | "Lütfen mesleği seçin." |
| Vize Tipi | \- Uyruğu TUR olmayan kişiler için seçim yapılması zorunludur. | "Lütfen vize tipini seçin." |
| Vize Bitiş Tarihi | \- Uyruğu TUR olmayan kişiler için geçerli ve gelecekte bir tarih olmalıdır. | "Lütfen vize bitiş tarihini girin." |
| Oturum İzni | \- Opsiyoneldir, en fazla 50 karakter içermelidir. | "Oturum izni en fazla 50 karakter olmalıdır." |
| Doğum Ülkesi / Yerleşik Olduğu Ülke | \- Uyruğu TUR olmayan kişiler için seçim yapılması zorunludur. | "Lütfen ülke seçin." |
| Adres Adı | \- En az 3, en fazla 50 karakter içermelidir. | "Lütfen adres adı girin." |
| Adres Tipi | \- Seçim yapılması zorunludur. | "Lütfen adres tipi seçin." |
| Ülke | \- Seçim yapılması zorunludur. | "Lütfen ülke seçin." |
| İl / İlçe / Mahalle (Türkiye) | \- Türkiye seçildiğinde zorunlu olmalıdır. | "Lütfen il, ilçe ve mahalle seçin." |
| Cadde / Sokak | \- Opsiyoneldir, en fazla 50 karakter içermelidir. | "Cadde ve sokak en fazla 50 karakter olmalıdır." |
| Bina No / Daire No | \- En az 1, en fazla 10 karakter olmalıdır. | "Bina/Daire numarası 1–10 karakter olmalıdır." |
| Posta Kodu | \- En az 4, en fazla 10 karakter olmalıdır. | "Lütfen geçerli bir posta kodu girin." |
| İrtibat Adresi | \- En az bir adres irtibat adresi olarak seçilmelidir. | "Lütfen bir irtibat adresi belirleyin." |
| E-posta | \- Boş bırakılamaz.  <br><br/>\- Tümü doğrulanmış olmalıdır. - Geçerli formatta olmalıdır (@ ve . içermelidir).  <br><br/>\- Tekrar eklenemez (case-insensitive e-posta). | "Lütfen geçerli bir e-posta adresi girin."  <br><br/>"Mükerrer iletişim adresi." |
| Telefon | \- Boş bırakılamaz.  <br><br/>\- Sabit telefon dışındakilerin tümü doğrulanmış olmalıdır. - Geçerli formatta olmalıdır (ülke kodu dahil 10-15 karakter).  <br><br/>\- Tekrar eklenemez (normalize telefon). | "Lütfen geçerli bir telefon numarası girin." "Telefon numarası OTP ile doğrulanmalıdır."  <br><br/>"Mükerrer iletişim adresi." |
| Asıl İletişim Kanalı | \- Aktif iletişim adreslerinden en az 1 e-posta ve 1 telefon asıl iletişim kanalı olarak seçilmelidir. | "Lütfen asıl iletişim kanalını belirleyin." |

&nbsp;

1. ## Temsilci Grup Yönetimi

- Temsilci gruplarının tanımlandığı ve yönetildiği ana ekrandır. Gruplar, temsilcilerin ücret ve komisyon hesaplamalarında kullanılan temel sınıflandırmadır. Bu ekranda yalnızca grup master verisi yönetilir; ücret/komisyon tanımları bu ekrandan yapılmaz.

- Grup Kodu, Grup Adı, Açıklama, Temsilci Sayısı, İşlem Başı Ortalama Ücret, Temsilci Başı Ortalama İşlem Adedi, Status (ENUM: status) kolonlarının olduğu tüm grupların listelendiği tablo.

- Yeni ekleme yapılacağında en alta boş satır açılır, değişiklik yapılacağında satırdaki değerler değiştirilebilir olur. Veya modal veya yeni sayfa da kullanılabilir, hangisi kolaysa. Ancak detay sayfasına ihtiyaç bulunmamaktadır.

- Grup Kodu sistemsel anahtar niteliğindedir ve update ekranında değiştirilemez. Değişiklik ihtiyacında yeni grup tanımlanmalıdır.

- Temsilci Sayısı alanı hesaplanmış (read-only) bir alandır ve ilgili grubun aktif temsilci sayısını gösterir.

- İşlem Başı Ortalama Ücret ve Temsilci Başı Ortalama İşlem Adedi alanları hesaplanmış (read-only) bir alandır ve ilgili grubun son 1 aylık gerçekleşen işlemlerine göre hesaplanır. Her iki metrik de günde 1 kez batch job ile hesaplanır; ekran anlık hesaplama yapmaz. Hesaplamalarda yalnızca tamamlanmış (başarılı) işlemler dikkate alınmalıdır. Son 1 ayda işlemi olmayan gruplar için ilgili alanlar boş veya “-” olarak gösterilir. İşlem Başı Ortalama Ücret işlemin gerçekleştiği tarihteki kur dikkate alınarak Türk Lirası üzerinden hesaplanır.

- Bir grup pasife alınmadan önce, bu gruba bağlı aktif temsilci bulunup bulunmadığı kontrol edilmelidir. Aktif temsilcisi olan gruplar için pasife alma işlemi engellenmeli ve kullanıcı bilgilendirilmelidir. Grubun pasife alınması geçmiş temsilci atamalarını ve ücret tanımlarını silmez; yalnızca ileriye dönük kullanımını engeller.

- Sistemde operasyonel hataları azaltmak amacıyla en az bir adet varsayılan temsilci grubunun tanımlı olması gereklidir. Varsayılan grup silinemez ve pasife alınamaz. Sisteme yeni eklenen her temsilci otomatik olarak varsayılan gruba atanır.

**Temsilci**\*\*-\*\***Grup** **İlişkisi**

- Menüde yer almaz, sadece gereken hallerde açılır. Seçili temsilci grubuna ait temsilcilerin listelendiği ve temsilcilerin ilgili gruba manuel olarak atandığı ekrandır. Bu ekranda grup bilgileri değiştirilmez; yalnızca temsilci–grup ilişkisi yönetilir.

- Temsilci Kodu, Temsilci Adı, İl, İlçe, İşlem Başı Ortalama Ücret, Ortalama İşlem Adedi, Mevcut Grup, Grup Atama Tarihi, Status (ENUM: status) kolonlarının olduğu bir grupla ilişkilendirilmiş tüm temsilcilerin listelendiği tablo. Varsayılan görünümde yalnızca aktif atamalar gösterilir. Pasif atamalar filtreler ile ekrana getirilebilir.

- Yeni ekleme yapılacağında en alta boş satır açılır, değişiklik yapılacağında satırdaki değerler değiştirilebilir olur. Veya modal veya yeni sayfa da kullanılabilir, hangisi kolaysa. Ancak detay sayfasına ihtiyaç bulunmamaktadır.

- Temsilciler bu gruba manuel olarak atanır. Ekleme için temsilcinin İl, İlçe, İşlem Başı Ortalama Ücret, Ortalama İşlem Adedi, Grup Atama Tarihi bilgileri değiştirilmez ve doldurulmaz. Bu bilgiler yalnızca filtreleme ve seçim kolaylığı sağlamak amacıyla kullanılır.

- İşlem Başı Ortalama Ücret ve Ortalama İşlem Adedi alanları hesaplanmış (read-only) bir alandır ve ilgili grubun son 1 aylık gerçekleşen işlemlerine göre hesaplanır. Her iki metrik de ayda 1 kez batch job ile hesaplanır; ekran anlık hesaplama yapmaz. Hesaplamalarda yalnızca tamamlanmış (başarılı) işlemler dikkate alınmalıdır. Son 1 ayda işlemi olmayan temsilciler için ilgili alanlar boş veya “-” olarak gösterilir. İşlem Başı Ortalama Ücret işlemin gerçekleştiği tarihteki kur dikkate alınarak Türk Lirası üzerinden hesaplanır.

- Ekranın üst bölümünde seçili grubun Grup Kodu ve Grup Adı bilgileri read-only olarak gösterilir.

- Aynı anda bir temsilci yalnızca bir aktif gruba bağlı olabilir. Bir temsilci bu gruba atandığında, varsa daha önce bağlı olduğu aktif gruptaki temsilci-grup eşleşme kaydı otomatik olarak pasife alınır ve yeni atama kaydı oluşturulur.

- Temsilci atamaları tarihsel olarak izlenebilir olmalıdır. Grup Atama Tarihi alanı, ilgili atama kaydının başlangıç tarihidir, bu gruba yeniden atanırsa yeni atama kaydı ve yeni tarih oluşur.

- Temsilcinin gruptan çıkarılması işlemi, temsilcinin bu grup ile olan ilişkisinin pasife alınması anlamına gelir; temsilci silinmez. Gruptan çıkarılan temsilcinin aktif bir grubu kalmıyorsa, sistem tarafından varsayılan temsilci grubuna atanması zorunludur.

- Pasif durumdaki gruplar için bu ekranda yeni temsilci ataması yapılamaz; yalnızca mevcut atamalar görüntülenebilir.

- Mevcut Grup kolonu her zaman dolu olmalıdır. Grubu olmayan veya gruptan çıkarılan temsilciler varsayılan gruba atanır.

1. ## Temsilci Ücret ve Komisyonları

- Temsilci grupları bazında ücret ve komisyon tanımlarının yapıldığı ekrandır. Bu ekranda tanımlanan ücret ve komisyonlar, ilgili gruba bağlı temsilcilerin işlemlerinde uygulanır. Bu ekranda yapılan değişiklikler ileriye dönük olarak geçerlidir; geçmiş işlemlerin ücret ve komisyon hesaplamaları geriye dönük olarak etkilenmez. Ücret ve komisyon hesaplamalarında, işlem anında temsilcinin bağlı olduğu aktif grup ve bu grup için tanımlı aktif ücret ve komisyon kayıtları esas alınır.

- Grup Kodu, İşlem (ENUM: transaction_type), Para Birimi (ENUM: currency), Alt Limit, Sabit Ücret, Değişken Ücret (%), Başlangıç Tarihi, Bitiş Tarihi, Status (ENUM: status) kolonlarının olduğu tüm ücret ve komisyonların listelendiği tablo. Varsayılan görünümde yalnızca aktif ücret/komisyon kayıtları gösterilir. Pasif ücret/komisyon kayıtları filtreler ile ekrana getirilebilir.

- Yeni ekleme yapılacağında modal açılır, detay sayfasına ihtiyaç bulunmamaktadır. Grup Kodu mevcut grup listesinden seçilir.

- Pasif durumdaki gruplar için bu ekranda yeni ücret ve komisyon tanımı yapılamaz; yalnızca geçmiş tanımlar görüntülenebilir.

- Alt Limit alanı zorunludur ve sıfıra eşit veya sıfırdan büyük olmalıdır.

- Alt Limit alanı, ücret ve komisyon skalasının alt eşik değerini ifade eder. Maksimum tutar bilgisi tutulmaz. Hesaplama sırasında sistem, işlem tutarı için işlem tutarına eşit veya daha küçük olan en yüksek Alt Limit değerine ait ücret ve komisyon tanımını uygular. Örneğin 0–10.000 TL için %5, 10.000–20.000 TL için %2 ve 20.000 TL üzeri için %1 oran tanımlandığında, sistemde bu yapı sırasıyla 0 için %5, 10.000 için %2 ve 20.000 için %1 şeklinde saklanır. Bu nedenle 15.000 TL’lik bir işlemde otomatik olarak %2, 30.000 TL’lik bir işlemde ise %1 komisyon oranı uygulanır.

- Aynı Grup Kodu ve İşlem için birden fazla Alt Limit tanımı yapılabilir. Aynı Grup Kodu, İşlem, Para Birimi ve Alt Limit kombinasyonu için aynı anda yalnızca bir aktif kayıt bulunabilir. Eğer yeni bir kayıt oluşturulursa, uyarı verilerek kullanıcıdan validasyon alınır, mevcut aktif kayıt otomatik olarak pasife alınır; ilgili satırın Bitiş Tarihi doldurulur ve Status alanı güncellenir.

- Farklı bir Alt Limit değeri ile kayıt girilmesi durumunda mevcut kademeler korunur. Alt Limit alanına tabloda mevcut olmayan yeni bir değer (örneğin 0, 10.000 ve 20.000 TL kademeleri varken 15.000 TL) girildiğinde bu kayıt yeni bir kademe olarak değerlendirilir, mevcut kademeler korunur.

- Her Grup Kodu, İşlem ve Para Birimi kombinasyonu için Alt Limit değeri 0 olan en az bir aktif ücret/komisyon kaydının bulunması zorunludur. Alt Limit = 0 içermeyen kombinasyonlar için sistem ücret hesaplamasına izin vermez.

- Başlangıç Tarihi ve Bitiş Tarihi alanları opsiyoneldir. Başlangıç Tarihi boş bırakılırsa kayıt oluşturulduğu tarih başlangıç tarihi olarak kabul edilir. Başlangıç tarihi henüz gelmemiş veya Bitiş Tarihi geçmiş kayıtlar günlük batch job ile pasife alınır.

- Ücret ve komisyon hesaplaması, işlem anında temsilcinin bağlı olduğu aktif grup üzerinden yapılır. Hesaplamada yalnızca ilgili grup için tanımlı, aktif, İşlem Tipi ve Para Birimi işlem ile uyumlu ücret kayıtları esas alınır. İşlem tutarı için, işlem tutarına eşit veya daha küçük olan Alt Limit değerleri arasından en yüksek Alt Limit’e sahip kayıt seçilir. Temsilciye Ödenecek Ücret = Sabit Ücret + Değişken Ücret (%) \* İşlem Tutarı şeklinde hesaplanır. Ücret ve komisyon hesaplamalarında, para biriminin minor unit kuralına göre yuvarlama yapılır.

&nbsp;

1. # Dijital Cüzdanlar

- Müşteri/Temsilci No, Hesap No, Hesap Tipi (ENUM: wallet_type), Ad-Soyad, Telefon, Kimlik No, Kullanılabilir Bakiye, Para Birimi, Bloke Miktarı, Günlük İşlem Adedi, Günlük İşlem Tutarı, Oluşturma Tarihi kolonlarının olduğu, tüm cüzdanların listelendiği bir tablo.

- Rol bazlı görünürlük sağlanabilir. Örneğin, Operasyon ekibi müşteri/temsilci hesaplarını, Finans/Muhasebe ekibi reserve/revenue/suspense tipi hesapları ve Uyum birimi gerekli gördüğünü tüm hesapları görür.

- Sistem cüzdanlarında (reserve/revenue/suspense vb.) kişi alanları ‘-’ olarak gösterilir.

**Cüzdan Detay**

- Butonlar: Cüzdan Aktiviteleri, Bakiye Blokesi, Not Ekle.

- Müşteri/Temsilci No, Hesap No, Ad-Soyad, Telefon, Kimlik No, Bakiye, Para Birimi, Bloke Miktarı, Kullanılabilir Bakiye, Oluşturma Tarihi, Notlar

- İşlem Bilgileri Paneli: Son İşlem Tarihi, Son İşlem Tutarı, Günlük İşlem Adedi, Günlük İşlem Tutarı

- Para Çekme Limitleri Paneli: Para Çekme İşlem Limiti, Günlük Para Çekme Limiti, Günlük Para Çekme Tutarı, Aylık Para Çekme Limiti, Aylık Para Çekme Tutarı

- Para Transfer Limitleri Paneli: Para Transfer İşlem Limiti, Günlük Para Transfer Limiti, Günlük Para Transfer Tutarı, Aylık Para Transfer Limiti, Aylık Para Transfer Tutarı

- Uluslararası Transfer Limitleri Paneli: Uluslararası Transfer İşlem Limiti, Günlük Uluslararası Transfer Limiti, Günlük Uluslararası Transfer Tutarı, Aylık Uluslararası Transfer Limiti, Aylık Uluslararası Transfer Tutarı

- Geçmiş Limitler Paneli: Başlangıç Tarihi, Bitiş Tarihi, Limit Grubu (Para Çekme, Para Transfer, Uluslararası Transfer), Limit Tipi (Tek İşlem, Günlük, Aylık), Tutar, Değişikliği Yapan, Onaylayan kolonlarının olduğu, tüm cüzdana özel geçmiş limitlerin listelendiği bir tablo.

- Blokaj sadece çıkış yönlü uygulanır, cüzdana para girişi bloke edilmez.

- Bloke Miktarı = -1 ise Kullanılabilir Bakiye = 0’dır. Bunun dışında Kullanılabilir Bakiye = max(0, Bakiye – Bloke Miktarı) şeklinde hesaplanır. Bloke Miktarı=0 ise bloke yoktur, -1 ise cüzdandaki mevcut ve gelecek tüm tutar blokedir. Bloke Miktarı bakiyeden yüksek olabilir.

- Ekrandan doğrudan sadece limit alanları değiştirilebilir. Butonlarda açılan modallar üzerinden Bloke Miktarı ve Notlar alanları değiştirilebilir. Diğer alanlar değiştirilemez, otomatik doldurulur.

- Bakiye Blokesi butonu tıklandığında bir modal açılır ve kullanıcıdan Gerekçe girmesi beklenir.

- Bakiye Blokesi butonu tıklandığında bir modal açılır, modal’da Bloke Edilecek Tutar (zorunlu – mevcut bloke tutar değiştirilebilir olarak gelir), Bloke Bitiş Tarihi (opsiyonel, gün bazlı) ve Gerekçe (zorunlu) alanları yer alır. Bloke Bitiş Tarihi yalnızca ileri tarih olabilir; boş bırakılırsa bloke süresiz kabul edilir. Bloke bitiş tarihine ulaşıldığında günlük batch süreç blokeyi otomatik kaldırır.

- Notlar: Notlar silinemez veya değiştirilemez, her eklenen not "Ad Soyad – Tarih – Aksiyon: Not" şeklinde mevcut notların en altında eklenir.

**Cüzdan Aktiviteleri**

- İşlem Numarası, İşlem Tarihi, İşlem Yönü (ENUM: transaction_direction), Karşı Taraf No, Karşı Taraf Adı ve Soyadı / Unvanı, Karşı Hesap (Cüzdan No / IBAN), Gönderen Temsilci No, Alıcı Temsilci No, Referans No, İşlem Türü (ENUM: transaction_type), Para Birimi, Tutar, İşlem Sonrası Bakiye, Status (ENUM: transaction_status) kolonlarının olduğu, seçili cüzdana ait tüm para hareketlerinin listelendiği bir tablo.

- Para Transferleri listeleme sayfasıdır; yalnızca seçili cüzdana giren veya seçili cüzdandan çıkan işlemler gösterilir. Satıra tıklandığında İşlem Detay sayfası açılır.

- İşlem Yönü, işlem tipine göre değil işlemin bakiyeye etkisine göre belirlenir; bakiye artıyorsa Para Girişi, azalıyorsa Para Çıkışı olarak gösterilir.

- Tutar alanı her zaman pozitif değer olarak gösterilir; artı/eksi etkisi İşlem Yönü ile ifade edilir. İşlem Sonrası Bakiye, seçili cüzdanın işlem sonrası bakiyesini gösterir ve gönderen/alıcı ayrımı yapılmaksızın tamamen bu cüzdan perspektifidir.

- Varsayılan sıralama İşlem Tarihi’ne göre yeniden eskiye olacak şekilde yapılır; kullanıcı kolon bazlı sıralama yapabilir.

&nbsp;

1. # Para Transferleri

- İşlem Numarası, İşlem Tarihi, Gönderen Müşteri No, Gönderen Cüzdan, Gönderen Adı ve Soyadı / Unvanı, Alıcı Müşteri No, Alıcı Cüzdan, Alıcı Adı ve Soyadı / Unvanı, Gönderen Temsilci No, Alıcı Temsilci No, IBAN, İşlem Türü, Para Birimi, Tutar, Status (ENUM: transaction_status) kolonlarının olduğu, tüm para hareketlerinin listelendiği bir tablo.

- Tutar/Para Birimi, işlem tasarımında Kaynak tutarı esas alınarak gösterilir. Hedef tutar/para birimi işlem detay ekranında yer alır.

**İşlem Detay**

- Butonlar: İşlemi Bloke Et, Bloke Kaldır, İptal Et, Onaya Gönder, Onayla, Geri Dön. Ekran İade / İptal / Düzeltme ekranından açılmışsa Onaya Gönder, Onayla, Geri Dön butonları görünür, diğer durumlarda görünmez.

- Gönderen: Adı ve Soyadı / Unvanı, Müşteri No, Cüzdan Numarası, Telefon, Ülke.

- Alıcı: Adı ve Soyadı / Unvanı, Müşteri No, Cüzdan Numarası, Telefon, E-posta, IBAN, Ülke. IBAN alanı yalnızca bankaya giden/IBAN içeren akışlarda doludur.

- Referans: İşlem Referans No, Yurt Dışı Referans No.

- İşlem ve Tutarlar: Kaynak Para Birimi, Gönderilen Tutar, Sabit Ücret, Oransal Ücret, Toplam Ücret (Sabit Ücret + Oransal Ücret toplamı), Gönderenin Ödeyeceği Toplam Tutar (Gönderilen Tutar + Toplam Ücret), Hedef Para Birimi, Döviz Kuru, Alıcının Alacağı Net Tutar. Kaynak Para Birimi ve Hedef Para Birimi yalnızca döviz/çapraz para birimli akışlarda gösterilir; diğer akışlarda Para Birimi olarak tek alan gösterilir.

- İşlem Detayları: Para Gönderme Tarihi, Para Çekme Tarihi, İşlem Türü (ENUM: transaction_type), Ödeme Türü (ENUM: payment_purpose), İşlem Status (ENUM: transaction_status), İşlem Açıklaması.

- Gönderen Yetkili Kişi: Adı Soyadı, Müşteri No, Telefon, Yetki Doğrulama Zamanı. Panel yalnızca Gönderen Tipi = Tüzel ise görünür.

- Alıcı Yetkili Kişi: Adı Soyadı, Müşteri No, Telefon, Yetki Doğrulama Zamanı. Panel yalnızca Alıcı Tipi = Tüzel ise görünür.

- Gönderen Temsilci: Gönderen Temsilci No, Gönderen Temsilci, Yetkili Kişi Adı ve Soyadı, Yetkili Kişi No.

- Alıcı Temsilci: Alıcı Temsilci No, Alıcı Temsilci, Yetkili Kişi Adı ve Soyadı, Yetkili Kişi No.

- İşlem Belgeleri: Yüklenme Tarihi, Doküman Kategorisi (ENUM: document_category), Doküman Türü, Belge Durumu (ENUM: document_status), Onay Durumu (ENUM: approval_status – onay zorunlu değilse "-" işareti gösterilir), Geçerlilik kolonlarının olduğu işlem esnasında gönderenden veya alıcıdan alınan Identity, ProofOfTransaction kategorilerinde yüklü dokümanların listelendiği tablo. Doküman indirilebilir veya doküman detay sayfası açılabilir.

- Ekrandaki değerler doğrudan değiştirilemez, sadece butonlar aracılığıyla değişiklik yapılabilir.

- Gönderen Cüzdan veya Alıcı Cüzdan tıklandığında ilgili cüzdanın bilgilerinin sunulduğu Cüzdan Detay sayfası açılır.

- Bloke Et butonları sadece Pending işlemlerde; Bloke Kaldır butonu sadece OnHold işlemlerde; İptal Et butonu sadece Pending ve OnHold işlemlerde görünür.

- Bloke Et, Bloke Kaldır, İptal Et butonları tıklandığında bir modal açılır ve kullanıcıdan Gerekçe girmesi beklenir. Bu işlemlerin gerçekleşebilmesi için gerekçe girişi zorunludur. Notlar silinemez veya değiştirilemez, her eklenen not "Ad Soyad – Tarih – Aksiyon: Not" şeklinde notların en altında eklenir.

1. ## İade / İptal / Düzeltme

- Butonlar: Vazgeç, Onaya Gönder

- Talep/Şikâyet No, İşlem No (iade, iptale veya düzeltmeye sebep olan işlemin numarası – opsiyonel), Kaynak Müşteri, Kaynak Cüzdan, Hedef Müşteri, Hedef Cüzdan, Aktarılacak Tutar, Para Birimi, İşlem Açıklama, Aktarım Sebebi (ENUM: correction_reason), Manüel İşlem Açıklaması alanlarının olduğu, manüel para transfer formu.

- Kaynak hesabın Kasa olduğu işlemlerde maksimum tutar bilgisi parametre olarak saklanır. Bu tutarın üzerinde işlem yapılamaz.

- Girilen Aktarılacak Tutar ve Talep Para Birimi esas alınır. Sistem, bu tutarı kullanılacak kur üzerinden Kaynak cüzdanın para birimine çevirerek Kaynak Cüzdandan Çıkış Tutarını ve Hedef cüzdanın para birimine çevirerek Hedef Cüzdana Giriş Tutarını hesaplar ve her iki tutarı da ilgili para biriminin minor unit kuralına göre yuvarlar.

- Bu ekrandan düzeltme işlemleri gerçekleştirildiği için herhangi bir cüzdandan başka bir cüzdana transfer gerçekleştirilebilir. Manüel transfer (iade/iptal/düzeltme) işlemleri yalnızca yetkili roller tarafından yapılır ve yüksek riskli tutarlarda maker-checker (ikinci onay) gerektirir. Her işlem için Aktarım Sebebi + Manüel İşlem Açıklaması zorunludur.

- Manüel işlemlerde (iade/iptal/düzeltme) opsiyonel olarak ek doküman iliştirilebilir; dokümanlar ilgili işleme bağlanır ve sonradan değiştirilemez.

- Bu ekranda onay zorunlu olduğu için buton doğrudan Kaydet veya Gönder değil Onaya Gönder seçilmiştir. Onaya Gönder tetiklendiğinde kullanıcı İşlem Detay ekranına yönlendirilir. Bu ekran yalnızca kontrol amaçlıdır; mevcut işlemler üzerinde başka aksiyonlara izin vermez. Kullanıcı Geri Dön (Düzenle) ile forma dönerek değişiklik yapabilir veya Onaya Gönder ile talebi onay akışına iletebilir.

&nbsp;

1. # Bankalar

2. ## Entegre Bankalar

- Banka Adı, Servis, EFT Başlangıç Zamanı, EFT Bitiş Zamanı, Varsayılan EFT Bankası (tick, X), IBAN Kontrol, Varsayılan IBAN Kontrol Bankası (tick, X), Fast, Varsayılan Fast Bankası (tick, X), Mutabakat Ücreti Uygulanır (tick, X), Son Başarılı Çağrı Zamanı, Status (ENUM: entity_status) kolonlarının olduğu, entegre tüm bankaların listelendiği bir tablo.

- Yeni ekleme yapılacağında en alta boş satır açılır, değişiklik yapılacağında satırdaki değerler değiştirilebilir olur. Veya modal veya yeni sayfa da kullanılabilir, hangisi kolaysa. Ancak detay sayfasına ihtiyaç bulunmamaktadır.

- Her özellik için aynı anda yalnızca 1 banka “varsayılan” olabilir. (Örn: Varsayılan EFT Bankası = X olan tek kayıt bulunur.) İlgili özellik aktif kullanılıyorsa (EFT/FAST/IBAN kontrol), bu özellik için en az 1 aktif banka tanımlı olmalıdır; aksi halde işlem başlatılamaz veya ilgili fonksiyon devre dışı bırakılır. Varsayılan olan bir banka pasife alınamaz; önce başka bir banka varsayılan seçilmelidir.

- EFT başlangıç/bitiş saatleri çalışma günü takvimi ile birlikte değerlendirilir.

1. ## Banka Hesap Bilgileri

- Banka, Hesap Tipi (ENUM: bank_account_type), IBAN, Para Birimi, Bakiye, Şube Kodu, Hesap No, Ek No, Son Güncelleme Zamanı, Status (ENUM: entity_status) kolonlarının olduğu tablo.

- Yeni ekleme yapılacağında en alta boş satır açılır, değişiklik yapılacağında satırdaki değerler değiştirilebilir olur. Veya modal veya yeni sayfa da kullanılabilir, hangisi kolaysa. Ancak detay sayfasına ihtiyaç bulunmamaktadır.

- Bakiye bilgisi dış entegrasyon ile otomatik doldurulur, kullanıcı tarafından değiştirilemez.

- Aynı IBAN sistemde birden fazla kez aktif olarak tanımlanamaz.

1. ## Banka Hesap Hareketleri

- Kaynak Banka, Kaynak IBAN, Hedef Banka, Hedef IBAN, Para Birimi, Tutar, İşlem Durumu (ENUM: payment_status), İşlem Tipi (ENUM: bank_transfer_method), Oluşturma Tarihi, İşlem Tarihi, Referans No, Ad-Soyad, Vergi No, Banka İşlem No, Açıklama, Hata Mesajı kolonlarının olduğu, banka hesaplarına gerçekleşen para giriş çıkışlarının listelendiği bir tablo.

- Yeni ekleme yapılamaz ve değiştirilemez, banka servislerinden doldurulur.

- Banka İşlem No + Kaynak Banka + İşlem Tarihi (veya bankanın sağladığı benzersiz anahtar) kombinasyonu ile mükerrer kayıt engellenir; mükerrer gelen kayıtlar güncellenmez, yalnızca ‘tekrar alındı’ bilgisi loglanır.

1. ## Banka Mutabakatı

- Banka, İşlem Tarihi, İşlem Tipi, Referans No, Tutar, Banka Para Birimi, Tutar, Mutabakat Tarihi, Status (ENUM: reconciliation_status), Talep No kolonlarının olduğu, firma ve banka verilerine göre işlem kayıtlarının listelendiği ve karşılaştırılarak farkların sunulduğu bir tablo.

- Tutar eşleştirmesinde para birimi minor unit kuralına göre tolerans uygulanabilir (örn. 0.01). İşlem Tarihine de toleransı uygulanabilir (örn. ±1 saat). Tolerans parametre olarak yönetilir.

- Eşleştirme varsayılan olarak Referans No üzerinden yapılır; bulunamazsa sırasıyla (Banka İşlem No) ve (Tutar+Para Birimi+İşlem Tarihi±tolerans) kombinasyonları ile eşleştirme denenir.

- Fark olan satırlar renkli olarak sunulur. Renkler yalnızca görsel destek amaçlıdır; asıl bilgi Status alanıdır.

- Yeni ekleme yapılamaz ve değiştirilemez, servislerden doldurulur.

- Mutabakat satırı Unmatched olduğunda sistem otomatik olarak Destek Merkezi’nde bir talep oluşturur ve mutabakat satırı ile ilişkilendirir. Talep oluşturulurken atanacak sorumlu routing parametreleri ile belirlenir; case_action=Assignment ve case_status=Assigned üretilir. Oluşturulan talebin Talep No bilgisi mutabakat satırında Talep No kolonunda gösterilir ve tıklandığında ilgili talebin detayına yönlendirir.

- Aynı mutabakat satırı için Referans No ile ilişkilendirilmiş aynı anda yalnızca 1 adet açık talep bulunabilir. Aynı satır tekrar Unmatched olarak işlense dahi yeni talep açılmaz; mevcut talep üzerine aksiyon/log eklenir.

- Mutabakatsızlık tutarına bağlı olarak parametre tablosundan Aciliyet ve Kritiklik seviyesi belirlenir.

- İlişkili talep case_status=Resolved_IssueFixed veya uygun bir Resolved_\* statüsü ile kapatıldığında (ve case_action=CaseClosed işlendiğinde) mutabakat satırı sistem tarafından otomatik olarak Adjusted statüsüne çekilir. Statü güncellemesi idempotent olmalıdır (aynı kapanış olayı tekrar işlense bile satırda mükerrer güncelleme/yan etki oluşmaz).

&nbsp;

1. # Risk ve Uyum

- Bir dashboard'da küçük paneller halinde bütün raporlar gösterilir. Tablo olarak gösterilmesi gereken paneller ilk 10 satır gösterilir, kullanıcı isterse tabloyu tam ekran yapabilir. Tam ekran tablolarda grid ekranlarda olduğu gibi sıralama ve filtreleme yapılabilir.

- Vaka Yaşı Raporu: 0-1 günlük vaka sayısı, 1-5 günlük vaka sayısı, 5-10 günlük vaka sayısı, >10 günlük vaka sayısı. Tüm vakalar tekil olarak bir aralığa düşmelidir.

- Müşteriler: Müşteri No, Adı ve Soyadı / Unvanı, Vaka Sayısı, Bloklanan İşlem Sayısı, Risk Skoru, İtiraz Sayısı (Gönderen veya Alıcının müşteri olduğu itirazlar). Varsayılan durumda itiraz sayısına göre yüksekten düşüğe doğru sıralanır.

- Temsilciler: Temsilci No, Adı ve Soyadı / Unvanı, Vaka Sayısı, Bloklanan İşlem Sayısı, Risk Skoru, İtiraz Sayısı (Gönderen veya Alıcının temsilci olduğu itirazlar). Varsayılan durumda itiraz sayısına göre yüksekten düşüğe doğru sıralanır.

- Kural Performans Raporu: number of alerts generated, number of cases opened, number/rate of true positives, average case finish duration. Eşik değerleri, false pozitif sayısını azaltacak ve false negative sayısını arttırmayacak şekilde raporun incelenmesi ile belirlenir.

- Personel Performans Raporu: number of cases handled, number/rate of escalation, number/rate of reject, number/rate of approve, total workload of closed cases.

- Yüksek riskli olmasına rağmen onaylanan işlemler. Varsayılan durumda yeniden eskiye doğru sıralanır.

1. ## Risk Skor Tanımlama

- Butonlar: Simülasyon, Kaydet ve Devam Et, Kaydet ve Bitir, Pasifleştir (Pasif kurallarda Aktifleştir şeklinde gelir), İptal

- Müşteri Paneli: Ekle Butonu ve Başlık, Koşul, Skor Katkısı, Açıklama, Status (ENUM: fraud_rule_status) kolonlarından oluşan tablo.

- Müşteri Aksiyon Paneli: Düşük Risk Aksiyonlar, Orta Risk Aksiyonlar, Yüksek Risk Aksiyonlar, Çok Yüksek Risk Aksiyonlar.

- Temsilci Paneli: Ekle Butonu ve Başlık, Koşul, Skor Katkısı, Açıklama, Status (ENUM: fraud_rule_status) kolonlarından oluşan tablo.

- Temsilci Aksiyon Paneli: Düşük Risk Aksiyonlar, Orta Risk Aksiyonlar, Yüksek Risk Aksiyonlar, Çok Yüksek Risk Aksiyonlar.

- İşlem Paneli: Ekle Butonu ve Başlık, Koşul, Skor Katkısı, Açıklama, Status (ENUM: fraud_rule_status) kolonlarından oluşan tablo.

- İşlem Aksiyon Paneli: Düşük Risk Aksiyonlar, Orta Risk Aksiyonlar, Yüksek Risk Aksiyonlar, Çok Yüksek Risk Aksiyonlar.

- Koşul yazım alanlarının hemen yanında Doğrula butonu olur, buton yazımın işletilebilir olup olmadığını test eder ve kullanıcıya yazdığı koşulda sorun olup olmadığı ve sorun varsa nereden kaynaklandığı konusunda bilgi verir.

- Ekle butonu ile açılan modal'dan yeni risk kalemi eklenir.

- Bir entity'nin riski ağırlıklı toplam yoluyla bulunur. Ağırlıklar default 1 olarak gelir. Sonrasında yapay zekâ modeli (örneğin isolation forest) eklendiğinde ağırlıkların otomatik güncellenmesi sağlanacaktır.

- Müşteri riski müşteri ile ilgili her değişiklikte, temsilci riski günlük + anomali tetiklenirse anlık olarak ve işlem riski her işlemde yeniden hesaplanır. Müşteri ve temsilci riskleri değiştikçe eski risk bilgisi kaybedilmeden yeni risk bilgisi veritabanına kaydedilir.

- Risk Sınıfları: Low (0–30), Medium (31–60), High (61–90), Critical (91-100). ENUM: level.

- Koşul: TextArea içerisine kuralın manuel yazıldığı alandır. Kural tanımlamada kullanılan değişkenler ve operatörler burada da kullanılır.

- Skor aralığına göre aksiyon tanımlama: Kural tanımlama ekranındaki aksiyonların aynısıdır. Sadece AddRisk (Risk Puanı Ekle) seçeneği burada getirilmez.

- Simülasyon butonu ile açılır pencerede, güncel durumda risk sınıfı değişecek müşteri ve temsilci adetleri eski ve yeni sınıfları ile getirilir. Eğer yapılabilirse son 6 aylık veri kullanılarak risk sınıfı değişen işlem adetleri de getirilir.

1. ## Risk Bazlı Limitler & Kısıtlar

- Bu ekranda müşteri ve temsilciler için risk skoruna bağlı global ve entity-özel limit/kısıt politikaları tanımlanır.

- Entity Type (ENUM: entity_type_core), Risk Sınıfı (ENUM: level + global seçeneği de eklenir), Tek İşlem Limiti, Günlük Toplam Limit, Aylık Toplam Limit, Tek İşlem Onay Eşiği, Yurtdışı Gönderim (İzinli / Yasak)

- Değer anlamları: 0 = ilgili işlem kapalı, izin verilmez, -1 = ilgili işlem limitsizdir.

- Risk Sınıfı olarak global seçilerek entity için global limit tanımlanır. Ekran sıralamasında global limitler en üstte yer alır. Global limitler veritabanına kaydedilirken risk_level=null olarak kaydedilir.

- Risk Sınıfı için tanımlanmış limitler, aynı entity_type için tanımlı global limitlerden daha gevşek olamaz (global üst sınırdır).

- Risk sınıfları arasında monotonic kuralı uygulanır: daha yüksek risk sınıfı, daha düşük risk sınıfından daha gevşek olamaz. (null ≥ Low ≥ Medium ≥ High ≥ Critical şeklinde kısıt artar.)

- Tek İşlem Onay Eşiği hiçbir zaman Tek İşlem Limiti değerini aşamaz. 0 ve -1 istisnaları ayrı ele alınır. Aylık limitler günlük limitlerden daha küçük olamaz.

- Limit=-1 ise ve onay eşiği -1 değilse işlem limitsiz olur ancak onay eşiği yine uygulanır.

- Entity için bir risk seviyesinde tanım yoksa, aynı entity için bir düşük risk seviyesi için olan tanım uygulanır. Hiç tanım yoksa ilgili entity’e karşılık gelen global tanım uygulanır. Global tanım da yoksa limit uygulanmaz (sınırsız).

- Limitler güncelleme yapıldığı tarihten itibaren bir sonraki güncellemeye kadar geçerlidir.

- Ekranın üstünde son güncelleme tarihi gösterilir. Her değişiklik yeni bir versiyon olarak saklanır. Kullanıcı belirli bir tarih için geçerli olan limit/kısıt setini sorgulayabilir ve görüntüleyebilir.

1. ## Risk Skorları

- Id ile arama yapılır.

- Künye Paneli: Id, Ad-Soyad, Türü (ENUM: fraud_risk_source), Skor, Risk Sınıfı (ENUM: level), Son Hesaplanma Tarihi

- Skor Detay Paneli: Başlık, Skor Katkısı kolonlarının olduğu liste.

- Skor Geçmişi Paneli: Tarih, Skor, Kategori kolonlarının olduğu entity geçmiş skor bilgilerinin listelendiği tablo – mümkünse grafik de sunulabilir. Renkli olarak yeşil, sarı, kırmızı ve bordo tonlarla sunulmalıdır.

- Skor Değişiklik Paneli: Skorda manuel değişiklik yapılabilen alandır. Yeni Skor ve Değişiklik Gerekçesi alanlarının bulunduğu bir formdur. Skor değişiklikleri onaya gitmek zorundadır.

- Tüm skor değişiklikleri için Değişiklik Gerekçesi zorunlu olmalıdır.

1. ## Dolandırıcılık Tespit Kuralları

- Tetikleme Sırası, Kural Başlığı, Kapsam (ENUM: fraud_scope), Status (ENUM: fraud_rule_status), Öncelik (ENUM: level), True Positive, False Positive, Açılan Vaka Sayısı, Ortalama Vaka İnceleme Süresi kolonlarını içeren tablo. Default olarak tetikleme sırasına göre artan sıralanır.

**Kural Tanımlama / Kural Detay**

- Kural tanımlama, güncelleme ve simüle etme ekranıdır. Kurallar versiyonlanabilir veya arşive kaldırılabilir. Fraud vakalarında genellikle gerçek müşteriye bildirimde bulunuluyor ve hızlıca müşteriden geri bildirim alınabiliyor. AML vakalarının ise ayrı bir süreci var ve bunlarda alınan aksiyonla ilgili olarak işlemi yapmaya çalışan kişiye bilgi verilmemesi gerekiyor. Bu sebeple kural müşteri bilgilendirme yapılmasını istemediği sürece bilgilendirme yapılmamalı.

- Butonlar: Simülasyon, İstisna Ekle, Kaydet ve Devam Et, Kaydet ve Bitir, Pasifleştir (Pasif kurallarda Aktifleştir şeklinde gelir), İptal

- Kural Paneli: Kural Başlığı, Kural Açıklaması, Kapsam (ENUM: fraud_scope), Koşul, Aksiyon (ENUM: fraud_action), Status (ENUM: fraud_rule_status), Öncelik (ENUM: level), Mevzuat Referansı

- Önceki Versiyonlar Paneli: Oluşturulma Tarihi, Değiştirilme Tarihi, Koşul, Aksiyon (ENUM: fraud_action), Açıklama kolonlarının olduğu, kuralın eski versiyonlarının listelendiği tablo.

- Koşul: TextArea içerisine kuralın manuel yazıldığı alandır. Hemen yanında Doğrula butonu olur, buton yazımın işletilebilir olup olmadığını test eder ve kullanıcıya yazdığı koşulda sorun olup olmadığı ve sorun varsa nereden kaynaklandığı konusunda bilgi verir.

- Aksiyon: Aksiyonlar için Checkbox veya Multiple Select Combobox kullanılabilir. Birden fazla aksiyon eklenebilir. Block seçildiğinde Neyi (Transaction (İşlem Statüsü On Hold yapılır), Account, AccountInternationalOnly), Süre (dakika cinsinden – 0 kalıcı blokedir ve sadece manüel olarak compliance officer tarafından kaldırılabilir), Miktar (0 full blokedir – miktar > 0 ise miktar olarak girilen tutar üzeri işlemler engellenir), Channel (Web-Mobil, Temsilci, Full) alanları görülür. Neyi = Transaction seçilirse: Channel ve Miktar gizlenir. AddRisk seçildiğinde Kime (ENUM: fraud_entity), Süre (Opsiyonel, Gün cinsinden süre dolunca otomatik geri alınsın) ve Risk Puanı alanları görünür. CreateCase seçildiğinde Severity (ENUM: level) alanı görünür. Allow seçildiğinde şunlar seçilemez veya bunlar seçildiğinde Allow seçilemez: ForcePasswordReset, AddExtraVerification, TerminateSessions, ContactCustomer ve Block.

- İstisna Paneli: Ekle Butonu ve Müşteri No, Bitiş Tarihi, Açıklama kolonlarından oluşan tablo.

- Simülasyon butonu ile açılır pencerede, son 6 aylık veri kullanılarak kuralın çalıştırılması halinde Toplam İşlem Sayısı, Engellenen İşlem sayısı, Açılan Vaka Sayısı bilgileri sunulur. Eğer “fraud etiketlenmiş” veri seti mevcutsa True/False Positive–Negative İşlem Adetleri de ekrana getirilir.

1. ## Vaka İnceleme

- Butonlar: Kapatılmış Vakalar, Yüksek Öncelik, Yeni, SLA Yaklaşan, Bana Atanmış, Dolandırıcılık Bildir (buton tıklandığında modal açılır, detayları aşağıdadır)

- İşlem Numarası, İşlem Tarihi, Öncelik (ENUM: level), İşlem Türü, Kural, Risk Skoru, Gönderen Müşteri No, Gönderen Adı ve Soyadı / Unvanı, Alıcı Müşteri No, Alıcı Adı ve Soyadı / Unvanı, Gönderen Temsilci No, Alıcı Temsilci No, IBAN, Para Birimi, Tutar, Kanal (ENUM: channel), İşlem Status (ENUM: transaction_status), Case Status (case_status), Sorumlu Personel kolonlarının olduğu, tüm inceleme bekleyen para hareketlerinin listelendiği bir tablo.

- Default sıralamada Öncelik (high'lar yukarıda), Tutar (yüksek tutarlılar yukarıda), İşlem Tarihi (eskiler yukarıda) olacak şekilde getirilir. Sadece açık vakalar getirilir (Case Status: Unassigned, Assigned, InProgress, WaitingForCustomer, WaitingForAgent, WaitingFor3rdParty, Escalated, ReOpened). Kapatılmış Analizler butonu ile de kapatılmışlar getirilir (Case Status: Resolved_IssueFixed, Resolved_STRFiled, Resolved_NoIssue, Resolved_ConfirmedFraud, Resolved_PreventedFraud, Resolved_InsufficientEvidence, Rejected).

**Dolandırıcılık Bildir**

- Butonlar: Kaydet, Kaydet ve Vaka Aç, İptal

- İşlem Numarası, Dolandırıcılık Tipi (ENUM: fraud_type), Tespit Kaynağı (ENUM: fraud_detection_source), Hüküm (ENUM: verdict – default unknown), Tespit Tarih/Saati, Zarar Tutarı, Kurtarılan Tutar, Notlar (textarea) alanlarının bulunduğu form.

- Hüküm = NotFraud ise Zarar Tutarı ve Kurtarılan Tutar 0 olmalı.

- Hüküm = ConfirmedFraud ise Dolandırıcılık Tipi zorunlu olmalı.

- İşlem tarihinden önce dolandırıcılık tespit edilemez.

- Aynı İşlem Numarası için tekrar kayıt girilemez, kullanıcı İşlem Numarası girdiğinde eğer kayıt mevcutsa eski kaydın bilgileri getirilir. Kullanıcı değiştirebilir.

- İlişkili bir vaka varsa linked_case_id var ise otomatik dolar. İşlem ile ilişkili vaka varsa kullanıcı Kaydet ve Vaka Aç butonunu tıklarsa uyarı vermelidir.

- Veritabanı: transaction_id, type (ENUM: fraud_type), source (fraud_detection_source), verdict (ENUM: fraud_verdict), fraud_discovery_at, fraud_labeler_user_id, loss_amount, recovered_amount, linked_case_id (nullable – case açılmamış olabilir), notes

**Vaka Detayları**

- Müşteri Bilgileri Paneli: Risk Kategorisi, Müşteri Tipi (ENUM: customer_type), Kimlik Numarası, Kimlik Tipi, Kimlik Ülkesi, Doğum Ülkesi, Adres Ülkesi, Doğum Tarihi, Beyan Edilmiş Geliri, Mesleği (ENUM: employment_occupation), Adres, Telefon, E-Posta, Hesap Yaşı (kişinin ilk hesap açışından bu yana geçen süre – gün), Adres Doğrulama Durumu.

- Hesap Paneli: Hesap Tipi (ENUM: wallet_type), Bakiye, Para Birimi. Müşterinin bütün hesapları listelenir.

- Müşteri İşlem Geçmişi Paneli: EODBalanceAvg(30), SendingTxCount (1, 7, 30), ReceivingTxCount (1, 7, 30), TxCountLastHour, SendingAmountTotal (1, 7, 30), ReceivingAmountTotal (1, 7, 30), SendingAmountLastHour, ReceivingAmountLastHour, SendingAmountAvg (1, 7, 30), ReceivingAmountAvg (1, 7, 30), SendingAmountStdDev(30), IncomingFlatAmountShare (30), ComplaintCount (30), ManualReviewCount (30), ChargebackCount (30), UniqueReceiverCount (1, 7, 30), UniqueSenderCount (1, 7, 30).

- Erişim Bilgileri Paneli: DeviceCountToday, SameDeviceCustomerCountToday, IPCountToday, SameIPCustomerCountToday, FailedLoginAttemptsLastHour, LastContactInfoChangeDate, LastTxDate, ImpossibleTravel (DistanceFromLastTx kullanılarak hesaplanır).

- Temsilci Bilgileri Paneli: Risk Kategorisi, Ülke, Şehir, TxCountDays (1, 7, 30), TxCountLastHour, AmountTotal (1, 7, 30), AmountAvg (1, 7, 30), ComplaintCount (30), ManualReviewCount (30), ChargebackCount (30).

- İşlem Paneli: Tarih, Saat, İşlem Tipi, Para Birimi, Tutar, İşlem Durumu, Kanal (ENUM: channel), İşlem Açıklaması.

- Ortak İletişim Kullanan Müşteriler Paneli: Müşteri No, Adı ve Soyadı, Risk Skoru, Uyruğu, İlişki Tipi (SharedEmail, SharedPhone, SharedAddress, SharedDevice – birden fazla gelebilir). Sadece LinkedCustomersCount (Aynı telefon, eposta veya adrese bağlı müşteri sayısı) > 0 ise gösterilir.

- İlişkili Müşteriler Paneli: Müşteri No, Adı ve Soyadı, Risk Skoru, Uyruğu, Gönderilen Toplam (son 1 yılda müşterinin gönderdiği toplam tutar – TRY), Gönderim Adedi (son 1 yılda müşterinin gönderdiği toplam işlem adedi), Alınan Toplam (son 1 yılda müşterinin aldığı toplam tutar – TRY), Alım Adedi (son 1 yılda müşterinin aldığı toplam işlem sayısı).

- \>> Yukarıdakiler yerine işlemin detayları değiştirilemez text olarak da sunulabilir. Küme parantezi, tırnak işareti gibi noktalama işaretleri kaldırılır ve tüm veriler sunulur.

- Kural Paneli: Hangi kuraldan dolayı case açılmışsa kural ve yapılan hesaplama bilgilerine yer verilir.

- Vaka açılan bir işlem için 4 aksiyon seçeneği vardır: Onayla, Reddet, Yönlendir, İstisna Tanımla. Yönetici için Onayla, Reddet, Raporla.

- Kullanıcı, vaka ile ilgili olarak zorunlu yorum (textbox) yazmalıdır. Yöneticiye atanan vakalarda yönetici not ilave etmelidir.

1. ## Yönetim

- Referans Veri Paneli: RiskyCountries, RiskyPhonePrefixes, RiskyEmailProviders, RiskyCities, UsuallyUsedCurrencies, BlacklistedKeywords, RiskyAgents, RiskyCustomers, RiskyCredentials, RiskyIPs, RiskyOccupations listelerinin ve OccupationTransactionThresholds tablosunun içeriğinin güncellenebildiği panel. Güncelleme yapıldığında eski halleri veritabanında ulaşılabilir olmalıdır.

- RiskyCountries: Bu listenin en güncel istihbarata/son bilgilere dayanarak güncel tutulması önemlidir. Liste kayıtları “effective_from / effective_to” ile tarihçeli tutulur; geçmiş vakalarda hangi liste versiyonunun geçerli olduğu geriye dönük izlenebilir.

- RiskyIPs: Tor platformu çıkış düğümleri veya bilinen proxy servisleri asgari olarak eklenmelidir.

- Grup Paneli: Personeller gruplara atandığı, yeni grup eklenip mevcut gruplarda güncelleme yapılabilen panel. Sadece vaka analiz ekran yetkisi olan personel listelenir. Yeni grup eklenebilir, mevcut grup isimlerinde veya içerdiği personelde değişiklik yapılabilir. Asgari olarak 2 grup her halükârda olmak zorundadır: Operatörler ve Yöneticiler. Bu iki grup varsayılan gruplar olup özel nitelikli gruplardır. Vaka Analiz ekranına erişimi bulunan tüm personel bu 2 gruptan birisine üye olmak zorundadır. Operatörler grubunda yer alan birisi Yöneticiler grubunda bulunamaz.

- Vaka Yönlendirme Akışı Paneli: Kanal, Kural, İşlem Türü, Öncelik, Tutar bilgileri ile koşul yazılıp (textarea) yönlendirilebilecek personelin seçilebildiği (combobox - personel grupları) panel. Örneğin Tutar 100.000TL üzeri ve Öncelik yüksek vakalar direk yönetici grubuna atanırken diğer vakalar abc grubuna atanabilir. Buna ilave olarak grup içerisinde Otomatik Dağıt checkbox'ı seçilirse grup içerisinde vaka tipinin işyüküne göre seçilen grup içerisindeki çalışanlara dağıtır. Vaka kapama ve eskale etme süreleri vakayı açtıran kural bazında saklanır, bunların ortalaması aynı kuraldan açılan vakaların tahmini iş yükünü oluşturur. Vakaların kime atanacağı belirlenirken çalışanlara ortalama eşit iş yükü verilecek şekilde atanır.

- Parametre Paneli: Timeout (birim: ms; default -1; önerilen 200ms; 0 yapılırsa fraud kontrolleri kapatılır)

&nbsp;

1. # Operasyonel Süreç Yönetimi

2. ## Onay Havuzu

- Butonlar: Onayımı Bekleyenler, Başlattıklarım, Onayladıklarım, Reddettiklerim, Tümü.

- Referans Numarası, Ekran/İşlem Adı, Başlatan Kullanıcı, İşlem Tarihi, 1. Onaycı, 1. Onay Tarihi, 2. Onaycı, 2. Onay Tarihi, Status (1. Onay Bekleniyor, 2. Onay Bekleniyor, 2. Kademe Reddetti, Onaylandı, Reddedildi) kolonlarını içerir. Tablo; kullanıcının başlattığı, onayını bekleyen, onayladığı veya reddettiği işlemleri listeler.

- Sayfa, varsayılan olarak Onayımı Bekleyenler filtresi ile açılır ve İşlem Tarihi’ne göre yeniden eskiye sıralanır. Bu filtre kapsamında kullanıcı yalnızca onaylayabileceği kayıtları görür; 2. onaycı, 1. onay tamamlanmamış kayıtları Onayımı Bekleyenler filtresinde görmez.

- 2\. onaycı için Onayla ikonu, 1. onay tamamlanana kadar pasif (disabled) durumdadır. Örneğin Tümü filtresi seçildiğinde.

- Tablo verileri sistem tarafından otomatik oluşturulur; kullanıcılar tarafından doğrudan değiştirilemez.

- 2\. onay süreci, yalnızca 1. onayın Approved olması halinde başlar. Çift tıklama/yeniden deneme gibi mükerrer aksiyonlarda sistem hata döner, kayıt statüsü değişmez.

|     |     |     |     |
| --- | --- | --- | --- |
| Olay Öncesi DB (1,2) | Event | DB State (1,2) | Önyüzdeki Status |
|     | İşlem oluşturuldu | Pending, NULL | 1\. Onay Bekleniyor |
| Pending, NULL | 1\. onaycı Onayladı (1 onay işlem) | Approved, NULL | Onaylandı |
| Pending, NULL | 1\. onaycı Onayladı (2 onay işlem) | Approved, Pending | 2\. Onay Bekleniyor |
| Pending, NULL | 1\. onaycı Reddetti | Rejected, NULL | Reddedildi |
| Approved, Pending | 2\. onaycı Onayladı | Approved, Approved | Onaylandı |
| Approved, Pending | 2\. onaycı Reddetti | Approved, Rejected | 2\. Kademe Reddetti |
| Approved, NULL | 1\. onaycı mükerrer (1 onay işlem) | Hata Üretilir | Onaylandı |
| Approved, Pending | 1\. onaycı mükerrer (2 onay işlem) | Hata Üretilir | 2\. Onay Bekleniyor |
| Approved, Approved | 2\. onaycı mükerrer | Hata Üretilir | Onaylandı |
| Pending, NULL | 2\. onaycı işlem yapmaya çalıştı | Hata Üretilir | 1\. Onay Bekleniyor |

&nbsp;

- Actions kolonunda, View, Onayla, Reddet, Geri Çek ikonlarını olur. Her bir satırdaki işlem için Onaylama ve Reddetme gerçekleştirilebilir. Onay ekranı işlem giriş ile aynıdır, ancak onaycı işlemde değişiklik yapamaz. Ancak teknik olarak bu zor ise işlemin detayları değiştirilemez text olarak da sunulabilir; küme parantezi, tırnak işareti gibi noktalama işaretleri kaldırılır ve tüm veriler sunulabilir.

- Bir değişiklik onaya gittiğinde değişen değerler vurgulanmalı (rengi farklı olabilir) eski ve yeni değer gösterilmelidir.

- Reddedilen işlemlerde yorum zorunludur, onaylanan işlemlerde opsiyoneldir.

- Reddedilen talepler, başlatan kullanıcı tarafından düzenlenip tekrar onaya gönderilebilir. Yeniden gönderimde yeni bir onay kaydı oluşur; önceki kayıt Superseded statüsüne çekilir ve yeni kayıt ile previous_approval_ref üzerinden ilişkilendirilir.

- Geri Çek ikonu sadece başlatan kullanıcı tarafından görülebilir. Geri Çek tetiklendiğinde kayıt statüsü Withdrawn olur ve kullanıcıya işlem detayları düzenlenebilir şekilde sunulur. Onay talebi, kullanıcı bu sayfada Tekrar Onaya Gönder butonunu tetiklerse Superseded, Vazgeç butonu tetiklenirse Canceled statüsüne geçer.

1. ## KYC Yönetimi

- Bu ekran, riskli veya blokeli görülen kişi ve temsilcilerin uyum açısından değerlendirilmesi amacıyla kullanılan KYC inceleme ekranıdır. Kişiye ilişkin önceki KYC sorguları, daha önce verilmiş KYC kararları, kimin hangi tarihte ne karar verdiği ve varsa istisna (exception) işaretleri bu ekranda izlenir. Kimlik ve adres teyit dokümanları, EDD raporları, üst yönetim onayları, false positive tespitine ilişkin ekran görüntüleri veya sağlayıcı çıktıları gibi belgeler de doküman yükleme alanları üzerinden bu dosyaya eklenir ve saklanır.

- Müşteri/Temsilci No, Tipi (ENUM: entity_type_full), Kimlik Tipi (ENUM: identity_document_extended), Kimlik No, Ad-Soyad/Unvan, Telefon, E-posta, Doğum Tarihi, Sorgulama Zamanı, Sorgulama Durumu (Liste Adı – Eşleşme Oranı şeklinde), Önceki Sorgulama Durumu (Liste Adı – Eşleşme Oranı şeklinde), Blokaj Sebebi (ENUM: entity_blockage_reason), KYC Durumu (ENUM: bireysel müşteriler için kyc_level tüzel müşteriler için approval_status) kolonlarının olduğu Blocked statüsündeki veya KYC Durumu düşürülmüş müşteri veya temsilcilerin listelenebildiği tablo.

- KYC Detayları sayfasında FalsePositive (Yanlış Eşleşme), RequestAdditionalInfo (İlave Bilgi Talebi), Reject (Reddet), Verify (Doğrula) ve Doküman Ekle butonları yer alır. Doküman Ekle haricindeki aksiyonlardan biri tıklandığında, kullanıcıya kararına ilişkin Değerlendirme notu girebileceği bir alan veya modal açılır. RequestAdditionalInfo aksiyonu seçildiğinde status = Blocked ve entity_blockage_reason = UnderInvestigation, Reject aksiyonu seçildiğinde status = Closed ve entity_closure_reason = RejectedDueToKyc olarak güncellenir. Verify ve FalsePositive aksiyonlarında status değeri Active olarak güncellenir ve her iki aksiyon için de en az bir doküman bulunması zorunludur. Verify aksiyonunda buna ek olarak Risk Skoru alanı doldurulur (kişi KYC listelerinde hit almasına rağmen onaylandığında, işlem ve müşteri izlemesine ek risk yansıtmak amacıyla kullanılır) ve en az bir onaylayıcının (üst yönetim veya yetkili onay mercii) seçilmesi zorunludur.

- Bir kişinin daha önce hit aldığı bir liste nedeniyle detaylı incelenip False Positive olduğuna veya belirli şartlarla müşteri yapılmasına karar verildiyse, sonraki periyodik taramalarda aynı liste nedeniyle tekrar hit alması durumunda bu kayıt otomatik olarak “bilinen istisna” (known exception) olarak işaretlenir. Known exception; liste_id + match_rule + eşik + temel kimlik atributları ile bağlanır. Böylece aynı kişi aynı sebeple tekrar tekrar tam kapsamlı inceleme kuyruğuna düşmez; uyum görevlisi bu durumu ekranda açıkça görebilir.

- Müşteri Detay ekranındaki paneller ve Risk Skorları ekranındaki paneller KYC açısından mantıksal bir sıra ile sunulur; ayrıca KYC entegrasyonundan alınan ham veriler JSON formatında görüntülenir.

1. ## Muhasebe Entegrasyon

- Muhasebe entegrasyon ekranı, gerçekleşen işlemlerin muhasebe sistemine gönderim durumunun izlenmesi, hata alan kayıtların görüntülenmesi ve gerektiğinde ilgili kayıtların muhasebeye yeniden gönderilmesi amacıyla kullanılır. Ekranda **entegrasyon** akışı işletilir.

- Referans No, İşlem Tarihi / Saati, İşlem Türü, Gönderen (Ad/Unvan + No), Alıcı (Ad/Unvan + No), Tutar + Para Birimi, Status (ENUM: integration_status), Son Gönderim Tarihi, Servis Çıktısı, Deneme Sayısı kolonlarını içeren tablo.

1. ## BTRANS Raporları

- BTRANS raporlarının gönderim durumunun izlenmesi, hata alan kayıtların görüntülenmesi ve gerektiğinde ilgili kayıtların yeniden gönderilmesi amacıyla kullanılır. Ekranda **entegrasyon** akışı işletilir.

- Tarih, Rapor Adı, Status (ENUM: integration_status) kolonlarının olduğu, BTRANS raporlarının listelendiği tablo.

1. ## Finansal Mutabakat

- Tarih, Envanter Bakiyesi, Muhasebe Bakiyesi, Banka Hesapları Toplam Bakiyesi, Fark (Envanter – Muhasebe), Fark (Envanter – Banka), Mutabakat Durumu (ENUM: reconciliation_status), Açıklama kolonlarının olduğu, mutabakat sonuçlarının listelendiği tablo.

- Mutabakatın üç kaynağı olacak: Envanter (Gerçek zamanlı müşteri bakiyeleri), Muhasebe (Muhasebeleştirilen kayıtlar), Banka Hesapları (Banka hesaplarındaki toplam müşteri bakiyesi).

- Her mutabakat satırı as_of_timestamp ile üretilir. Envanter verisi gerçek zamanlı olsa dahi mutabakat için snapshot alınır; Muhasebe ve Banka verileriyle aynı cut-off’a göre karşılaştırılır.

- Satırlar mutabakat ile otomatik dolar. Mutabık değilse İncelemede statüsünde olur. İnceleme yaptıktan sonra kullanıcı Açıklama girerek Düzeltme Yapıldı durumuna getirebilir.

- Kullanıcıdan tek beklenen PendingReview statüsündeki satırlarda gerekli düzenlemeleri yaptıktan sonra güncelleme butonuna tıkladıklarında gelen modalda Açıklama girişi yapmasıdır. Modal butonları İptal ve Düzeltme Yapıldı olmalıdır.

1. ## Kur / FX Yönetimi

- Kur verisi otomatik TCMB’den alınır. Ekran, TCMB kurunu izleme ve istenirse marj uygulayarak kullanılan kuru belirleme amaçlıdır. Ancak ekran başka bir kaynaktan kur bilgisi almayı da desteklemektedir. Ekran Marj Ayarları, Kur Bilgisi, Geçmiş Marj, Geçmiş Kur panellerinden oluşur.

- Butonlar: Yenile, Vazgeç, Kaydet.

- Marj Ayarları Paneli: Para Birimi (USD, EUR), Mesai İçi / Dışı, Alış Sabit Marj, Alış Değişken Marj (%), Satış Sabit Marj, Satış Değişken Marj (%), Yuvarlama Ondalık Basamak. Marj alanları negatif değer alabilir. Marj değişikliği Onay Havuzuna düşer. Mesai Dışı Marj, Mesai İçi Marjdan daha düşük olamaz.

- Kur Bilgisi Paneli: Kur Tarihi, Para Birimi (USD, EUR), Kur Kaynağı, Alış, Satış, Marjlı Alış, Marjlı Satış, Son Güncelleme.

- Geçmiş Marj Paneli: Tarih, Para Birimi (USD, EUR), Alış Sabit Marj, Alış Değişken Marj (%), Satış Sabit Marj, Satış Değişken Marj (%), Yuvarlama Ondalık Basamak.

- Geçmiş Kur Paneli: Kur Tarihi, Para Birimi (USD, EUR), Kur Kaynağı, Alış, Satış, Marjlı Alış, Marjlı Satış. Varsayılan olarak içinde bulunulan güne ait mevcut kayıtlar listelenir.

- Yenile butonu Kur Kaynağından yeni kur bilgilerini çeker ve marjlı değerleri mevcut marjlarla yeniden hesaplar.

- Marj Ayarları Paneli haricindeki hiçbir panel kullanıcılar tarafından girilmez, otomatik olarak doldurulur.

- Marjlı Alış = Alış – Alış Sabit Marj – (Alış \* Alış Değişken Marj / 100)

- Marjlı Satış = Satış + Satış Sabit Marj + (Satış \* Satış Değişken Marj / 100)

- Yuvarlama, hesaplama sonrası uygulanır.

&nbsp;

1. # Doküman Yönetim Sistemi

- Oluşturulma Tarihi, Doküman Kategorisi (ENUM: document_category), Doküman Türü, Status (ENUM: document_status), Oluşturan, Onaylayan kolonlarının olduğu yüklü dokümanların listelendiği tablo.

1. ## Yeni Doküman Ekle

- Butonlar: Ekle, İptal.

- Doküman Kategorisi (ENUM: document_category), Doküman Türü (combobox – seçilen doküman kategorisi için tanımlanmış doküman türleri), Geçerlilik Süresi (bu alana valid_from – valid_until şeklinde iki tarih girişi yapılabilir), Dosya (Browse), İlişki Tipi – İlişkili Id (Ekle – çoklu ekleme yapılabilir) alanları yer alan form.

**Doküman Detay**

- Doküman Ekleme ve Detay ekranları farklıdır.

- Detay ekranı Metadata, İlişki ve Doküman panellerinden oluşur.

- Metadata Paneli: Doküman Kategorisi (ENUM: document_category), Doküman Türü, Oluşturulma Tarihi, Oluşturan Kullanıcı, Status (ENUM: document_status), Onay Tarihi, Onaylayan Kullanıcı, Onay Status (ENUM: approval_status), Onay Zorunlu (checkbox), Kişisel Veri (checkbox), Aktif Saklama Süresi, Arşivde Saklama Süresi, Geçerlilik Süresi (bu alanda valid_from – valid_until şeklinde iki tarih yer alır).

- İlişki Paneli: Doküman ile ilişkili Müşteri, Temsilci, İşlem, Şikâyet veya Çalışan ID numaraları ve ilişkilinin detay sayfası için link (Müşteri Detay Sayfası, İşlem Detay Sayfası, gibi).

- Doküman Paneli: Adı, Boyutu, Dosya Tipi, Hash, Dosya. Bu panelden dosya indirilebilir.

1. ## Doküman Tipleri

- Doküman Kategorisi (ENUM: document_category), Doküman Türü, Açıklama, Aktif Saklama Süresi (yıl), Arşivde Saklama Süresi (yıl), Max Dosya Boyutu, Kişisel Veri (checkbox), Onay Gerekir (checkbox) kolonlarının olduğu yüklü dokümanların listelendiği tablo.

1. ## Yeni Doküman Tipi Tanımlama

- Doküman Kategorisi (ENUM: document_category), Doküman Türü, Açıklama, Aktif Saklama Süresi (yıl), Arşivde Saklama Süresi (yıl), Max Dosya Boyutu, Kişisel Veri (checkbox), Onay Gerekir (checkbox). Aynı Doküman Türü birden fazla kategoride olamaz.

- Erişim Paneli: Görüntüleyebilen Roller (multiselect combobox), Onaylayabilen Roller (multiselect combobox). Roller mevcut rol listesinden seçilerek eklenir. Onaylayabilen Roller yalnızca "Onay Gerekir" seçiliyse aktif olmalı. approval_required = true ama role atanmadıysa kaydetmez.

- Varsayılan max_file_size_mb bilgisi parametreden yönetilir, ayrı bir tanım yapılmamış tüm dokümanlar bu değer ile kısıtlanır.

- Asgari olarak Identity (Kimlik), ProofOfAddress (Adres Kanıtı), ProofOfFunds (Fon Kaynağı Kanıtı), LegalEntity (Tüzel Kişi), ProofOfTransaction (İşlem Kanıtı), Agreement (Sözleşme), EmployeeHR (Çalışan) kategorilerinde aşağıdaki dokümanlar tanımlı gelir:

|     |     |
| --- | --- |
| Doküman Kategorisi | Doküman Tipi  <br><br/> |
| Identity  <br><br/>(Kimlik) | IdentityCard (Kimlik Kartı), Passport (Pasaport), DriversLicense (Ehliyet – Sürücü Belgesi), TemporaryIdentityDocument (Geçici Kimlik Belgesi), BlueCard (Mavi Kart), ForeignIdentityCard (Yabancı Kimlik Kartı), ResidencePermit (İkamet İzni Belgesi), WorkPermitCard (Çalışma İzni Kartı), TaxIdentificationNumber (Vergi Kimlik Numarası) |
| ProofOfAddress (Adres Kanıtı) | UtilityBill (Fatura), ResidenceCertificate (İkametgâh Belgesi), RentalContract (Kira Sözleşmesi), BankStatement (Adres İçeren Banka Ekstresi), OtherAddressDocument (Diğer Adres Belgesi) |
| ProofOfFunds   <br><br/>(Fon Kaynağı Kanıtı) | IncomeStatement (Gelir Belgesi), PayrollSlip (Maaş Bordrosu), EmploymentLetter (İşveren Yazısı), TaxReturn (Vergi Beyannamesi), OtherFundsDocument (Diğer Gelir Belgesi) |
| LegalEntity   <br><br/>(Tüzel Kişi) | CompanyRegistrationCertificate (Şirket Kayıt Belgesi), TradeRegistryGazette (Ticaret Sicil Gazetesi), TaxCertificate (Vergi Levhası), ArticlesOfAssociation (Şirket Ana Sözleşmesi), SignatureCircular (İmza Sirküleri), ChamberOfCommerceCertificate (Oda Kayıt Belgesi), ShareholderList (Ortaklar Listesi), BoardResolution (Yönetim Kurulu Kararı / Yetki Belgesi), AuthorizedRepresentativeID (Yetkili Kişi Kimlik Belgesi), AuthorizedRepresentativeProof (Yetki Kanıt Belgesi), CorporateAddressProof (Tüzel Adres Kanıtı), CorporateBankAccountProof (Kurumsal Banka Hesap Belgesi), CorporateFinancialStatement (Finansal Tablolar), UltimateBeneficialOwnerDeclaration (Nihai Fayda Sahibi Beyanı), SanctionsComplianceForm (Yaptırım Uyumluluk Formu), PartnershipAgreement (Adi Ortaklık Sözleşmesi), ManagementPlan (Apartman/Site Yönetim Planı) |
| ProofOfTransaction  <br><br/>(İşlem Kanıtı) | PaymentReceipt (Ödeme Makbuzu), BankTransferSlip (Banka Dekontu), TransactionScreenshot (İşlem Ekran Görüntüsü), SourceAccountStatement (Gönderici Hesap Ekstresi), DestinationAccountStatement (Alıcı Hesap Ekstresi), OtherTransactionDocument (Diğer İşlem Belgesi) |
| Agreement   <br><br/>(Sözleşme) | ServiceAgreement (Hizmet Sözleşmesi), CustomerAgreement (Müşteri Sözleşmesi), AgentAgreement (Temsilci Sözleşmesi), PartnerAgreement (Muhabir / İş Ortağı Sözleşmesi), EmploymentContract (İş Sözleşmesi), NDAAgreement (Gizlilik Sözleşmesi), DataProcessingAgreement (Veri İşleme Sözleşmesi), MarketingConsentForm (Pazarlama İzni Formu), KvkkConsent (KVKK Açık Rıza Beyanı), SanctionsCheckConsent (Yaptırım / AML Tarama Onayı), CrossBorderTransferConsent (Yurtdışı Veri Aktarım Onayı), ElectronicCommunicationConsent (Elektronik İletişim / SMS / E-posta İzni), AmendmentDocument (Sözleşme Ek / Revizyon Belgesi) |
| EmployeeHR  <br><br/>(Çalışan) | CurriculumVitae (Özgeçmiş), FamilyRegistryRecord (Nüfus Kayıt Örneği), Diploma (Diploma), CriminalRecord (Adli Sicil Kaydı), HealthReport (Sağlık Raporu), MarriageCertificate (Evlilik Cüzdanı), FamilyMemberIdentity (Aile Üyeleri Kimlik), MilitaryStatusCertificate (Askerlik Durum Belgesi), BloodTypeCard (Kan Grubu Kartı), AssetAssignmentForm (Zimmet Belgesi), SocialSecurityEmploymentNotification (SGK İşe Giriş Bildirgesi), IncentiveDocument (Teşvik Belgesi), ParentalConsent (Ebeveyn Onayı), WorkPermitDocument (Çalışma İzni Belgesi), OfficialCorrespondence (Resmi Yazışmalar), IncidentReport (Tutanak), DisciplinaryActionRecord (Disiplin Cezası Kaydı), PerformanceReviewForm (Performans Değerlendirme Formu), ResignationLetter (İstifa Dilekçesi), TerminationNotice (Fesih Bildirimi), ReleaseLetter (İbraname), SocialSecurityTerminationNotification (SGK İşten Ayrılma Bildirimi), NotificationLetter (İhbarname), EmploymentCertificate (Hizmet Belgesi), WarningNotice (İhtarname), OtherEmployeeDocument (Diğer Çalışan Belgesi) |

&nbsp;

1. # Destek Merkezi

- Talep No, Konu, Talep Tipi (ENUM: complaint_type), Sorumlusu, Aciliyeti (ENUM: level), Kritikliği (ENUM: level), Oluşturma Tarihi, Son Güncelleme Tarihi, Talep Yaşı, Status (ENUM: case_status) kolonlarının olduğu, tüm talep ve şikayetlerin listelendiği bir tablo. Tarafıma Atanmış Talepler butonu.

1. ## Yeni Talep Giriş

- Butonlar: Dosya Ekle, Kaydet, Üzerime Al, Havale Et, İletişim Kaydı Gir, Bilgi İstek Kaydı Gir, Çözümle ve Kapat, Reddet, Yeniden Aç butonları bulunur.

- Talep Bilgileri Paneli: Talep No, Talep Sahibi Tipi (ENUM: entity_type_core), Talep Sahibi No, Konu, Talep Tipi (ENUM: complaint_type), Talep Sorumlusu Personel (combobox), İlgili Departman (combobox: Departman tablosundan doldurulur), Aciliyeti (ENUM: level), Kritikliği (ENUM: level), Talep Detayı alanlarının olduğu form.

- Talep Aksiyonları Paneli: Aksiyon (ENUM: case_action), Status (ENUM: case_status), Notlar alanlarının olduğu form. Aksiyon ve Status ekrandan doğrudan değiştirilemez, butonlar vasıtasıyla değiştirilebilir. Notlar silinemez veya değiştirilemez, her adımda yazılan notlar "Ad Soyad – Tarih – Aksiyon: Not" şeklinde notların en altında eklenir.

- Doküman Paneli: Doküman Kategorisi (ENUM: document_category), Doküman Türü, Oluşturulma Tarihi, Oluşturan Kullanıcı, Status (ENUM: document_status), Onay Tarihi, Onaylayan Kullanıcı, Onay Status (ENUM: approval_status – null ise Onay Beklenmiyor) alanlarından oluşan talebe dair dokümanların indirilebildiği panel.

- Aciliyet, talebin ne kadar hızlı aksiyon gerektirdiğini ifade eder. Kritiklik, talebin iş etkisini (finansal etki, müşteri etkisi, regülasyon/itibar riski) ifade eder.

|     |     |     |
| --- | --- | --- |
| Seviye | Aciliyet | Kritiklik |
| Düşük | İş akışını durdurmaz; geçici workaround vardır. | Finansal/operasyonel etki yok veya ihmal edilebilir. Uyum/risk etkisi yok. |
| Orta | Operasyon yavaşlar ama devam eder. | Sınırlı finansal veya operasyonel etki vardır. Düşük seviyede risk/uyum etkisi olabilir. Telafisi görece kolaydır. |
| Yüksek | Operasyonel süreçte belirgin aksama yaratır, gün içi operasyonu anlamlı etkiler. | Önemli finansal/operasyonel etki veya belirgin kontrol zafiyeti riski vardır. Uyum/fraud riski ihtimali yüksektir. |
| Kritik | Kritik akışlar durur veya kontrolsüz risk doğurur, hemen müdahale gerekir. | Regülasyon/uyum ihlali, ciddi fraud riski, büyük finansal kayıp veya ciddi itibar riski oluşturur. Yönetim seviyesinde takip gerektirir. |

&nbsp;

- Yeni talep oluşturulurken Talep Aksiyonları Paneli gösterilmez. Talep güncelleme esnasında ise Talep Bilgileri Paneli yalnızca okunur (değiştirilemez) olarak görüntülenir.

- Kaydet butonu sadece bir değişiklik olmuşsa aktif olur. Yeni kayıt oluştururken Talep Sorumlusu Personel veya İlgili Departman doldurulmuşsa Assigned, aksi durumda Unassigned statüde bir kayıt oluşturur. Mevcut kayıtta güncelleme yaparken status değiştirmez.

- Uygulama dışından, e-posta, sosyal medya, telefon gibi kanallardan toplanan öneri ve şikayetler personel tarafından uygulamaya girilir. Müşterinin girdiği talepler incelenerek diğer alanlar doldurulur. Talepler, tipine ve içeriğine göre gruplandırılır ve ilgili birimlere aktarılır.

- Yeniden Aç butonu sadece kapalı taleplerde gösterilir, diğer butonlar da sadece açık taleplerde.

- Doküman Ekle butonu ile gelen modal içeriği: Doküman Kategorisi (ENUM: document_category), Doküman Türü (combobox – seçilen doküman kategorisi için tanımlanmış doküman türleri), Geçerlilik Süresi (bu alana valid_from – valid_until şeklinde iki tarih girişi yapılabilir), Dosya (Browse).

- Butonların aksiyon ve statü etkileri ile butonlara tıklandığında açılan modal bilgileri:

|     |     |     |     |
| --- | --- | --- | --- |
| Buton | Aksiyon | Hedef Status | Modal |
| Üzerime Al | Assignment (Önceki statü Unassigned ise), Reassignment (Önceki statü başka bir statü ise) | Assigned | Modal açılmaz. |
| Havale Et | Assignment (sorumlusu yokken atanması), Escalation (departman değişimi), Reassignment (aynı departmanda sorumlu değişimi) | Escalated, Assigned (seçime göre) | Departman (combobox - varsayılan kişinin kendi departmanı), Sorumlu (combobox - seçili departmandaki personel) |
| İletişim Kaydı Gir | CustomerContacted veya AgentContacted | Statü değişmez | Taraf (Customer, Agent), Kanal (Telefon, E-posta, Diğer), İletişim Tarih-Saat, Özet Görüşme Notu |
| Bilgi İstek Kaydı Gir | InformationRequested | WaitingForCustomer, WaitingForAgent, WaitingFor3rdParty (seçime göre) | Bilgi İstenen Taraf (Customer, Agent, 3rdParty), İstenen Bilgi ve Dokümanlar, Kanal (Telefon, E-posta, Diğer) |
| Çözümle ve Kapat | FinalResolutionProvided ve CaseClosed birlikte | Resolved_\* (seçime göre) | Kapanış Sonucu (Resolved_IssueFixed, Resolved_NoIssue, Resolved_ConfirmedFraud, Resolved_PreventedFraud, Resolved_InsufficientEvidence, Resolved_STRFiled), Nihai Çözüm Metni |
| Reddet | ComplaintWithdrawn (red gerekçesi "talep geri çekildi" seçilirse) veya ComplaintRejected (diğer red gerekçeleri) | Rejected | Red Gerekçesi (talep geri çekildi, duplikasyon, geçersiz kapsam, hatalı kayıt), Red Açıklaması |
| Yeniden Aç | CaseReopened | ReOpened | Yeniden Açma Gerekçesi |

&nbsp;

1. ## Raporlama

- Bir dashboard'da küçük paneller halinde bütün raporlar gösterilir. Tablo olarak gösterilmesi gereken paneller ilk 10 satır gösterilir, kullanıcı isterse tabloyu tam ekran yapabilir. Tam ekran tablolarda grid ekranlarda olduğu gibi sıralama ve filtreleme yapılabilir.

- Talep tipi bazında sınıflandırılmış talep sayıları

- Talep Yaşı Raporu: 0-1 günlük talep sayısı, 1-5 günlük talep sayısı, 5-10 günlük talep sayısı, >10 günlük talep sayısı.

- Müşteriler: Müşteri No, Adı ve Soyadı / Unvanı, Risk Skoru, Ortalama İşlem Hacmi (Aylık – Tutar), Talep Sayısı (Gönderen veya Alıcının müşteri olduğu talepler). Varsayılan durumda talep kaydı sayısına göre yüksekten düşüğe doğru sıralanır.

- Temsilciler: Temsilci No, Adı ve Soyadı / Unvanı, Risk Skoru, Ortalama İşlem Hacmi (Aylık – Tutar), Talep Sayısı (Gönderen veya Alıcının temsilci olduğu talepler). Varsayılan durumda talep kaydı sayısına göre yüksekten düşüğe doğru sıralanır.

&nbsp;

1. # Raporlar

- Finansal İşlemler

- Hata Alınan İşlemler

- Risk ve Uyum Raporu

- Temsilci Hesapları

- Reddedilen/İptal Edilen veya Düzeltme İşlemler

- Sistem Hataları

- TCMB/EVAS – Günlük Komisyon & Ücret Raporu: Gün bazında; komisyon gelirleri, müşteriden tahsil edilen işlem ücretleri, banka/3. taraf masrafları, temsilci masrafları, iade/iptal/düzeltme etkileri, para birimi kırılımı, TL karşılıkları (işlem tarihindeki kurla).

- TCMB/EVAS – Günlük Mutabakat (Koruma/Envanter/Muhasebe) Raporu: Koruma hesabı bakiyesi, müşteri/temsilci bakiyeleri toplamı, muhasebe bakiyesi, farklar, tolerans/uzlaşma durumu, ilişkili talep no (varsa), düzeltme açıklaması.

- TCMB/EVAS – Koruma Hesabı Raporu: Koruma hesabı IBAN/hesap, gün içi açılış-kapanış, giriş-çıkış toplamı, bankaya göre kırılım, gün sonu bakiye, mutabakat sonucu.

- TCMB/EVAS – İşlem Hacmi/Adedi İstatistikleri (Yurt içi / Yurt dışı / kanal bazlı): İşlem tipi (EFT/FAST/Swift/partner), koridor/ülke, para birimi, adet/tutar, başarı-hata oranı, ortalama işlem süresi, iptal-iade oranı.

- TCMB/EVAS – Müşteri/Temsilci/KYC Özet: Aktif/blocked/closed sayıları, KYC onay bekleyenler, doküman expired sayıları, yüksek risk segment sayıları.

- MASAK – Şüpheli İşlem Bildirimi (ŞİB/STR) Çıktısı: Şüphe nedeni/kategorisi, olay özeti, ilgili müşteri/temsilci/UBO, ilişkili işlem(ler), tutar-para birimi-TL karşılığı, zaman çizelgesi, ilgili hesaplar/cüzdanlar, ilişkilendirilen dokümanlar, analist notları, aksiyonlar (bloke/limit düşürme/izleme).

- MASAK – Bilgi/Belge Talebi Yanıt Paketi: Talep referansı, kapsamdaki müşteri/işlem listeleri, doküman ekleri, sistem log/iz kayıtları, sorumlu kişi, yanıt tarihi.

- MASAK – Varlık Dondurma / Yaptırım Uyum İzleme Özeti: Hit kayıtları, false-positive kararları, uygulanan aksiyon (blokaj/çözüm), karar mercii, doküman kanıtları.

1. # Sistem Yönetimi

2. ## Kullanıcılar

- Ad-soyad, E-posta, Telefon, Rol (kullanıcının tek rolü olabilir), Oluşturma Tarihi, Status kolonlarının olduğu, tüm kullanıcıların ve rollerin listelendiği bir tablo.

- Detay ekranı; tek bir panelden oluşan ve kullanıcıların roller ile ilişkilendirilmelerinin yapıldığı ekrandır.

- Detay Ekranı Butonlar: Kullanıcı loglarının gösterildiği sayfaya yönlenen Kullanıcı Aktiviteleri.

- Kullanıcı No, Ad-soyad, E-posta, Telefon, Rol (combobox’dan seçip rol eklenecek, kullanıcının tek rolü olabilir), Oluşturma Tarihi, Status, Geçerlilik Tarihleri (başlangıç ve bitiş tarihi seçilir – geçici yetkilendirme için opsiyonel) alanlarının olduğu form.

- İnsan kaynakları ile entegredir; uygulama üzerinden yeni kullanıcı girişi yapılmaz. İşten ayrılan kullanıcılar otomatik olarak Inactive yapılır. Yeni personelin varsayılan yetkisi bulunmaz.

- Pasif rol, yeni kullanıcıya atanamaz (mevcut kullanıcılar için “rol pasif” uyarısı verilir, erişim kesilir veya alternatif rol atanması istenir).

1. ## Onay Kuralları

- Ekranlar: Modül (combobox), Ekran (combobox), Onay Adedi (0, 1, 2) kolonlarını içerir. Yeni satır eklenmez; yalnızca mevcut ekranların onay gereksinim adedi güncellenebilir.

- Onay gereksinimi tanımlı bir ekranda; tanımlanan onay adedini karşılayacak şekilde 1. ve/veya 2. kademe onaycı yetkisi olan en az bir rol ve bu role atanmış en az bir aktif kullanıcı bulunmuyorsa, Onay Kuralları ekranında Kaydet aşamasında kullanıcıya uyarı gösterilir. Bu durumda ilgili ekran(lar)da Insert/Update/Delete işlemleri engellenir (değişiklik yapılamaz).

- "{EKRAN1}, {EKRAN2}: Seçilen onay adedi için onaycı rol/kullanıcı eksik. Rol ve kullanıcı tanımlarını tamamlayın; aksi halde değişiklik işlemleri engellenecektir."

- Kullanıcı ilişkisi kurulmuş herhangi bir rolde, yapılan onay adedi tanımına göre onaycı tanımı eksik olan bir ekran için kaydetme aşamasında uyarı verilir.

- Limitler & Onaylar: İşlem Adı (unique), Ekran Adı (combobox), Alan Adı (textbox – property ismi girilmeli), Özel Koşul (opsiyonel – örneğin currencyCode == 'TRY'), Kapsam (Alan Değişiklikleri, Yüksek Rakamlar, Sadece Artışlar), Onay Adedi (0, 1, 2), Onaysız Limit, 1 Onaylı Limit kolonlarının olduğu satır eklenebilen ve mevcut satırların değiştirilebildiği tablo.

- Bu panel alan onayları içindir, ekran onaylarını etkilemez. Onaysız Limit ve 1 Onaylı Limit alanları sadece Değişiklik Tipi = Yüksek Rakamlar seçili iken gösterilir.

- 0 ile Onaysız Limit arası onaysız; Onaysız Limit ile 1 Onaylı Limit arası 1 onaylı ve 1 Onaylı Limitten büyük işlemler 2 onaylı gerçekleşir.

- Onaycı tanımı eksikse girilen işlem için onay geçerli olmaz, ancak bu durum iş kesici olmaz. Bu durumda da kaydetme aşamasında uyarı verilir.

- Alan Adı ve Özel Koşul textbox’larının yanında Doğrula butonu olur ve yazılan ifadenin geçerliliği test edilir.

1. ## Roller

- Rol Adı, Açıklama, Status (ENUM: status), Oluşturma Tarihi, Son Güncelleme Tarihi kolonlarının olduğu bir tablo.

- Detay ekranı; Ekran Yetkileri ve Limitler & Onaylar tablarından oluşan ve rol tanımlama ve güncelleme işlemlerinin gerçekleştirildiği ekrandır.

- Ekran Yetkileri: Tüm ekranların listelendiği ve hücrelerin checkbox’lardan oluştuğu bir tablo. Ekran, List (BOOL), View/Details (BOOL), Insert (BOOL), Update (BOOL), Delete (BOOL), Export (BOOL), 1. Onaycı Olabilir (BOOL), 2. Onaycı Olabilir (BOOL).

- 1\. Onaycı Olabilir rolü başka bir kullanıcı tarafından girilmiş işlemde 1. Onaycı olma yetkisini ifade eder. 2. Onaycı Olabilir de benzer şekilde.

- Limitler & Onaylar: İşlem Adı (combobox), Ekran Adı (combobox), 1. Onaycı Olabilir (BOOL), 2. Onaycı Olabilir (BOOL) kolonlarının olduğu satır eklenebilen ve mevcut satırların değiştirilebildiği tablo.

1. ## Parametreler

- Grup Adı, Parametre, Değer, Açıklama, Status (ENUM: status), Değiştiren Kullanıcı, Değişiklik Tarihi kolonlarının olduğu tüm parametrelerin listelendiği tablo.

- Değiştiren Kullanıcı ve Değişiklik Tarihi otomatik atanır, diğer bilgiler değiştirilebilir.

- Ekran üzerinden yeni parametre eklenemez. Değişiklik yapılacağında satırdaki değerler değiştirilebilir olur. Veya modal veya yeni sayfa da kullanılabilir, hangisi kolaysa. Ancak detay sayfasına ihtiyaç bulunmamaktadır.

1. ## Zamanlanmış İşler

- İş Adı, Status (ENUM: status), İş Tipi (BOOL: Bir Kez, Tekrarlı), Zamanlama (İş Tipi Tekrarlı ise dolu olacak), İş Sahibi, Ortalama Başarı Oranı, Ortalama Tamamlanma Zamanı, Ortalama Deneme Adedi, Ortalama CPU, Ortalama Bellek, Oluşturulma Tarihi, Son Güncelleme Tarihi alanlarının bulunduğu tablo.

- Detay ekranı; İş Tanımlama, Çalışma Programı, Manüel İş Çalıştırma, Log ve Performans tablarından oluşan ve zamanlanmış iş oluşturma, yönetim ve izleme işlemlerinin gerçekleştirildiği ekrandır.

- İş Tanımlama: İş Adı, Açıklama, Status (ENUM: status), İş Tipi (BOOL: Bir Kez, Tekrarlı), Zamanlama (İş Tipi Tekrarlı ise aktif olacak, örnek: 0 0 \* \* \* (Her gece saat 00:00)), İş Sahibi, Oluşturulma Tarihi, Son Güncelleme Tarihi alanlarının bulunduğu tablo. Ekleme yaparken de ilave olarak Çalıştırılacak Servis (Textbox – servisin adresi), Bağımlılıklar (combobox – Mevcut iş listesi), Maksimum Deneme Sayısı, Denemeler Arası Süre, Veri (Payload), Geri Bildirim (Geri bildirim yapılacak e-posta adresi) alanlarının bulunduğu form. Buton: Pasifleştir (Pasif işlerde Aktifleştir şeklinde gelir).

- Çalışma Programı: İşin Çalışacağı Zaman, İş Adı, Açıklama kolonlarını içeren kullanıcı tarafından değişiklik yapılamayan otomatik doldurulan bir günlük iş çalışma planı sunan tablo. Sadece bir günlük program bugün ve sonraki günler görülebilir.

- Manüel İş Çalıştırma: İş Adı (combobox – Mevcut iş listesi), İşin Çalışacağı Zamanı, Geri Bildirim (Geri bildirim yapılacak e-posta adresi), Gerekçe alanlarını içeren form ekranı.

- Log: İş Adı, Status (ENUM: job_status), Başlangıç Zamanı, Tamamlanma Zamanı, Gerçekleşen Deneme Sayısı, Servis Çıktısı, Tetikleyen Kullanıcı, Sonraki Çalışma Zamanı kolonlarını içeren kullanıcı tarafından değişiklik yapılamayan otomatik doldurulan tablo.

- <img style="max-width: 100%;" width="165" height="128" src="data:image/png;base64,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" class="jop-noMdConv">Performans: İş Adı, Ortalama Başarı Oranı, Ortalama Tamamlanma Zamanı, Ortalama Deneme Adedi, Ortalama CPU, Ortalama Bellek, Zamanlama (cron formatı) kolonlarının olduğu seçilen zaman aralığı için iş performansını gösteren tablo. Sağ üstte kolonlar butonu olur, buton tıklandığında multiselect combobox açılır. Anılan kolonlara ilave olarak Cron – Dakika, Cron – Saat, Cron – Ayın Günü, Cron – Ay, Cron – Haftanın Günü kolonları da eklenebilir. Böylelikle bu kolon başlıklarına tıklanarak da sıralama yapılabilir.

- Varsayılan durumda tanımlı batch işler:

- Günlük: Temsilcilere günlük mutabakat maili atılması

- Aylık: Periyodik sanction taraması

- Günlük: Bloke Bitiş Tarihi gelen müşterilerin ve temsilcilerin entity_status değerinin Active olarak güncellenmesi

- Günlük: Başlangıç tarihi henüz gelmemiş veya Bitiş Tarihi geçmiş ücret ve kampanyaların pasife alınması

- Günlük: Temsilciler için İşlem Başı Ortalama Ücret ve Temsilci Başı Ortalama İşlem Adedi hesaplanması

- Günlük: Doküman Yönetim Sistemi valid_until takibi – süresi dolan dokümanların arşive kaldırılması – Mevcut kurallar çerçevesinde kyc level veya status değişimi gerekirse bu da gerçekleştirilir (Örneğin ProofOfAddress dokümanları expire olmuş bir bireysel müşteri en fazla level 1 olabilir, level 2 dolayısıyla persistent cüzdan ve level 3 dolayısıyla yüksek tutarlı transfer kullanımı yeni adres belgesi sunup doğrulama tamamlanana kadar bloklanır).

- Aylık: Doküman Yönetim Sistemi "integrity check"; dokümanlar storage'tan okunup tekrar hash'lenip veritabanında saklanan file_hash ile karşılaştırılıp hatalı olanlar ile ilgili uyum görevlisine mail atılması

1. ## Bilgilendirme Gönderimleri

- Şablon Adı, Bildirim Türü (ENUM: notification_type), Konu, Son Tetiklenme Tarihi kolonlarının olduğu tüm bilgilendirme şablonlarının listelendiği tablo.

- Detay sayfası; Tanımlama, Manüel Tetikleme ve Log tablarından oluşan ve SMS, E-Posta, Push bilgilendirmeleri oluşturma, yönetim ve izleme işlemlerinin gerçekleştirildiği ekrandır.

- Tanımlama: Şablon Adı, Bildirim Türü (ENUM: notification_type), Konu, Şablon İçeriği (Şablon içeriğine parametre olarak değişen alanlar da eklenebilir (örneğin, kullanıcı adı, işlem numarası gibi)), Açıklama alanlarının olduğu tablo.

- Manüel Tetikleme: Şablon (combobox), Alıcı Adresi, Parametreler (Şablonun ihtiyaç duyduğu parametreler – textarea), Zamanlama, Gerekçe alanlarını içeren form ekranı.

- Log: Tarih, Şablon Adı, Bildirim Türü (ENUM: notification_type), Status (ENUM: notification_status), Alıcı, Alıcı Adresi, Mesaj kolonlarını içeren kullanıcı tarafından değişiklik yapılamayan otomatik doldurulan tablo.

1. ## Entegrasyonlar

- Entegrasyon Adı, Entegrasyon Tipi (ENUM: integration_type), Sistem Adı, Status (ENUM: entity_status) kolonlarının olduğu tüm entegrasyonların listelendiği tablo.

- Detay sayfasında Genel Bilgiler, Bağlantı & Güvenlik, Konfigürasyon, Log & İzleme tabları yer alır.

- Detay sayfası; Genel Bilgiler, Bağlantı & Güvenlik, Konfigürasyon, Log & İzleme tablarından oluşan ve entegrasyon oluşturma, yönetim ve izleme işlemlerinin gerçekleştirildiği ekrandır.

- Genel Bilgiler: Entegrasyon Adı, Entegrasyon Tipi (ENUM: integration_type), Sistem Adı, Status (ENUM: entity_status), Oluşturulma Tarihi, Oluşturan Kullanıcı, Son Güncelleme Tarihi, Güncelleyen Kullanıcı, Açıklama.

- Bağlantı & Güvenlik: Base URL / Endpoint, Kimlik Doğrulama Tipi (ENUM: auth_type), Anahtar Rotasyonu Zorunlu (checkbox), Timeout (ms), Connection Timeout (ms), IP Allowlist, TLS/Certificate Bilgisi, Credential (textbox, \*\*\* şeklinde maskelenmiş gösterim; API Key, Client Id, Client Secret, Certificate Id gibi). Credential bilgileri veritabanında düz metin olarak saklanmaz; credential kasasında (vault/keystore) tutulur ve ekranda sadece \*\*\* şeklinde maskelenmiş olarak gösterilir.

- Konfigürasyon: Rate Limit (req/min), Retry Politikası (ENUM: retry_policy), Max Retry Sayısı, İmza/Hash Kullan (checkbox), Webhook Callback URL, API Versiyonu, Circuit Breaker (checkbox - Circuit Breaker kapalıysa eşikler (Hata Oranı Eşiği, Pencere Süresi, Minimum İstek Sayısı, Açık Kalma Süresi) gizli olur), Hata Oranı Eşiği (%), Pencere Süresi (sn), Minimum İstek Sayısı, Açık Kalma Süresi (sn).  Retry Politikası şu şekilde çalışır: FixedDelay sabit bir değer kadar gecikme ile tekrar gerçekleşir; gecikme miktarı parametreden yönetilir. ExponentialBackoff 1,2,4,8,16, ... ilk bekleme 1 sn olup sonrakiler için bir öncekinin iki katı gecikme şeklinde tekrar gerçekleşir. Circuit Breaker şu şekilde çalışır: Son Pencere Süresi sn içinde hata oranı % Hata Oranı Eşiği üzerine çıkarsa ve en az Minimum İstek Sayısı tane istek yapılmışsa entegrasyon hata vermeye başladığı anlamına gelir ve sistemi ısrarla denemeye zorlamak yerine "Açık Kalma Süresi" sn boyunca çağrıları bloklar.

- Log & İzleme: Log Seviyesi (ENUM: log_level), Correlation Id, Operasyon, İstek Zamanı, Yanıt Zamanı, Süre (ms), Sonuç (ENUM: request_outcome), Retry Sayısı, Request Path, Request, Response, Log Kaynağı. Correlation Id aynı işleme ait farklı adımları (ör. create → status inquiry → callback) tek bir kimlik altında ilişkilendirerek uçtan uca izleme sağlar. Operasyon, örneğin Authenticate, Prepare Request gibi yapılmaya çalışılan işlemi ifade eder.

&nbsp;

1. # İnsan Kaynakları

- Personel bilgilerinin tutulduğu, izin ve rapor süreçlerinin yönetildiği basit bir modüldür. Ad-Soyad, Unvan, E-posta, Telefon, İşe Başlama Tarihi, Status (ENUM: employment_status) kolonlarının olduğu, tüm çalışanların listelendiği bir tablo.

1. ## Yeni Personel

- Butonlar: Belge Yükleme ve Belge Görme/İndirme butonları bulunur.

- Eksik belgelere ilişkin sayfanın üstünde uyarı bulunur.

- Detay Bilgiler Ekranı: Fotoğraf, Kullanıcı No, Adı, Soyadı, Kimlik No, Kimlik Tipi (ENUM: identity_document), Unvan, Departman (combobox: Departman tablosundan doldurulur), İşe Başlama Tarihi, Uyruğu, Doğum Yeri, Doğum Tarihi, Cinsiyeti (ENUM: gender), Medeni Durum (ENUM: marital_status), Evlenmeden Önceki Soyadı, Seri No / Doküman No, Veriliş Tarihi, Veren Makam, Geçerlilik Tarihi, Anne Adı, Baba Adı, Eğitim Durumu (ENUM: education_level), Son Mezun Olduğu Okul ve Bölüm, Mezuniyet Yılı, Vergi Ülkesi, Banka, Hesap No, IBAN, Acil Durum İrtibat Kişisi, Acil Durum İrtibat Telefonu, Status (ENUM: employment_status)

- Adres Paneli: Adres Adı, Tipi (ENUM: address_type), Ülke (combobox), İl (Türkiye ise combobox), İlçe (Türkiye ise combobox), Mahalle/Semt (Türkiye ise combobox), Cadde, Sokak, Bina No, Daire No, Posta Kodu, UAVT No (sadece Türkiye ise görülür ve otomatik çekilir), Ek Bilgiler (Apartman adı, site adı veya diğer açıklamalar...), İrtibat Adresi (checkbox). Yabancı çalışanlarda Ülke, İl, İlçe, Posta Kodu, Adres (textarea) olarak adres bilgisi alınır, diğer bilgiler alınmaz. Kişinin birden fazla adresi olabilir. Bir tanesini irtibat adresi seçmesi gerekmektedir.

- İletişim Bilgileri Paneli: E-posta ve Telefon bilgilerinin tutulduğu panel. Personelin birden fazla telefonu ve e-posta adresi olabilir. Birer tanesini asıl iletişim kanalı seçmesi gerekmektedir. Telefon numarası OTP ile doğrulanmalıdır.

- Eklenebilecek Belge Tipleri: Özgeçmiş, Kimlik Fotokopisi, Ehliyet (sürücüler için), Nüfus Kayıt Örneği, İkametgâh Belgesi, Diplomaların Fotokopisi, Adli Sicil Kaydı, Sağlık Raporu, Evlilik Cüzdanı Fotokopisi (evli çalışanlar), Aile Üyeleri Kimlik Fotokopisi (evli personelin eşi ve varsa çocukları), Askerlik Durum Belgesi (erkek çalışanlar), Kan Grubu Kartı, Zimmet Belgesi, Sgk İşe Giriş Bildirgesi, İş Sözleşmesi, Teşvik Belgesi (çalışanların teşvikten yararlanması durumunda), Ebeveyn Onayı (18 yaşın altındaki çalışanlar), Çalışma İzni (yabancı çalışanlar), Resmi Yazışmalar, Tutanak, Disiplin Cezası, Performans Değerlendirme Formu, İstifa Dilekçesi, Fesih Bildirimi, İbraname, SGK İşten Ayrılma Bildirimi, İhbarname, Hizmet Belgesi, İhtarnameler, Diğer Personel Dokümanları

- Yeni personel girişinde Kullanıcı No alanı getirilmez. Personel detayı görüntülenmesinde Kullanıcı No değiştirilemez olarak yer alır.

- Yabancı çalışan olacaksa çalışma vizesi manüel yürütülecektir.

1. ## Personel İzin & Rapor

- Adı, Soyadı, Departman, Unvan, İzin/Rapor Türü (ENUM: leave_type), Tarih ("Başlangıç Tarihi-Bitiş Tarihi" şeklinde), Toplam Gün Sayısı, Notlar, Status (ENUM: task_status) kolonlarını içeren tablo.

- Kullanıcı kendi izinlerini görebilir, birim yöneticisi kendi birimindeki personellerin izinlerini görebilir, İK ve CEO tüm listeyi görebilir.

- Toplam gün sayısı parametreden alınır, bu ekrandan değiştirilemez.

- Kullanıcıya sayfanın en üstünde Kullandığı Yıllık İzin (o yıl içerisinde), Kalan Yıllık İzin (toplam), Kullandığı Sağlık Raporu (o yıl içerisinde) bilgileri sunulur. Her bir izin ve rapor türü için limitler parametreden alınır.

100.## Yeni Yıllık İzin & Rapor

- İzin/Rapor Türü, Tarih ("Başlangıç Tarihi-Bitiş Tarihi" şeklinde), İşgünü, Notlar bilgileri alınır.

- 1\. Onay kullanıcının yöneticisi, 2. Onay İK yetkilisi olur. Onay Havuzu ekranından yürütülür.

- İzin & Rapor İptali için Personel İzin/Rapor listesinden iptal edilmek istenen İzin/Rapor seçilip açılan Yıllık İzin & Rapor Detay sayfasında sadece Başlangıç Tarihi-Bitiş Tarihi alanlarını değiştirip iptal onay süreci başlatılabilir. Başlangıç Tarihi izin başlangıç tarihinden önce olamaz, Bitiş Tarihi de izin bitiş tarihinden sonra olamaz. Kısmi iptal gerçekleştirilebilir.

- İptal onay süreçleri izin onay süreçleri ile aynıdır.

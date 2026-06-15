TEMSİLCİ

&nbsp;

&nbsp;

1. # Ana Sayfa

- Son başarılı girişten itibaren başarısız erişim teşebbüsü varsa bunlar bilgi mesajı olarak kişiye sunulur.

- Başarılı ve Başarısız Günlük İşlem Adet ve Tutarları Grafikleri

- Bekleyen İşlemler Paneli: İşlem Numarası, İşlem Tarihi, Gönderen Adı ve Soyadı / Unvanı, Alıcı Adı ve Soyadı / Unvanı, IBAN, İşlem Türü, Tutar, Para Birimi, Açıklama, Referans Numarası, Status kolonlarının olduğu, temsilcinin gönderen temsilcisi olduğu veya para çekme işlemi talebinin temsilciye yapıldığı bekleyen işlemlerinin listelendiği tablo. Panelde kullanıcıya gösterilecek işlem yoksa panel görünmez.

- Bekleyen Müşteriler Paneli: Oluşturma Tarihi, Müşteri No, Kimlik No, Ad-Soyad, Status kolonlarından oluşan temsilci son 1 ay içerisinde girilmiş ve statüsü Active (Aktif) olmayan müşterileri listeleyen tablo.

**İşlem Onay**

- Tüm para çekme ve para transferlerinde işlem tamamlanmadan önce işlem özetini sunan İşlem Onay ekranı gösterilir. Ayrıca işlem listeleme ekranları da İşlem Detay sayfası olarak da bu sayfaya yönlenir.

- Butonlar: Onayla, Düzenle, İptal Et, Geri Dön, Dekont İndir. Onayla, Düzenle, İptal Et butonları sadece Onay modunda görünür, Geri Dön, Dekont İndir butonları sadece Detay modunda görünür.

- Gönderen: Adı ve Soyadı / Unvanı, Müşteri No, Cüzdan Numarası, Telefon, Ülke.

- Alıcı: Adı ve Soyadı / Unvanı, Müşteri No, Cüzdan Numarası, Telefon, E-posta, IBAN, Ülke.

- Referans: İşlem Referans No, Yurt Dışı Referans No.

- İşlem ve Tutarlar: Kaynak Para Birimi, Gönderilen Tutar, Sabit Ücret, Oransal Ücret, Toplam Ücret (Sabit Ücret + Oransal Ücret toplamı), Gönderenin Ödeyeceği Toplam Tutar (Gönderilen Tutar + Toplam Ücret), Hedef Para Birimi, Döviz Kuru, Alıcının Alacağı Net Tutar. Kaynak Para Birimi ve Hedef Para Birimi yalnızca döviz/çapraz para birimli akışlarda gösterilir; diğer akışlarda Para Birimi olarak tek alan gösterilir.

- İşlem Detayları: Para Gönderme Tarihi, Para Çekme Tarihi, İşlem Türü (ENUM: transaction_type), Ödeme Türü (ENUM: payment_purpose), İşlem Status (ENUM: transaction_status), İşlem Açıklaması.

- Gönderen Yetkili Kişi: Adı Soyadı, Müşteri No, Telefon, Yetki Doğrulama Zamanı. Panel yalnızca Gönderen Tipi = Tüzel ve işlem "para transfer” ise görünür.

- Alıcı Yetkili Kişi: Adı Soyadı, Müşteri No, Telefon, Yetki Doğrulama Zamanı. Panel yalnızca Alıcı Tipi = Tüzel ve işlem “para çekme” ise görünür.

- Temsilci Yetkili Kişi: Temsilci Rolü (Gönderen Temsilcisi, Alıcı Temsilcisi), Yetkili Kişi Adı ve Soyadı, Yetkili Kişi No. Panel, yalnızca Detay Modu’nda da görünür.

- Güvenlik: Onay Kodu (OTP), Kimlik kontrol edildi (checkbox), Fotoğraf eşleşti (checkbox), Yetki kontrol edildi (checkbox – işlem tüzel kişi adına gerçekleştiriliyorsa görünür), Şüpheli davranış yok (checkbox)

- Sadece Güvenlik panelindeki alanlar Onay modunda değiştirilebilir, diğer paneller değiştirilemez. Null alanlar gösterilmez.

- Onay modunda, Düzenle butonu ile kullanıcı işlem giriş ekranına döner, ekranda işleme dair tüm bilgiler dolu getirilir. Detay Modu’nda, Geri Dön ile kullanıcı işlem listeleme ekranına, bu ekran açılmadan önceki filtreleri korunmuş şekilde döner.

- Onay modunda Onayla butonu tetiklendiğinde, herhangi bir iş kesici kontrole takılmamasına rağmen işlem Risk Seviyesi = Kritik olarak hesaplanmışsa kullanıcıya “İşlem Beyanı” modali gösterilir ve aşağıdaki alanlar talep edilir. Bu modal, işlemi bloklamaz; ancak girilen değerler beyan (declared) olarak işlem kaydına immutable biçimde yazılır, risk izleme/raporlama ve gerekiyorsa sonradan yapılacak kontroller için kullanılır. Aynı gönderen-alıcıya yönelik işlemlerde son X gün (X parametreden alınır) içinde alınmış beyan varsa alanlar otomatik dolu gelir; kullanıcı isterse günceller. Seçimler Unknown/Other olduğunda kısa açıklama zorunludur.

- İşlem onaylandıktan sonra “İşlem başarıyla tamamlandı!” sayfasına yönlendirilir; bu sayfadan dekont indirilebilir. Detay Modu’nda dekont indirme her zaman mümkündür; dekont üretimi tamamlanmamış işlemlerde buton pasif olur.

- Faz 2: Onay modunda, temsilcinin görsel kimlik kontrolünü desteklemek amacıyla müşterinin sistemde mevcut en yeni 2 adet Identity dokümanından otomatik olarak yüz fotoğrafı kırpılarak ekranda gösterilir. Müşteriye ait sistemde önceden yüklenmiş Identity dokümanı yoksa, yalnızca işlem esnasında alınan kimlik dokümanından kırpılan yüz fotoğrafı gösterilir. Gösterilen geçmiş kimlik fotoğrafının yanında Kimlik Tipi ve Doküman Yüklenme Tarihi bilgileri sunulur.

**İmzalı Dekont Yükleme**

- Butonlar: Dekont Yazdır, İmzalı Dekont Yükle

- Menüde gözükmez ancak tüm transferlerde işlem onaylandıktan sonra dekont indirilip imzalı dekont yüklenen İmzalı Dekont Yükle ekranı gösterilmelidir.

- Dekont işlem numarası ile ilişkili olarak yüklenir.

- Belge yüklemesi tamamlandıktan sonra "İşlem başarıyla tamamlandı!" yazan bir sayfaya yönlenir.

**Ayarlar**

- Sağ üstte gözükür, menüde yer almaz.

- Dekontlarım: İşlem No, Tarih, Tutar, Para Birimi alanları ile listelenir; her satırdan dekont indirilebilir.

- Parola: Eski Parola, Yeni Parola, Yeni Parola (Tekrar), Hangi Sıklıkla Güncellensin (Combobox: 1 Ay, 3 Ay, 6 Ay)

- Karşılama Mesajı: Phishing önlemi olarak kullanıcıya özgü karşılama mesajı

- İletişim Bilgileri: İletişim Adresi, Asıl Adres (checkbox), Actions (Tekrar Gönder, Düzenle, Sil) kolonlarını içeren ve E-posta ve Telefon bilgilerinin tutulduğu tablo.

- Adresler

- Uygulama Ayarları: Dil Tercihi, Tema (Açık, Koyu), Metin Boyutu (Küçük, Standard, Büyük, Ekstra Büyük)

- Hatalı Girişler

- Kullanıcı Yönetimi: Admin Temsilci yetkisine sahipse ve temsilcinin birden fazla kullanıcısı varsa gözükür ve temsilci adına işlem yapabilecek kullanıcılar ve limit kısıtlamaları yönetilir.

- İletişim Bilgileri sayfasında, Tekrar Gönder aksiyonu, doğrulanmış satırlarda tetiklenirse kullanıcıya uyarı gösterilir: "İletişim adresi zaten doğrulandı!". Birden fazla e-posta ve telefon bilgisi eklenebilir. Telefonlardan 1 tanesi ve e-posta adreslerinden 1 tanesi asıl iletişim kanalı seçilmelidir. Kullanıcı bir satırı Asıl seçtiğinde, aynı kanaldaki önceki asıl otomatik olarak kaldırılır; sistem eski asıl adrese bilgilendirme gönderir: "Asıl iletişim adresiniz değiştirildi!" ve kullanıcıya UI’da bilgi mesajı gösterir. Kullanıcı yeni satır ekleyebilir, mevcut satırları düzenleyebilir veya silebilir. Silme ve iletişim adresinin güncellenmesi (adres alanı değişimi) işlemlerinde sistem, değişiklik öncesi (eski) adrese bilgilendirme gönderir: "İletişim adresiniz güncellendi!". (Asıl değişikliğinde ayrıca bilgilendirme zaten gönderilir.) Yeni satır ekleme esnasında tablonun altında yeni ve boş bir satır açılır; satır güncellemede mevcut bilgiler değiştirilebilir şekilde gösterilir; her ikisinde de satırın en sağında Kaydet ve İptal ikonları yer alır. Ekleme ve adres değişikliği içeren güncelleme esnasında yeni irtibat bilgileri doğrulanmalıdır. E-posta adresi doğrulama linki ile, Telefon numarası OTP ile doğrulanır. Kullanıcı girişi tamamladıktan sonra ilgili satırın sağında yer alan Kaydet ikonunu tetikler. Satır Telefon ise Doğrulama Modal’ı açılır (Doğrulama Kodu alanı ve Tekrar Gönder, Doğrula, İptal butonları). Doğrulama başarılı oluncaya veya kullanıcı İptal’e basıncaya kadar modal kapanmaz. İptal’e basılırsa modal kapanır ve satır Kaydet öncesi haline döner. Sabit telefonlar doğrulanmaz ve Asıl seçilemez. Tekrar Gönderme rate limit ile kısıtlanır (saniyede 1 adet, bir adres için 5 adet)

&nbsp;

101.# Hesaplarım

- Sayfa, temsilcinin kendi hesap bakiyelerini ve bu hesapları etkileyen tüm hareketleri izleyebileceği ekrandır. Temsilci yalnızca kendi temsilciliğine ait hesapları görebilir; başka temsilciliklere ait hesaplar listelenmez.

- Bakiye Paneli: Hesap Türü (AgentAdvance (Avans), AgentCommission (Komisyon)), Para Birimi, Kullanılabilir Bakiye kolonlarının olduğu, temsilcinin tüm hesapların listelendiği tablo.

- Hesap Hareketleri Paneli: İşlem Numarası, İşlem Tarihi, İşlem Yönü (ENUM: transaction_direction), Cüzdan, Karşı Taraf No, Karşı Taraf Adı ve Soyadı / Unvanı, Karşı Hesap (Cüzdan No / IBAN), Referans No, İşlem Türü (ENUM: transaction_type), Para Birimi, Tutar, İşlem Sonrası Bakiye, Status (ENUM: transaction_status), Açıklama kolonlarının olduğu, temsilci hesaplarını etkileyen para giriş çıkışlarının listelendiği bir tablo.

- Hesap Hareketleri Paneli, İşlem Numarası, İşlem Yönü, İşlem Türü, Cüzdan, İşlem Tarihi Aralığı, Tutar Aralığı (min–max), Karşı Taraf (birebir eşitlik aranmaz, ismin içermesi yeterlidir) alanlarıyla filtrelenebilir.

- Satıra tıklandığında İşlem Detay sayfası açılır.

- İşlem Yönü, işlem tipine göre değil işlemin bakiyeye etkisine göre belirlenir; bakiye artıyorsa Para Girişi, azalıyorsa Para Çıkışı olarak gösterilir.

- Tutar alanı her zaman pozitif değer olarak gösterilir; artı/eksi etkisi İşlem Yönü ile ifade edilir. İşlem Sonrası Bakiye, seçili cüzdanın işlem sonrası bakiyesini gösterir ve gönderen/alıcı ayrımı yapılmaksızın tamamen bu cüzdan perspektifidir.

- Varsayılan sıralama İşlem Tarihi’ne göre yeniden eskiye olacak şekilde yapılır; kullanıcı kolon bazlı sıralama yapabilir.

&nbsp;

102.# Yeni Bireysel Müşteri Kaydı

- Butonlar: Taslak Kaydet, Kaydet, Vazgeç (Değişiklik varsa “Kaydetmeden çıkılsın mı?” uyarısı)

- Ekran; Müşteri Bilgileri, Nüfus Bilgileri, İletişim Bilgileri ve Yüklü Belgeler tablarından oluşur. Müşteri Bilgileri tabı Müşteri Bilgileri Paneli’nden oluşur. Nüfus Bilgileri tabı; Nüfus Bilgileri Paneli, Detay Bilgiler Paneli ve Yabancı Müşteri Paneli’nden oluşur. İletişim Bilgileri tabı; Adres Paneli ve İletişim Bilgileri Paneli’nden oluşur. Yüklü Belgeler tabı Müşteri Belgeleri Paneli’nden oluşur.

- Müşteri Bilgileri Paneli: Adı ve Soyadı, Kimlik No, Kimlik Ülkesi / Uyruğu (combobox – default TUR), Kimlik Tipi (ENUM: identity_document), Doğum Tarihi, Kimlik Belgesi Ön, Kimlik Belgesi Arka. Kimlik Ülkesi = TUR ise Kimlik Tipi = IdentityCard olmak zorundadır ve değiştirilemez. Kimlik Belgesi Ön ve Kimlik Belgesi Arka alanlarının yanında Belge Yükle butonu yer alır; buton, taranmış kimliğin yüklenmesini sağlar. Belge Yükleme Modal’ında Belge Türü alanı yer almaz; servis tarafında Kimlik Tipi değeri ile otomatik doldurulur ve sisteme Belge Kategorisi = Identity olarak kaydedilir. Türk müşterilerde taranmış kimlik OCR ile işlenerek Nüfus Bilgileri Paneli otomatik doldurulur. Belge yüklemesi, diğer tablara geçiş öncesinde gerçekleştirilmelidir.

- Şüpheli İşlem Kontrolü (Checkbox). Checkbox ticklenirse checkbox’da küçük bir bilgilendirme kutusu açılır: "Sadece şüpheli bulduğunuz işlemler için bu kutucuğu işaretleyiniz."

- Nüfus Bilgileri Paneli: Doğum Yeri, Medeni Durum (ENUM: marital_status), Seri No / Doküman No, Veriliş Tarihi, Veren Makam, Geçerlilik Tarihi, Anne Adı, Baba Adı, Cinsiyeti (ENUM: gender). Yerli müşterilerde otomatik dolar; sadece yabancı müşterilerde değişiklik yapılabilir.

- Detay Bilgiler Paneli: Evlenmeden Önceki Soyadı, Vergi Ülkesi, Eğitim Durumu (ENUM: education_level), Çalışma Durumu (ENUM: employment_category), Mesleği (ENUM: employment_occupation), Çalıştığı Kurum, Dil Tercihi, Notlar. Gelir Belgesi Yükle butonu yer alır; opsiyonel olarak ProofOfFunds belgesi yüklenebilir. Sisteme Belge Kategorisi = ProofOfFunds olarak kaydedilir.

- Yabancı Müşteri Paneli: Vize Tipi (ENUM: visa_type), Vize Bitiş Tarihi, Oturum İzni, Oturum İzni Bitiş Tarihi, Doğum Ülkesi, Yerleşik Olduğu Ülke. Sadece yabancı müşterilerde görülür.

- Adres Paneli: Adres Adı, Tipi (ENUM: address_type), Ülke (combobox), İl (Türkiye ise combobox), İlçe (Türkiye ise combobox), Mahalle/Semt (Türkiye ise combobox), Cadde, Sokak, Bina No, Daire No, Posta Kodu, Ek Bilgiler (Apartman adı, site adı veya diğer açıklamalar...), İrtibat Adresi (checkbox). Ülke Türkiye değilse; Ülke, İl, İlçe, Posta Kodu ve Adres (textarea) olarak adres bilgisi alınır; diğer bilgiler alınmaz. Müşterinin birden fazla adresi olabilir; bunlardan bir tanesinin irtibat adresi seçilmesi gerekmektedir. Adres Belgesi Yükle butonu yer alır; opsiyonel olarak irtibat adresi için ProofOfAddress belgesi yüklenebilir. Sisteme Belge Kategorisi = ProofOfAddress olarak kaydedilir.

- İletişim Bilgileri Paneli: İletişim Adresi, Asıl Adres (checkbox), Durum (ENUM: status), Actions (Tekrar Gönder, Düzenle, Sil) kolonlarını içeren ve E-posta ve Telefon bilgilerinin tutulduğu tablo. Tekrar Gönder aksiyonu, doğrulanmış satırlarda tetiklenirse kullanıcıya uyarı gösterilir: "İletişim adresi zaten doğrulandı!". Birden fazla e-posta ve telefon bilgisi eklenebilir. Telefonlardan 1 tanesi ve e-posta adreslerinden 1 tanesi asıl iletişim kanalı seçilmelidir. Kullanıcı bir satırı Asıl seçtiğinde, aynı kanaldaki önceki asıl otomatik olarak kaldırılır; sistem eski asıl adrese bilgilendirme gönderir: "Asıl iletişim adresiniz değiştirildi!" ve kullanıcıya UI’da bilgi mesajı gösterir. Kullanıcı yeni satır ekleyebilir, mevcut satırları düzenleyebilir veya silebilir. Silme ve iletişim adresinin güncellenmesi (adres alanı değişimi) işlemlerinde sistem, değişiklik öncesi (eski) adrese bilgilendirme gönderir: "İletişim adresiniz güncellendi!". (Asıl değişikliğinde ayrıca bilgilendirme zaten gönderilir.) Yeni satır ekleme esnasında tablonun altında yeni ve boş bir satır açılır; satır güncellemede mevcut bilgiler değiştirilebilir şekilde gösterilir; her ikisinde de satırın en sağında Kaydet ve İptal ikonları yer alır. Ekleme ve adres değişikliği içeren güncelleme esnasında yeni irtibat bilgileri doğrulanmalıdır. E-posta adresi doğrulama linki ile, Telefon numarası OTP ile doğrulanır. Kullanıcı girişi tamamladıktan sonra ilgili satırın sağında yer alan Kaydet ikonunu tetikler. Satır Telefon ise Doğrulama Modal’ı açılır (Doğrulama Kodu alanı ve Tekrar Gönder, Doğrula, İptal butonları). Doğrulama başarılı oluncaya veya kullanıcı İptal’e basıncaya kadar modal kapanmaz. İptal’e basılırsa modal kapanır ve satır Kaydet öncesi haline döner. Sabit telefonlar doğrulanmaz ve Asıl seçilemez. Tekrar Gönderme rate limit ile kısıtlanır (saniyede 1 adet, bir adres için 5 adet)

- Müşteri Belgeleri: Yüklenme Tarihi, Doküman Kategorisi (ENUM: document_category), Doküman Türü, Belge Durumu (ENUM: document_status), Onay Durumu (ENUM: approval_status - onay zorunlu değilse "-" işareti gösterilir), Geçerlilik (valid_until boş ise "Süresiz", valid_until < bugün ise "Süresi Dolmuş", valid_until ≤ bugün + X gün (parametre) ise "Yakında Dolacak") kolonlarının olduğu müşterinin Identity, ProofOfAddress, ProofOfFunds kategorilerinde yüklü dokümanların listelendiği ancak indirilemediği tablo. Değişiklik yapılamaz, belge yüklendikçe otomatik dolar.

- Kimlik No bilgisi girildikten sonra bu kimlik ile müşteri tanımı var ise mevcut bilgiler ile ekran doldurulur. Temsilci eksik bilgileri girebilir veya Müşteri Bilgileri Paneli ve Nüfus Bilgileri Paneli dışındaki bilgilerde değişiklik yapabilir. Müşterinin aktif pending transferi varken telefon, e-posta, adres, uyruğu/ülke değişikliği ve PoA/PoF ekleme yapılmasına müsaade edilmez: "Müşterinin devam eden işlemi bulunmaktadır. XX için lütfen genel müdürlük ile irtibata geçiniz."

- Kimlik No girildiğinde kayıtlı kişi aday müşteri ise veya kaydı taslak durumundaysa, zorunlu bilgiler doldurulduktan sonra Kaydet butonu tetiklendiğinde kişinin kaydı Bireysel Müşteri olarak güncellenir.

- Belge Yükleme modalında Ekle ve İptal butonları bulunur. Form panelinde; Belge Türü (combobox – belge kategorisi için tanımlanmış belge türleri), Geçerlilik Süresi (valid_from – valid_until şeklinde iki tarih girişi yapılabilir) ve Dosya (Browse) alanları yer alır.

- Yeni müşteri oluşturma esnasında kullanıcı Kaydet butonuna bastığında sistem, zorunlu alanlar için yaptığı kontrollerden sonra belge kontrolü yapar; kişinin asgari olarak Identity kategorisinde onay gerektirmeyen veya onaylanmış (approval_required = false veya approval_status = Approved) belgesi olmalıdır. Son olarak da kimlik doğrulama ve sanction/kara liste/IBAN kontrollerini otomatik biçimde arka planda başlatır. Bu kontroller için kullanıcıdan ayrıca bir aksiyon (ayrı bir butona basma, ayrı bir ekran/işlem başlatma gibi) beklenmez.

- Mevcut müşteri güncelleme esnasında Nüfus Bilgileri Paneli'nde değişiklik yapılmışsa, Kaydet’e basıldığında sistem kimlik doğrulama ve sanction/kara liste kontrolünü otomatik olarak tekrar çalıştırır. Bunun dışında müşterinin KYC seviyesinin yükselmesi, adres ve ülke bilgilerinin değişikliği sanction/kara liste kontrolü tamamlanıp sonuç “uygun/temiz” olarak doğrulanmadan gerçekleştirilemez; kişinin kara liste kaydına rastlanırsa Status’u Blocked yapılır. Bunlar dışındaki değişikliklerde Kaydet butonunda kimlik doğrulama ve sanction/kara liste kontrolleri tetiklenmez.

&nbsp;

103.# Müşteri Arama & Görüntüleme

- Müşteri No veya Kimlik No kullanarak müşteri sorgulanır. Sorgulama sonrasında müşteriye ilişkin gelen uyarılar sayfanın en üstünde uyarı mesajı (örneğin pembe arka fon üzerine bordo renkli) olarak sıralanır.

- Butonlar: Belge Yükle, Belge Görme

- Müşteri Bilgileri Paneli: Müşteri No, Ad-Soyad, Kimlik No, KYC Seviyesi (ENUM: kyc_level), Risk Segmenti (ENUM: level), Cep Telefonu, E-posta, İl, İlçe, Üyelik Tarihi (Müşteri Oluşturulma Tarihi), Kampanya, Kampanya Sonlanma Tarihi, Status (ENUM: entity_status). Status değeri Blocked (ENUM: entity_blockage_reason) veya Closed (ENUM: entity_closure_reason) ise gerekçesi de yanına tire eklenerek yazılır, örneğin Bloke – Belge Eksik, Kapalı – Uzun Süre Kullanılmama, gibi. Asıl iletişim kanalı işaretlenmiş Cep Telefonu ve E-posta gösterilir.

- Hesap Bilgileri Paneli: Cüzdan No, Kullanılabilir Bakiye (toplam bakiye-bloke miktarı), Para Birimi, Para Çekme İşlem Limiti, Para Transfer İşlem Limiti, Uluslararası Transfer İşlem Limiti kolonlarının olduğu, müşteri hesaplarının listelendiği tablo.

- Bekleyen İşlemler Paneli: İşlem Numarası, İşlem Tarihi, İşlem Yönü (ENUM: direction: Inflow=Para Girişi / Outflow=Para Çıkışı), Karşı Taraf No, Karşı Taraf Adı ve Soyadı / Unvanı, Karşı Hesap (Cüzdan No / IBAN), Gönderen Temsilci No, Alıcı Temsilci No, Referans No, İşlem Türü (ENUM: transaction_type), Para Birimi, Tutar, Status (ENUM: transaction_status), Açıklama kolonlarının olduğu, müşterinin bekleyen işlemlerinin listelendiği tablo. Müşterinin gönderici veya alıcı olduğu fakat sonlanmamış işlemler varsa Bekleyen İşlemler Paneli görülür.

- Belge Yükleme modalında Ekle ve İptal butonu bulunur. Form panelinde ise Belge Kategorisi (ENUM: document_category), Belge Türü (combobox – seçilen belge kategorisi için tanımlanmış belge türleri), Geçerlilik Süresi (bu alana valid_from – valid_until şeklinde iki tarih girişi yapılabilir), Dosya (Browse) alanları yer alır.

- Belge Görme modalında Yüklenme Tarihi, Doküman Kategorisi (ENUM: document_category), Doküman Türü, Belge Durumu (ENUM: document_status), Onay Durumu (ENUM: approval_status - onay zorunlu değilse "-" işareti gösterilir), Geçerlilik (valid_until boş ise "Süresiz", valid_until < bugün ise "Süresi Dolmuş", valid_until ≤ bugün + X gün (parametre) ise "Yakında Dolacak") kolonlarının olduğu müşterinin Identity, ProofOfAddress, ProofOfFunds kategorilerinde yüklü dokümanların listelendiği ancak indirilemediği tablo yer alır.

&nbsp;

104.# Para Çekme

- Müşteri No veya Kimlik No / VKN, İşlem Referans No, Yurt Dışı Referans No, Adı ve Soyadı / Unvanı, Para Birimi (combobox), Tutar, Şüpheli İşlem Kontrolü (Checkbox). İşlem Referans No veya Yurt Dışı Referans No bilgilerinden bir tanesi yeterlidir. Ekran para çekme (cash payout) işlemini "Alıcı" kişi üzerinden yürütür; ekrandaki müşteri bilgileri alıcıya aittir.

- Ücret ve Komisyonlar: Tutar (min_amount-max_amount şeklinde yazılır, max_amount bir sonraki dilimin min_amount’udur), Sabit Ücret, Oransal Ücret, Para Birimi, Kampanya Geçerli Tarih (Başlangıç Tarihi-Bitiş Tarihi şeklinde yazılır) kolonlarının olduğu, müşteriye özel para çekme ücret ve komisyonların listelendiği bir tablo.

- Şüpheli İşlem Kontrolü (Checkbox) ticklenirse checkbox’da küçük bir bilgilendirme kutusu açılır: "Sadece şüpheli bulduğunuz işlemler için bu kutucuğu işaretleyiniz."

- Müşteri No veya Kimlik No kullanarak müşteri sorgulanır. Eğer aktif bir bireysel müşteri tanımı varsa ve asgari kyc level 1 ise müşterinin kimlik belgesinin ön ve arka yüzünün taranıp sisteme eklenmesi beklenir. Kimlik Ülkesi / Uyruğu (combobox – default TUR), Kimlik Tipi (ENUM: identity_document), Doğum Tarihi, Kimlik Belgesi Ön, Kimlik Belgesi Arka alanları görünür olur. Kimlik Ülkesi = TUR ise Kimlik Tipi = IdentityCard olmak zorundadır ve değiştirilemez. Kimlik Belgesi Ön ve Kimlik Belgesi Arka alanlarının yanında Belge Yükle butonu yer alır; buton, taranmış kimliğin yüklenmesini sağlar. Belge Yükleme Modal’ında Belge Kategorisi ve Belge Türü alanı yer almaz; servis tarafında Kimlik Tipi değeri ile otomatik doldurulur ve sisteme Belge Kategorisi = Identity olarak kaydedilir. Taranmış kimlik OCR ile işlenerek sistemdeki kişi bilgileri ile karşılaştırılır, KPS kontrolü yapılmaz.

- Müşteri No veya Kimlik No kullanarak müşteri sorgulanır. Eğer aktif bir tüzel müşteri tanımı varsa ve kyc status Approved ise Yetkili Kişi Kimlik No alanı görünür olur (Müşteri No veya Kimlik No / VKN’den sonra, İşlem Referans No’dan önce). Girilen kişinin gerçekten firma adına para çekme yetkisinin bulunup bulunmadığı kontrol edilir. Eğer yetkisi varsa bir üst maddedeki süreç birebir aynı şekilde işletilir. Eğer tüzel kişinin eksik veya süresi geçmiş belgesi var ve bundan dolayı status'u Active değilse "İşleminizin devam etmesi için müşteri belgelerindeki eksiklikler tamamlanmalıdır. Eksik belgeler: XXX, YYY."  uyarısı verilir. Uyarı mesajında Belge Ekle ve Tamam butonları yer alır. Belge Ekle butonu tetiklenirse Belge Yükleme modal'ı açılır. Yüklenmesi gereken tüm belgeler için ayrı birer panel olur.

- Gönderen kişi alıcının kimlik bilgilerinin birçoğuna sahip olmadığı için para çekmede çoğunlukla eksik bilgi olacaktır. Müşteri No veya Kimlik No kullanarak müşteri sorgulanır. Eğer bir müşteri tanımı yoksa veya eksik bilgi veya belge tamamlanması gerekiyorsa (status: Incomplete or Incorrect Information veya Missing Documents) bir messagebox ile "Müşteri bilgi ve belgelerindeki eksikliklerin tamamlanması için Yeni Müşteri Kaydı ekranına yönlendiriliyorsunuz." uyarısı verilir. Kullanıcının onayı sonrası Yeni Müşteri Kaydı ekranı modal olarak açılır veya ekrana yönlendirme sağlanır; kayıt tamamlandığında kullanıcı aynı Para Çekme ekranına geri döner ve sorgu sonucu otomatik yenilenir. Müşteri tanımı yapılırken kimlik belgesi yüklendiği için geri dönüldüğünde kimlik belgesi yükleme alanları görünmez.

- Müşteri No veya Kimlik No ile sorgu yapıldığında, müşterinin yalnızca tek bir cüzdanı varsa Para Birimi alanı cüzdanın para birimi ile otomatik doldurulur ve değiştirilemez. Tutar alanı ise cüzdan türüne göre belirlenir: CustomerTransactional ise kullanılabilir bakiye otomatik gelir ve değiştirilemez; CustomerPersistent ise kullanılabilir bakiye varsayılan olarak gelir ancak değiştirilebilir. Müşterinin birden fazla cüzdanı varsa Para Birimi seçimi sonrasında sistem öncelikle seçilen para birimindeki CustomerTransactional cüzdanı arar; varsa Tutar alanını bu cüzdanın kullanılabilir bakiyesi ile, yoksa aynı para birimindeki CustomerPersistent cüzdanın kullanılabilir bakiyesi ile doldurur. CustomerTransactional cüzdandan para çekiliyorsa bakiyenin tamamı çekilir ve Tutar alanı değiştirilemez.

- Müşteri sorgulama sonrasında gelen uyarılar sayfanın en üstünde uyarı mesajı (örneğin önemli uyarılar pembe arka fon üzerine bordo renkli) olarak sıralanır. Örnek uyarı: "Bu hesap daha önce kimlik dolandırıcılığına maruz kaldı, lütfen ödeme yaparken dikkatli olun.", "Bu hesap inceleme altındadır, para çekme blokesini kaldırmak için lütfen genel merkezi arayınız."

- Belge Yükleme modalında Ekle ve İptal butonları bulunur. Form panelinde; Belge Kategorisi (ENUM: document_category), Belge Türü (combobox – belge kategorisi için tanımlanmış belge türleri), Geçerlilik Süresi (valid_from – valid_until şeklinde iki tarih girişi yapılabilir) ve Dosya (Browse) alanları yer alır.

- Para çekme işlemi başlatılmadan önce, KYC seviyesi level 1 olan gerçek kişiler (bireysel müşteri ve tüzel müşteri adına işlem yapan yetkili kişi) için kara liste/sanction kontrolleri gerçekleştirilir. Taramada hit oluşursa işlem OnHold statüsüne, kişi Blocked statüsüne alınır ve işlem akışı durdurulur. Sistem otomatik olarak KYC Yönetimi üzerinde inceleme kaydı açar ve işlem ancak uyum görevlisi onayı ile devam ettirilebilir, aksi halde reddedilir.

- İşlem tamamlanırken mükerrer ödeme riskine karşı idempotency kontrolü uygulanır; aynı İşlem Referans No ile tekrar deneme yapılırsa sistem “İşlem daha önce başlatılmış/tamamlanmış” uyarısı verir ve ikinci ödeme yaratmaz.

&nbsp;

105.# Para Transferi

- Müşteri No veya Kimlik No / VKN kullanarak işlemi başlatan (Gönderen) müşteri sorgulanır. Ekran para transfer işlemini Gönderen müşteri üzerinden yürütür; ekrandaki müşteri bilgileri gönderene aittir.

- Müşteri No veya Kimlik No kullanarak Gönderen sorgulanır. Eğer aktif bir bireysel müşteri tanımı varsa ve asgari kyc level 1 ise müşterinin kimlik belgesinin ön ve arka yüzünün taranıp sisteme eklenmesi beklenir. Kimlik Ülkesi / Uyruğu (combobox – default TUR), Kimlik Tipi (ENUM: identity_document), Doğum Tarihi, Kimlik Belgesi Ön, Kimlik Belgesi Arka alanları görünür olur. Kimlik Ülkesi = TUR ise Kimlik Tipi = IdentityCard olmak zorundadır ve değiştirilemez. Kimlik Belgesi Ön ve Kimlik Belgesi Arka alanlarının yanında Belge Yükle butonu yer alır; buton, taranmış kimliğin yüklenmesini sağlar. Belge Yükleme Modal’ında Belge Kategorisi ve Belge Türü alanı yer almaz; servis tarafında Kimlik Tipi değeri ile otomatik doldurulur ve sisteme Belge Kategorisi = Identity olarak kaydedilir. Taranmış kimlik OCR ile işlenerek sistemdeki kişi bilgileri ile karşılaştırılır, KPS kontrolü yapılmaz.

- Müşteri No veya Kimlik No kullanarak Gönderen sorgulanır. Eğer aktif bir tüzel müşteri tanımı varsa ve kyc status Approved ise Yetkili Kişi Kimlik No alanı görünür olur (Müşteri No veya Kimlik No / VKN’den sonra, İşlem Referans No’dan önce). Girilen kişinin gerçekten firma adına para transfer yetkisinin bulunup bulunmadığı kontrol edilir. Eğer yetkisi varsa bir üst maddedeki süreç birebir aynı şekilde işletilir. Eğer tüzel kişinin eksik veya süresi geçmiş belgesi var ve bundan dolayı status'u Active değilse "İşleminizin devam etmesi için müşteri belgelerindeki eksiklikler tamamlanmalıdır. Eksik belgeler: XXX, YYY."  uyarısı verilir. Uyarı mesajında Belge Ekle ve Tamam butonları yer alır. Belge Ekle butonu tetiklenirse Belge Yükleme modal'ı açılır. Yüklenmesi gereken tüm belgeler için ayrı birer panel olur.

- Müşteri No veya Kimlik No kullanarak müşteri sorgulanır. Eğer bir müşteri tanımı yoksa veya eksik bilgi veya belge tamamlanması gerekiyorsa (status: Incomplete or Incorrect Information veya Missing Documents) bir messagebox ile "Müşteri bilgi ve belgelerindeki eksikliklerin tamamlanması için Yeni Müşteri Kaydı ekranına yönlendiriliyorsunuz." uyarısı verilir. Kullanıcının onayı sonrası Yeni Müşteri Kaydı ekranı modal olarak açılır veya ekrana yönlendirme sağlanır; kayıt tamamlandığında kullanıcı aynı Para Transfer ekranına geri döner ve sorgu sonucu otomatik yenilenir. Müşteri tanımı yapılırken kimlik belgesi yüklendiği için geri dönüldüğünde kimlik belgesi yükleme alanları görünmez.

- Gönderen sorgulaması sonrasında gelen uyarılar sayfanın en üstünde uyarı mesajı (örneğin önemli uyarılar pembe arka fon üzerine bordo renkli) olarak sıralanır. Örnek uyarı: "Bu hesap daha önce kimlik dolandırıcılığına maruz kaldı, lütfen ödeme yaparken dikkatli olun.", "Bu hesap inceleme altındadır, para çekme blokesini kaldırmak için lütfen genel merkezi arayınız."

- Şüpheli İşlem Kontrolü (Checkbox) ticklenirse checkbox’da küçük bir bilgilendirme kutusu açılır: "Sadece şüpheli bulduğunuz işlemler için bu kutucuğu işaretleyiniz."

- Belge Yükleme modalında Ekle ve İptal butonları bulunur. Form panelinde; Belge Kategorisi (ENUM: document_category), Belge Türü (combobox – belge kategorisi için tanımlanmış belge türleri), Geçerlilik Süresi (valid_from – valid_until şeklinde iki tarih girişi yapılabilir) ve Dosya (Browse) alanları yer alır.

- Temsilci kanalından cüzdandan para transferi yapılamaz; cüzdandan transfer yalnızca self servis kanallar üzerinden gerçekleştirilebilir.

- UI’da alt akışlar "Kendi Cüzdanına / Banka / Kişiye / Yurt dışı" olarak ayrışsa da sistem tarafında tüm transferler tek bir "transaction" kaydı üzerinden yönetilir; farklılıklar transaction_type ve ilgili alanlar (IBAN, hedef ülke, hedef para birimi vb.) ile belirlenir. Bu yaklaşım izleme/raporlama, muhasebe entegrasyonu, onay havuzu ve DMS ilişkilendirmelerini sadeleştirir.

- Transfer başlatılmadan önce, KYC seviyesi en fazla level 1 olan gerçek kişiler (gönderen ve alıcıda, bireysel müşteri ve tüzel müşteri adına işlem yapan yetkili kişi) için kara liste/sanction kontrolleri gerçekleştirilir. Taramada hit oluşursa işlem OnHold statüsüne, kişi Blocked statüsüne alınır ve işlem akışı durdurulur. Gönderen hit almışsa sistem otomatik olarak KYC Yönetimi üzerinde inceleme kaydı açar ve işlem ancak uyum görevlisi onayı ile devam ettirilebilir, aksi halde reddedilir. Gönderen hit almamış fakat alıcı almışsa sistem otomatik olarak "İlave Bilgi Toplama" modal’ını açar. Bireysel Müşteri: Kimlik Ülkesi / Uyruğu (combobox – default TUR), Kimlik Tipi (ENUM: identity_document), Doğum Tarihi; Tüzel Müşteri: Unvan, Vergi Dairesi, Ticaret Sicil No. Ek bilgilerle alıcı için tarama otomatik yeniden çalışır; tarama sonucu hit kalkarsa işlem kaldığı yerden devam eder, hit devam ederse sistem otomatik olarak KYC Yönetimi üzerinde inceleme kaydı açar ve işlem ancak uyum görevlisi onayı ile devam ettirilebilir, aksi halde reddedilir.

- İşlem tamamlanırken mükerrer işlem riskine karşı idempotency kontrolü uygulanır; aynı istemci referansı ile tekrar deneme yapılırsa sistem “İşlem daha önce başlatılmış/tamamlanmış” uyarısı verir ve ikinci kayıt/çıkış yaratmaz (istemci referansı yoksa sistem kendi referansını üretir).

106.## Kendi Cüzdanına

- Gönderen Müşteri No veya Kimlik No / VKN, Para Birimi, Tutar, Cüzdan Numarası (combobox – Müşteri No ve para birimi doldurulduğunda otomatik dolar, değiştirilemez), Şüpheli İşlem Kontrolü (Checkbox).

- Hedef Cüzdan aynı müşteriye ait olmalıdır.

- Ücret ve Komisyonlar: Tutar (min_amount-max_amount şeklinde yazılır, max_amount bir sonraki dilimin min_amount’udur), Sabit Ücret, Oransal Ücret, Para Birimi, Kampanya Geçerli Tarih (Başlangıç Tarihi-Bitiş Tarihi şeklinde yazılır) kolonlarının olduğu, müşteriye özel kendi cüzdanına para transfer ücret ve komisyonların listelendiği bir tablo.

107.## Banka Hesabına

- Gönderen Müşteri No veya Kimlik No / VKN, Alıcı Adı ve Soyadı / Unvanı, Alıcı Telefon, Alıcı E-posta, IBAN, Para Birimi, Tutar, Ödeme Türü (ENUM: payment_purpose), İşlem Açıklaması, Şüpheli İşlem Kontrolü (Checkbox).

- IBAN TR ile başlamıyorsa yurt dışı akışına yönlendirilir.

- Ücret ve Komisyonlar: Tutar (min_amount-max_amount şeklinde yazılır, max_amount bir sonraki dilimin min_amount’udur), Sabit Ücret, Oransal Ücret, Para Birimi, Kampanya Geçerli Tarih (Başlangıç Tarihi-Bitiş Tarihi şeklinde yazılır) kolonlarının olduğu, müşteriye özel banka hesabına para transfer ücret ve komisyonların listelendiği bir tablo.

108.## Kişiye

- Gönderen Müşteri No veya Kimlik No / VKN, Alıcı Adı ve Soyadı / Unvanı, Alıcı Müşteri No veya Kimlik No (opsiyonel), Alıcı Telefon, Alıcı E-posta, Para Birimi, Tutar, Ödeme Türü (ENUM: payment_purpose), İşlem Açıklaması, Şüpheli İşlem Kontrolü (Checkbox).

- Ücret ve Komisyonlar: Tutar (min_amount-max_amount şeklinde yazılır, max_amount bir sonraki dilimin min_amount’udur), Sabit Ücret, Oransal Ücret, Para Birimi, Kampanya Geçerli Tarih (Başlangıç Tarihi-Bitiş Tarihi şeklinde yazılır) kolonlarının olduğu, müşteriye özel kişiye para transfer ücret ve komisyonların listelendiği bir tablo.

- Alıcı Kimlik No / VKN girildiyse sistem alıcının kayıtlı müşteri olup olmadığını kontrol eder. Alıcı kayıtlı ise alıcı bilgileri maskeli olarak gösterilir ve işlem "müşteriye transfer" olarak ilerler. Alıcı kayıtlı değilse sistem alıcı için kayıt oluşturur ve fonu alıcının CustomerTransactional cüzdanına aktarır (kullanıma kapalı). Müşteri kabulü tamamlanana kadar fon alıcı tarafından kullanılamaz.

109.## Yurt Dışına

- Gönderen Müşteri No veya Kimlik No / VKN, Alıcı Adı ve Soyadı / Unvanı, Alıcı Ülkesi, Alıcı Telefon, Alıcı E-posta, Kaynak Para Birimi, Gönderilecek Tutar, Hedef Para Birimi, Ödeme Türü (ENUM: payment_purpose), İşlem Açıklaması, Şüpheli İşlem Kontrolü (Checkbox).

- Dönüşüm Kuru (Kaynak Para Birimi ve Hedef Para Birimi girildiğinde otomatik doldurulur), Alıcının Alacağı Net Tutar (Kaynak Para Birimi, Hedef Para Birimi ve Gönderilecek Tutar otomatik doldurulur). "Bu kur X saniye geçerlidir." – X bilgisi parametreden alınır. Kur süresi dolarsa kullanıcıya uyarı verilerek kur otomatik yenilenir ve net tutar yeniden hesaplanır.

- Yurt dışı alıcı ülke bilgisine göre riskli ülke/ülke kısıtları uygulanır; gerekli ise işlem onay havuzuna düşürülür veya işlem başlatılamaz (kural/limit parametrelerine göre).

- Ücret ve Komisyonlar: Tutar (min_amount-max_amount şeklinde yazılır, max_amount bir sonraki dilimin min_amount’udur), Sabit Ücret, Oransal Ücret, Para Birimi, Kampanya Geçerli Tarih (Başlangıç Tarihi-Bitiş Tarihi şeklinde yazılır) kolonlarının olduğu, müşteriye özel yurt dışına para transfer ücret ve komisyonların listelendiği bir tablo.

&nbsp;

110.# İşlem Hareketleri

- İşlem Numarası, İşlem Tarihi, Gönderen Adı ve Soyadı / Unvanı, Alıcı Adı ve Soyadı / Unvanı, IBAN, İşlem Türü, Para Birimi, Tutar, Açıklama, Referans Numarası, Status, Temsilci Rolü (Gönderen Temsilcisi / Alıcı Temsilcisi), Toplam Gelir kolonlarının olduğu, temsilcinin paydaşı olduğu tüm işlemlerinin listelendiği tablo. Default olarak içinde bulunulan güne ait işlemler gelir. Toplam Gelir temsilcinin o işlemden elde ettiği toplam TRY cinsinden geliri ifade eder.

- İşlem detayı için İşlem Onay sayfası değiştirilemez ve butonları olmayan şekilde getirilir.

- Hesap Hareketleri Paneli, İşlem Numarası, İşlem Türü, İşlem Tarihi Aralığı, Tutar Aralığı (min–max), Gönderen, Alıcı, Temsilci Rolü alanlarıyla filtrelenebilir.

&nbsp;

111.# Dilek, Şikâyet ve Öneriler

- Butonlar: Dosya Ekle, Gönder, Temizle

- Talep Sahibi (Kendisi, Müşteri – Müşteri seçilirse Müşteri No giriş alanı görülür hale gelir), Konu, Talep Tipi (ENUM: complaint_type), Talep Detayı, Notlar

- Talebe dair temsilcinin yorumları Notlar alanında kayıt altına alınır. Talep Konusu ve oluşturulan Talep Numarası SMS üzerinden, talebin tüm detayları E-posta üzerinden müşteriye iletilir.

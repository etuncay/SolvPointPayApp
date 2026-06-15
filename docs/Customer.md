MÜŞTERİ

&nbsp;

&nbsp;

1. # Ana Sayfa

- Bakiye panelinde tüm cüzdanlar listelenir; ancak CustomerPersistent dışındaki cüzdanlar "Sadece görüntüleme" olarak etiketlenir ve bu cüzdanlarda para gönder/para al/para çekme gibi aksiyonlar kapalıdır. Müşterinin sadece CustomerPersistent cüzdanları uygulama üzerinden yönetilebilir. Diğer cüzdanlar ile ilgili sadece bilgilendirme sağlanabilir. CustomerPersistent cüzdanı bulunmayan müşteriler uygulamaya giriş yapamaz.

- Müşteriye gösterilecek uyarılar sayfanın en üstünde (örneğin pembe arka fon üzerine bordo renkli) olarak sıralanır.

- Son başarılı girişten sonra başarısız erişim teşebbüsü tespit edilmesi halinde kullanıcıya bilgilendirme mesajı gösterilir.

- Bakiye Paneli: Tutar, Para Birimi bilgileri tüm hesapların listelendiği tablo.

- Hesap Hareketleri Paneli: İşlem Numarası, İşlem Tarihi, Gönderen Adı ve Soyadı / Unvanı, Alıcı Adı ve Soyadı / Unvanı, IBAN, İşlem Türü, Tutar, Para Birimi, Açıklama, Referans Numarası, Status kolonlarının olduğu, müşterinin son 7 hesap hareketinin işlemlerinin listelendiği tablo.

**İşlem Onay**

- Menüde gözükmez ancak tüm para çekme ve para transferlerinde işlem sonlanmadan önce işlem özetini sunan İşlem Onay ekranı gösterilir. Ayrıca işlem listeleme ekranları da İşlem Detay sayfası olarak da bu sayfaya yönlenir.

- Butonlar: Onayla, Düzenle, İptal Et, Geri Dön, Dekont İndir. Onayla, Düzenle, İptal Et butonları sadece Onay modunda görünür, Geri Dön, Dekont İndir butonları sadece Detay modunda görünür.

- Gönderen: Adı ve Soyadı / Unvanı, Müşteri No, Cüzdan Numarası, Yetkili Kişi No (Müşteri tüzel ise gösterilir), Yetkili Kişi Adı ve Soyadı (Müşteri tüzel ise gösterilir)

- Alıcı: Adı ve Soyadı / Unvanı, Müşteri No, Cüzdan Numarası, Telefon, E-posta, IBAN, Ülke

- Referans: İşlem Referans No, Yurt Dışı Referans No

- İşlem ve Tutarlar: Gönderilen Tutar, Para Birimi, Toplam Ücret, Ödenen Toplam Tutar (Gönderilen Tutar + Toplam Ücret), Çekilen Tutar, Para Birimi, Döviz Kuru. Kaynak Para Birimi ve Hedef Para Birimi yalnızca döviz/çapraz para birimli akışlarda gösterilir; diğer akışlarda Para Birimi olarak tek alan gösterilir.

- İşlem Detayları: Para Gönderme Tarihi, Para Çekme Tarihi, İşlem Türü (ENUM: transaction_type), Ödeme Türü (ENUM: payment_purpose), İşlem Açıklaması.

- Güvenlik: Onay Kodu (OTP)

- Sadece Güvenlik panelindeki alanlar değiştirilebilir, diğer paneller değiştirilemez. Null alanlar gösterilmez.

- Onay modunda, Düzenle butonu ile kullanıcı işlem giriş ekranına döner, ekranda işleme dair tüm bilgiler dolu getirilir. Detay Modu’nda, Geri Dön ile kullanıcı işlem listeleme ekranına, bu ekran açılmadan önceki filtreleri korunmuş şekilde döner.

- Onay modunda Onayla butonu tetiklendiğinde, herhangi bir iş kesici kontrole takılmamasına rağmen işlem Risk Seviyesi = Kritik olarak hesaplanmışsa kullanıcıya “İşlem Beyanı” modali gösterilir ve aşağıdaki alanlar talep edilir. Bu modal, işlemi bloklamaz; ancak girilen değerler beyan (declared) olarak işlem kaydına immutable biçimde yazılır, risk izleme/raporlama ve gerekiyorsa sonradan yapılacak kontroller için kullanılır. Aynı gönderen-alıcıya yönelik işlemlerde son X gün (X parametreden alınır) içinde alınmış beyan varsa alanlar otomatik dolu gelir; kullanıcı isterse günceller. Seçimler Unknown/Other olduğunda kısa açıklama zorunludur.

- İşlem onaylandıktan sonra “İşlem başarıyla tamamlandı!” sayfasına yönlendirilir; bu sayfadan dekont indirilebilir. Detay Modu’nda dekont indirme her zaman mümkündür; dekont üretimi tamamlanmamış işlemlerde buton pasif olur.

**Ayarlar**

- Sağ üstte gözükür, menüde yer almaz.

- Dekontlarım: İşlem No, Tarih, Tutar, Para Birimi alanları ile listelenir; her satırdan dekont indirilebilir.

- Parola: Eski Parola, Yeni Parola, Yeni Parola (Tekrar), Hangi Sıklıkla Güncellensin (Combobox: 1 Ay, 3 Ay, 6 Ay)

- Karşılama Mesajı: Phishing önlemi olarak kullanıcıya özgü karşılama mesajı

- İletişim Bilgileri: İletişim Adresi, Asıl Adres (checkbox), Actions (Tekrar Gönder, Düzenle, Sil) kolonlarını içeren ve E-posta ve Telefon bilgilerinin tutulduğu tablo.

- Adresler

- Kişisel Bilgiler: Toplam Aylık Gelirim, Eğitim Durumum (ENUM: education_level), Çalışma Durumum (ENUM: employment_category), Mesleğim (ENUM: employment_occupation), İş Yerim.

- Mobil Bildirim Tercihleri: Para Girişi, Para Çıkışı, Bakiye (Bakiye belirlenen tutarın altına inerse bildirim gönder). Sayfanın altına not olarak: Transfer/Talimat hatırlatma ve işlem sonuçları ile güvenlik politikamız gereği yaptığımız bildirimler.

- Para Transfer Limitleri: Günlük Transfer Limiti, İnternet Günlük Transfer Limiti

- Uygulama Ayarları: Dil Tercihi, Tema (Açık, Koyu), Metin Boyutu (Küçük, Standard, Büyük, Ekstra Büyük)

- Hatalı Girişler

- İletişim Bilgileri sayfasında, Tekrar Gönder aksiyonu, doğrulanmış satırlarda tetiklenirse kullanıcıya uyarı gösterilir: "İletişim adresi zaten doğrulandı!". Birden fazla e-posta ve telefon bilgisi eklenebilir. Telefonlardan 1 tanesi ve e-posta adreslerinden 1 tanesi asıl iletişim kanalı seçilmelidir. Kullanıcı bir satırı Asıl seçtiğinde, aynı kanaldaki önceki asıl otomatik olarak kaldırılır; sistem eski asıl adrese bilgilendirme gönderir: "Asıl iletişim adresiniz değiştirildi!" ve kullanıcıya UI’da bilgi mesajı gösterir. Kullanıcı yeni satır ekleyebilir, mevcut satırları düzenleyebilir veya silebilir. Silme ve iletişim adresinin güncellenmesi (adres alanı değişimi) işlemlerinde sistem, değişiklik öncesi (eski) adrese bilgilendirme gönderir: "İletişim adresiniz güncellendi!". (Asıl değişikliğinde ayrıca bilgilendirme zaten gönderilir.) Yeni satır ekleme esnasında tablonun altında yeni ve boş bir satır açılır; satır güncellemede mevcut bilgiler değiştirilebilir şekilde gösterilir; her ikisinde de satırın en sağında Kaydet ve İptal ikonları yer alır. Ekleme ve adres değişikliği içeren güncelleme esnasında yeni irtibat bilgileri doğrulanmalıdır. E-posta adresi doğrulama linki ile, Telefon numarası OTP ile doğrulanır. Kullanıcı girişi tamamladıktan sonra ilgili satırın sağında yer alan Kaydet ikonunu tetikler. Satır Telefon ise Doğrulama Modal’ı açılır (Doğrulama Kodu alanı ve Tekrar Gönder, Doğrula, İptal butonları). Doğrulama başarılı oluncaya veya kullanıcı İptal’e basıncaya kadar modal kapanmaz. İptal’e basılırsa modal kapanır ve satır Kaydet öncesi haline döner. Sabit telefonlar doğrulanmaz ve Asıl seçilemez. Tekrar Gönderme rate limit ile kısıtlanır (saniyede 1 adet, bir adres için 5 adet)

&nbsp;

112.# Hesap Hareketleri

- Bakiye Paneli: Tutar, Para Birimi bilgileri tüm hesapların listelendiği tablo.

- Hesap Hareketleri Paneli: İşlem Numarası, İşlem Tarihi, İşlem Yönü (ENUM: transaction_direction), Karşı Taraf No, Karşı Taraf Adı ve Soyadı / Unvanı, Karşı Hesap (Cüzdan No / IBAN), Referans No, İşlem Türü (ENUM: transaction_type), Para Birimi, Tutar, İşlem Sonrası Bakiye, Status (ENUM: transaction_status), Açıklama kolonlarının olduğu, müşterinin tüm işlemlerinin listelendiği tablo.

- Hesap Hareketleri Paneli, İşlem Numarası, İşlem Yönü, İşlem Türü, İşlem Tarihi Aralığı, Tutar Aralığı (min–max), Karşı Taraf (birebir eşitlik aranmaz, ismin içermesi yeterlidir) alanlarıyla filtrelenebilir.

- Satıra tıklandığında İşlem Detay sayfası açılır.

- İşlem Yönü, işlem tipine göre değil işlemin bakiyeye etkisine göre belirlenir; bakiye artıyorsa Para Girişi, azalıyorsa Para Çıkışı olarak gösterilir.

- Tutar alanı her zaman pozitif değer olarak gösterilir; artı/eksi etkisi İşlem Yönü ile ifade edilir. İşlem Sonrası Bakiye, seçili cüzdanın işlem sonrası bakiyesini gösterir ve gönderen/alıcı ayrımı yapılmaksızın tamamen bu cüzdan perspektifidir.

- Varsayılan sıralama İşlem Tarihi’ne göre yeniden eskiye olacak şekilde yapılır; kullanıcı kolon bazlı sıralama yapabilir.

&nbsp;

113.# Para Yükle

- Banka Hesabından (IBAN) nasıl para yüklenileceği açıklanır. Müşteri uygulamasından para yüklenemez.

&nbsp;

114.# Para Gönder

115.## Kayıtlı Kişilerim

- Kayıt Adı, Adı ve Soyadı / Unvanı, Ülkesi, Telefon, E-posta alanlarının olduğu kayıtlı kişilerin listelendiği tablo.

- Butonlar: Gönder, Değiştir, Kaydı Sil

- Gönder butonu tıklandığında yurt içi veya dışı transfer olma durumuna bağlı olarak Yurt İçine veya Yurt Dışına sayfasına, tutar ve para birimi dışındaki alanlar doldurulmuş ve Alıcı bilgileri haricindeki alanlar değiştirilebilir olacak şekilde yönlendirilir.

- Sil butonu tıklandığında onay sonrasında kayıt silinir.

- Değiştir butonu ile şu alanların olduğu bir form sayfası açılır: Müşteri No, Adı ve Soyadı / Unvanı, Ülkesi, Telefon, E-posta, Ödeme Türü (ENUM: payment_purpose), İşlem Açıklaması.

116.## Yurt İçine

- Alıcı Adı ve Soyadı / Unvanı, Alıcı Telefon, Alıcı E-posta, Para Birimi, Tutar, Ödeme Türü (ENUM: payment_purpose), İşlem Açıklaması, Kişiyi Kayıtlı Kişilerime Kaydet (checkbox).

- Ücret ve Komisyonlar: Tutar (min_amount-max_amount şeklinde yazılır, max_amount bir sonraki dilimin min_amount’udur), Sabit Ücret, Oransal Ücret, Para Birimi, Kampanya Geçerli Tarih (Başlangıç Tarihi-Bitiş Tarihi şeklinde yazılır) kolonlarının olduğu, müşteriye özel kişiye para transfer ücret ve komisyonların listelendiği bir tablo.

117.## Yurt Dışına

- Alıcı Adı ve Soyadı / Unvanı, Alıcı Ülkesi, Alıcı Telefon, Alıcı E-posta, Kaynak Para Birimi, Gönderilecek Tutar, Hedef Para Birimi, Ödeme Türü (ENUM: payment_purpose), İşlem Açıklaması, Kişiyi Kayıtlı Kişilerime Kaydet (checkbox).

- Dönüşüm Kuru (Kaynak Para Birimi ve Hedef Para Birimi girildiğinde otomatik doldurulur), Alıcının Alacağı Net Tutar (Kaynak Para Birimi, Hedef Para Birimi ve Gönderilecek Tutar otomatik doldurulur)

- Ücret ve Komisyonlar: Tutar (min_amount-max_amount şeklinde yazılır, max_amount bir sonraki dilimin min_amount’udur), Sabit Ücret, Oransal Ücret, Para Birimi, Kampanya Geçerli Tarih (Başlangıç Tarihi-Bitiş Tarihi şeklinde yazılır) kolonlarının olduğu, müşteriye özel yurt dışına para transfer ücret ve komisyonların listelendiği bir tablo.

&nbsp;

118.# Para Al

- IBAN (combobox), Cüzdan (IBAN seçimi sonrasında para birimi tutan CustomerPersistent cüzdan otomatik gelir, değiştirilemez), Bakiye (otomatik gelir, değiştirilemez), Para Birimi (IBAN seçimi sonrasında otomatik dolar, değiştirilemez), Tutar.

- Bu ekran, müşterinin kendi ödeme hesabından yalnızca kendisine ait IBAN’a para göndererek bakiye yüklemesi amacıyla kullanılır. Lisans kısıtları gereği müşteri bu ekrandan üçüncü kişilere ait IBAN’lara para gönderemez.

- IBAN (combobox) alanı yalnızca müşteriye ait IBAN’ları listeler, başka IBAN girişi yapılamaz.

- Tutar alanı müşterinin kendi hesabından göndereceği tutarı ifade eder. Para Birimi IBAN seçiminden otomatik gelir ve değiştirilemez.

&nbsp;

119.# Dilek, Şikâyet ve Öneriler

- Butonlar: Dosya Ekle, Gönder, Temizle

- Konu, İletişim Sebebi (ENUM: complaint_type), Mesaj

- Aydınlatma metni’ni okudum. Onay veriyorum. (checkbox) Hemen altına not: "Bu onay, talep/şikâyetin işlenmesi için bilgilendirme teyididir; pazarlama vb. amaçlı ayrı rıza burada alınmaz."

- Aydınlatma metni checkbox’ı işaretlenmeden Gönder butonu pasif/disable olur.

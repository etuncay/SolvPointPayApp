APPENDIX

&nbsp;

&nbsp;

1. # Uygulama Mimarisi

- Uygulama katmanları (önyüz, ara katmanlar, veritabanı katmanı) arasındaki kimlik doğrulama için kullanılan user ve password bilgilerinin herhangi bir kod içerisinde açıkça yer almaması gerekir.

- Kodların düzensiz ve şekilsel olarak kötü bir şekilde yazılmış olması, kodun derleme dışı bırakılmasını sağlayan yorumlar içermesi gibi ilk bakışta fark edilebilen şekilsel hususlar genellikle kodlarda çeşitli sorunların bulunduğuna işaret eder ve kodların biraz daha detaylı incelenmesini gerektirir.

- Teknik olarak mümkün olan hallerde negatif filtreleme (black-listing) yerine pozitif filtreleme (white-listing) metodu kullanılmalı ve uygulamanın belirlenmiş listenin dışındaki her şeyi reddetmesi sağlanmalıdır.

- Mümkün olan hallerde açık (open) standartlar kullanılmalıdır. Böylelikle hem uygulamanın diğer uygulamalar ile daha uyumlu çalışabilir olması sağlanmakta, hem de açık standartların güvenliğinin endüstri tarafından irdelenmiş olması dolayısıyla güvenliğe dair daha fazla güvence oluşturmaktadır.

- Uygulamanın kullanıcılara sunduğu hata mesajlarının sisteme dair kritik veya potansiyel bir saldırgan için yararlı olabilecek herhangi bir bilgi (örneğin dahili yol, dosya adları, veriler gibi) içermemesi gerekmektedir. Sistem hatalarının hiçbirisi kullanıcıya dönülmemelidir. Uygulamanın kodlarında, bir değer dönen tüm fonksiyon ve metodlar için uygun hata kontrolleri tesis edilmelidir. Jenerik bir hata prosedürü tanımlı olmalı, uygulamaya gelen kötü biçimlendirilmiş sorgu ve taleplerin tamamında bu prosedür çağrılmalı ve uygulamanın kendisi, web/uygulama sunucusu ve veritabanı tarafından üretilen tüm hata mesajlarının yerine jenerik hata mesajı + hata kodu gösterilmelidir; correlation_id backend loglarında üretilip saklanmalıdır.

- Eğer bir veri birden fazla veritabanında veya sistemde tutulmakta ise bu verideki uyumsuzlukların tespiti önemlidir. Örneğin ürün bazında takip edilen envanter veritabanlarından elde edilen müşteri hesabı bakiyelerinin toplamları ile muhasebe veritabanlarında tutulan mizandaki ilgili hesap bakiyelerinin eşit olması beklenir. Bir önceki ayın mizanı ile ay içerisinde kesilen fişlerin toplanması ile ay sonu mizanının elde edilmesi beklenir. Bu gibi yakından ilişkili verilerin uyumluluğunun sağlanması da önem arz eder.

- Gelen transaction verisi, history dosyaları, trace dosyaları, veritabanı, loglar (hem uygulamanın hem de application/web server'ın transaction, history, debug, error logları) üzerinde hassas veri (ör: parola, kart numarası, anne kızlık soyadı gibi) ya bulunmamalı ya da şifreli, hashlenmiş veya maskeli olarak tutulmalıdır.

&nbsp;

120.# Kimlik Doğrulama

- Kimlik doğrulamadan geçilmeksizin uygulamanın herhangi bir arayüzüne veya bölümüne erişilememelidir.

- Kimlik doğrulama verileri şifresiz iletilmemeli ve saklanmamalıdır. Parola, PIN gibi bilgiler ile birlikte, kimlik doğrulama için kullanılıyorsa anne kızlık soyadı gibi bilgiler de şifreli iletilmeli ve saklanmalıdır.

- Oturum (session) token’ları korunmalıdır. Bu kapsamda;

- Belirli bir süre işlem yapılmayan oturumlar otomatik olarak sonlanmalıdır.

- Kullanılan session id’lerinin, token’ların veya oturumların ömrü tanımlı olmalı ve kullanıcı parola bilgileri ve diğer kritik veriler açık metin olarak tutulmamalıdır.

- Replay saldırılarına karşı kontroller bulunmalıdır.

- Yazılımdaki tüm durum değişikliklerinde session bilgisi kontrol edilmelidir. Sadece session id değil, oturum objesindeki tüm değişkenler kontrol edilmelidir.

- Session id’si URL’de yazmamalıdır.

- JWT kullanılırsa, "none" algoritmasına verilen destek iptal edilerek JWT'nin doğrulanması sağlanmalıdır. Güncel bir şifreleme algoritması uygulanmalıdır.

- Kimlik doğrulama akışında access token yanında refresh token kullanılır. Logout, cihaz kaybı/çalıntı şüphesi veya güvenlik ihlali durumlarında refresh token’lar sunucu tarafında revoke edilerek ilgili oturumlar anında sonlandırılır. Refresh token’lar tek kullanımlık/rotasyonlu (rotation) tasarlanır; her yenilemede yeni refresh token üretilir, önceki token geçersiz kılınır.

- Kanal bazında (Backofis/Temsilci/Müşteri) aynı kullanıcı için “tek oturum” olabilir, yeni girişte eski oturum revoke edilir.

- Yazılım geliştiricilere kimlik doğrulama amaçlı standart bir kod parçası veya servis sunulmalı, yazılım geliştiricilerinin kimlik doğrulaması yapılacak alanlarda sunulan kod parçasını veya servisi kullanımı zorunlu kılınmalı ve bunun dışındaki custom kimlik doğrulama mekanizmaları engellenmelidir.

- Uygulamanın veritabanlarına ve diğer sistemlere erişmekte kullandığı servis hesaplarının yetkileri en az yetki prensibi ile uyumlu olmalı ve kimlik doğrulama verileri (kullanıcı adı, parola gibi) şifresiz iletilmemeli ve saklanmamalıdır.

&nbsp;

121.# Yetkilendirme

- Yetkilendirme, uygulamadan ayrılmalıdır (örneğin, ayrı bir hizmet veya yan sepet (sidecar) olarak uygulanması).

- Yetkili olmadıkları ekranların kullanıcılardan gizlenmesi tek başına yetkilendirme için yeterli görülmemeli, bütün işlemler yetkilendirme matrisinden geçirilmeli ve işlemlerin sadece yetkili kullanıcılarca gerçekleştirilmesi sağlanmalıdır. Tüm taleplerde talep sahibinin yetkisinin bulunup bulunmadığı kontrol edilmelidir. Verinin güvenliğini sağlamak için sadece gizlenmesi tek başına bir güvenlik mekanizması olarak değerlendirilmemelidir.

- Uygulama, hangi işlemin (işlem tipi, tutar, işlemi gerçekleştiren ile müşteri arasındaki ilişki gibi), nasıl bir onay mekanizması ile kimin onayına sunulacağına dair granüler tanımlamalalara olanak tanımalı ve işlemin onaylanması halinde daha alt kullanıcılarca değiştirilmesini önleyecek şekilde veriyi kilitlemelidir.

- Exception yetkilerin (personelin izne ayrılması halinde vekalet, geçici personel, birden fazla şubeye destek olabilen personel, tanımlı rollerden daha fazla yetkiye ihtiyaç duyan personel gibi) nasıl verildiği incelenir. Erişimin görevler ayrılığı ve en az yetki prensipleri ile çelişmemesi ve gerekli onayları içermesi gerekir.

- Kullanıcılar kendilerine tahsis edilen yetkileri arttıramamalıdır.

&nbsp;

122.# Girdi Kontrolleri

- Uygulamaya gelen tüm veriler işlenmeden, sistem dosyalarına veya veritabanlarına yazılmadan önce verinin istenen biçimde olup olmadığı kontrol edilmeli, geçerli olmayan veri doğrudan reddedilmelidir. Bu kapsamda pozitif filtreleme (white-listing) metodu kullanılmalı ve uygulamanın belirlenmiş formattaki veriler haricindeki tüm girdileri reddetmesi sağlanmalıdır. Girdi alanlarının yanı sıra, kötü niyetli kişiler tarafından değişikliğe uğratılabilecek http header, gizlenmiş alanlar, combobox listeler gibi bileşenler de doğrulanmalıdır.

- Girdi kontrolleri sunucu tarafında da yapılmalıdır. Son kullanıcı tarafında gerçekleştirilen bir doğrulamanın sonucu, sunucuya iletilirken değişikliğe uğratılabilecektir.

- Girdi kontrolleri, uygulama mantığından ayrılmalı ve gözden geçirilebilecek bir biçimde belirtilmelidir.

- Uygulamanın girdi aldığı noktalar için asgari olarak, aşağıdaki kontroller (teknik olarak uygulanabilir olanları) tesis edilmelidir:

- Minimum ve maximum uzunluk (özellikle uzun girdiler için Denial of Service açığı oluşturmamak için giriş uzunluğu sınırlanmalıdır)

- Veri tipi ve izin verilen karakter seti (sadece sayı içermesi beklenen alanlar harf girdi kabul etmemelidir; tarih ve saat gibi alanlarda ya sadece doğru formatta girdi kabul edilmeli, ya da girdi doğru formata dönüştürülmelidir)

- Bir parametrenin girilmesinin zorunlu olup olmadığı, boş geçilmesine müsaade edilip edilmediği

- Sayı ise en küçük ve en büyük değer tanımlanmalı, tarih ise geçmiş tarihli işlem girilememeli

- Gerçek olabilirlik (örneğin bir günde max 24 saat, bir saatte max 60 dakika bulunabilir, daha büyük bir değer kabul edilmemelidir; içinde bulunulan tarihten öncesine vade tarihi verilemez)

- Mükerrerliğe izin verilip verilmediği (bir ürüne dair veritabanında kayıt varsa, aynı ürün kodu ile girdi kabul edilmemesi gibi)

- Bir alana girilebilecek tüm değerler sınırlı sayıda ise, söz konusu alana bu değerler haricinde bir değerin girdi olarak kabul edilmemesi

&nbsp;

123.# Kullanıcı Cihazlarında Tutulan Verilerin Güvenliği

Verinin kurcalanması veya sızması risklerinin azaltılması için son kullanıcının kontrolündeki bir cihazda kritik veri tutulmamalı veya teknik zorunluluk bulunan hallerde son kullanıcı tarafında tutulan kritik verinin kurcalanmaya ve sızmaya karşı güvenliği sağlanmalıdır. İnternete açık uygulamalar, cookie mekanizmasına ek olarak pluginler üzerinden (Adobe Flash (LSO - flash cookie), Microsoft Silverlight (veri Isolated Storage isimli sanal dosya sisteminde tutulur, uygulamanın kendi verisi üzerinde tam kontrolü vardır) ve Oracle Java gibi) ve HTML 5 veri saklama mekanizmaları ile son kullanıcı nezdinde veri tutabilmektedir.

- Eğer son kullanıcı nezdinde kritik (soft OTP üretilmesi için kullanılan çekirdek (seed), sayaç (counter), sayaç artış değeri (increment), PKI yapısı ile kimlik doğrulama için kullanılan anahtarlar gibi) veri tutuluyorsa, verinin şifreli tutulması veya verinin kritiklik seviyesine göre gizliliği sağlamaya yönelik ek güvenlik önlemlerinin alınması gerekmektedir. Ayrıca şifreli verinin açılması, anahtarların saklanması, şifresi çözülmüş kritik verinin gerekmesi halinde iletimi gibi aşamalarda güvenlik sağlanmalıdır. Şifre son kullanıcı nezdinde çözülüyorsa anahtarın nasıl saklandığı ve güvenliği temel sorun teşkil ederken, şifre sunucuda çözülüyorsa şifresiz verinin son kullanıcıya iletimi temel sorun teşkil eder.

- Son kullanıcı nezdinde tutulan verilerin ömrü tanımlı olmalı ve veriye olan ihtiyaç bittiğinde veri silinmelidir.

- Son kullanıcı nezdinde tutulan veriye güvenilmemelidir.

- Application logic sunucu tarafında yer almalı, istemci tarafında yer almamalıdır.

- Son kullanıcının değişikliğe uğratabileceği parametrelere (ör: URL parametreleri) dayanan güvenlik kontrollerinin ve istemci tarafında yapılan doğrulamaların ekstra bir güvenlik sağlamadığı varsayılmalıdır.

- Müşterinin telefonuna sahte bir uygulama yüklemesini önlemek için önlemler alınmalı ve mobil uygulamaların bütünlüğünün kontrol edilmesine yönelik kontroller tasarlanmalıdır.

- Mobil kanalda cihaz bağlama (device binding) uygulanır; hesap erişimleri cihaz kimliği ile ilişkilendirilir. Uygulama bütünlüğü için app attestation (imza bütünlüğü, root/jailbreak tespiti, debug/emülatör sinyalleri) kullanılır.

&nbsp;

124.# API Güvenliği

- Her iki tarafın birbirini doğruladığı bir kimlik doğrulama mekanizması (örneğin mTLS) uygulanmalıdır. İnaktif kimlik doğrulama tokenları veya API anahtarları, önceden tanımlanmış bir inaktivite süresinin ardından sonlandırılmalıdır. Kullanılmayan hesaplar kilitlenmelidir.

- Yetkilendirme, "En Az Yetki" ilkesine dayalı olarak verilir – iş için gerekli bir eylemi gerçekleştirmek için gereken minimum izinler ve HTTP yöntemleri kullanılmalıdır. Verilen bir yetkinin istemeden (kasıtsız) veya uygunsuz kullanımını önlemek için, herhangi bir API ile gerçekleştirilen erişim, kısıtlı izinlere dayalı olarak belirli yöntemlerle sınırlandırılmalıdır.

- API'nin kullanıcının veya hesabın çerezler aracılığıyla kimlik doğrulaması ve yetkilendirilmesini kullandığı durumlarda; bir CSRF (cross site request forgery) koruma mekanizması kullanılmalıdır.

- Her nesneye her erişim yetkilendirme açısından kontrol edilmelidir. Yetkilendirme kararları önbelleğe alınmamalıdır. Örneğin, yetkilendirme için JWT token'ları kullanılırken, Güvenli Olmayan Doğrudan Nesne Başvurusu (Insecure Direct Object Reference-IDOR) ve Bozuk Nesne Düzeyi Yetkilendirmesi (Broken Object Level Authorization-BOLA) gibi sorunlardan kaçınmak için API'DEKİ bir hesap adına gerçekleştirilen her eylem uygun ve sınırlı kapsamına göre yetkilendirilmelidir.

- API tarafından response olarak hassas veri dönülmesi ancak iş açısından gerekli ise mümkün olmalıdır.

- API'lerin kullanımına ilişkin limitler tanımlanmalı ve aşırı kullanımını önlemek için mekanizmalar uygulanmalıdır. Rate limit yalnız sistem geneli req/min değil; endpoint bazlı + kullanıcı bazlı + cihaz/IP bazlı tanımlanır. OTP/Doğrulama, “tekrar gönder”, belge yükleme, giriş denemeleri, arama/sorgu uçları gibi kötüye kullanıma açık endpoint’lerde daha sıkı limitler uygulanır. Kötüye kullanım halinde, limit aşımlarında geçici bloke (cooldown), artan bekleme (progressive delay) ve gerektiğinde captcha/step-up uygulanır. Limit ihlalleri audit/log’larda correlation_id ile izlenir.

- TLS kullanımı zorunlu kılınmalı ve yalnızca güçlü şifre paketlerine izin verilmelidir (kullanımdan kalkmış ve güvensiz şifre paketlerini iptal edilmelidir).

- Tüm API'lerde ve her bir API bileşeninde kritik olaylara dair yeterli detayda log oluşturan mekanizmalar bulunmalıdır.

- Geçersiz kimlik bilgileriyle kimlik doğrulamaya yönelik başarısız girişimler ve kötü amaçlı eylem girişiminde bulunan hesaplar, önceden tanımlanmış bir eşik sağlandığı takdirde kilitlenmelidir.

- Hem sunulan (publish) hem de tüketilen (consume) API'lerde bağlantı kurulabilecek noktalar belirli IP adresleri ile sınırlı olmalıdır.

&nbsp;

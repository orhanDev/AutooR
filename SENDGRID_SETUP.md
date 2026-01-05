

Bu rehber, AutooR projesinde SendGrid email servisini kurmak için adım adım talimatlar içerir.

SendGrid, güvenilir ve ölçeklenebilir bir email servisidir. Railway'de Gmail SMTP connection timeout sorunlarını çözmek için kullanılacaktır.

**Ücretsiz Tier:**
- Günde 100 email gönderme hakkı
- API tabanlı, SMTP sorunları yok
- Railway ile tam uyumlu

---

1. **SendGrid Web Sitesine Gidin:**
   - https://sendgrid.com adresine gidin
   - "Start for free" veya "Sign Up" butonuna tıklayın

2. **Hesap Oluşturun:**
   - Email adresinizi girin (`orhancodes@gmail.com`)
   - Şifre oluşturun
   - İsim ve şirket bilgilerinizi girin
   - "Create Account" butonuna tıklayın

3. **Email Doğrulama:**
   - Email'inize gelen doğrulama linkine tıklayın
   - Hesabınızı aktifleştirin

4. **Onboarding:**
   - SendGrid size birkaç soru soracak (hangi amaçla kullanacağınız, vb.)
   - "Skip" diyerek geçebilirsiniz veya doldurun

---

1. **SendGrid Dashboard'a Gidin:**
   - https://app.sendgrid.com adresine gidin
   - Giriş yapın

2. **Settings → API Keys:**
   - Sol menüden "Settings" → "API Keys" seçeneğine tıklayın
   - Veya direkt: https://app.sendgrid.com/settings/api_keys

3. **Create API Key:**
   - "Create API Key" butonuna tıklayın
   - **API Key Name:** `AutooR Production` yazın
   - **API Key Permissions:** "Full Access" seçin (veya sadece "Mail Send" seçebilirsiniz)
   - "Create & View" butonuna tıklayın

4. **API Key'i Kopyalayın:**
   - ⚠️ **ÖNEMLİ:** API Key sadece bir kez gösterilir!
   - API Key'i kopyalayın (örnek: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - Güvenli bir yere kaydedin

---

SendGrid'den email göndermek için bir "Sender" (gönderen) email adresi doğrulamanız gerekir.

1. **Settings → Sender Authentication:**
   - Sol menüden "Settings" → "Sender Authentication" seçeneğine tıklayın
   - "Verify a Single Sender" butonuna tıklayın

2. **Sender Bilgilerini Doldurun:**
   - **From Email Address:** `orhancodes@gmail.com` (veya göndermek istediğiniz email)
   - **From Name:** `AutooR`
   - **Reply To:** `orhancodes@gmail.com`
   - **Company Address:** Şirket adresiniz (gerekli)
   - **City:** Şehir
   - **State:** Eyalet/Bölge
   - **Country:** Ülke
   - "Create" butonuna tıklayın

3. **Email Doğrulama:**
   - SendGrid size bir doğrulama email'i gönderecek
   - Email'inizi kontrol edin ve doğrulama linkine tıklayın
   - Doğrulama tamamlandıktan sonra bu email adresinden email gönderebilirsiniz

Eğer kendi domain'iniz varsa (örnek: `autoor.com`), domain authentication yapabilirsiniz. Bu daha güvenilir ama daha karmaşık.

---

1. **Railway Dashboard'a Gidin:**
   - https://railway.app adresine gidin
   - AutooR projenize gidin

2. **AutooR Servisi → Variables Sekmesi:**
   - AutooR servisine tıklayın
   - "Variables" sekmesine gidin

3. **Yeni Environment Variables Ekleyin:**

   **a) EMAIL_PROVIDER:**
   - Name: `EMAIL_PROVIDER`
   - Value: `sendgrid`
   - "Add" butonuna tıklayın

   **b) EMAIL_HOST:**
   - Name: `EMAIL_HOST`
   - Value: `smtp.sendgrid.net`
   - "Add" butonuna tıklayın

   **c) EMAIL_PORT:**
   - Name: `EMAIL_PORT`
   - Value: `587`
   - "Add" butonuna tıklayın

   **d) EMAIL_USER:**
   - Name: `EMAIL_USER`
   - Value: `apikey` (tam olarak bu kelime, değiştirmeyin!)
   - "Add" butonuna tıklayın

   **e) EMAIL_PASS:**
   - Name: `EMAIL_PASS`
   - Value: SendGrid API Key'inizi yapıştırın (Adım 2'de kopyaladığınız)
   - Örnek: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - "Add" butonuna tıklayın

   **f) SENDGRID_FROM_EMAIL (Opsiyonel):**
   - Name: `SENDGRID_FROM_EMAIL`
   - Value: Doğruladığınız email adresi (örnek: `orhancodes@gmail.com`)
   - Bu değişkeni eklemezseniz, `EMAIL_USER` değeri kullanılır
   - "Add" butonuna tıklayın

4. **Mevcut Gmail Variables'ları Güncelleyin (Opsiyonel):**
   - `EMAIL_USER` değerini `apikey` olarak güncelleyin
   - `EMAIL_PASS` değerini SendGrid API Key ile güncelleyin
   - `EMAIL_HOST` değerini `smtp.sendgrid.net` olarak güncelleyin
   - `EMAIL_PORT` değerini `587` olarak güncelleyin

5. **Deployment:**
   - Railway otomatik olarak yeniden deploy edecek
   - Deployment tamamlanmasını bekleyin (yaklaşık 1-2 dakika)

---

1. **Deployment Tamamlandıktan Sonra:**
   - Railway Dashboard'da AutooR servisinin "Online" olduğundan emin olun

2. **Register Sayfasında Test:**
   - `https://autoor-demo.netlify.app/register` sayfasına gidin
   - Email adresinizi girin
   - "Code senden" butonuna tıklayın
   - Email'inizi kontrol edin (gelen kutusu ve spam klasörü)

3. **Forgot Password Test:**
   - `https://autoor-demo.netlify.app/forgot-password` sayfasına gidin
   - Email adresinizi girin
   - "Link senden" butonuna tıklayın
   - Email'inizi kontrol edin

---

1. **Railway Loglarını Kontrol Edin:**
   - Railway Dashboard → AutooR servisi → "Logs" sekmesi
   - "Code senden" veya "Link senden" butonuna tıkladığınızda logları kontrol edin
   - `Email configuration check:` mesajını arayın
   - `Email gönderme hatası:` mesajı var mı bakın

2. **SendGrid Dashboard'u Kontrol Edin:**
   - SendGrid Dashboard → "Activity" sekmesi
   - Email gönderim geçmişini kontrol edin
   - Hata mesajları var mı bakın

3. **Environment Variables Kontrol:**
   - Railway'de tüm environment variables'ların doğru olduğundan emin olun
   - `EMAIL_PROVIDER=sendgrid` olmalı
   - `EMAIL_USER=apikey` olmalı (tam olarak bu kelime)
   - `EMAIL_PASS` SendGrid API Key olmalı

4. **Sender Verification Kontrol:**
   - SendGrid Dashboard → "Settings" → "Sender Authentication"
   - Email adresinizin "Verified" olduğundan emin olun

---

- **Günlük Limit:** 100 email/gün
- **Aylık Limit:** Yok (günlük limit geçerli)
- **API Calls:** Sınırsız
- **Support:** Email desteği

Eğer günlük 100 email yeterli değilse, SendGrid'in ücretli planlarına geçebilirsiniz.

---

Eğer SendGrid yerine tekrar Gmail kullanmak isterseniz:

1. Railway'de `EMAIL_PROVIDER` değişkenini silin veya `gmail` yapın
2. `EMAIL_USER` değerini Gmail adresinizle güncelleyin
3. `EMAIL_PASS` değerini Gmail App Password ile güncelleyin
4. `EMAIL_HOST` değerini `smtp.gmail.com` yapın
5. `EMAIL_PORT` değerini `465` yapın

---

Sorun yaşarsanız:
1. Railway loglarını kontrol edin
2. SendGrid Dashboard'u kontrol edin
3. Bu dokümantasyonu tekrar gözden geçirin

Başarılar! 🚀


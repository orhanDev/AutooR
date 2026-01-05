

1. Google Account'a gidin: https://myaccount.google.com/
2. Sol menüden **"Security"** (Güvenlik) seçin
3. **"2-Step Verification"** (2 Adımlı Doğrulama) açık olmalı
   - Eğer kapalıysa, önce bunu açın
4. **"2-Step Verification"** sayfasında aşağı kaydırın
5. **"App passwords"** (Uygulama şifreleri) bölümünü bulun
6. **"Select app"** → **"Mail"** seçin
7. **"Select device"** → **"Other (Custom name)"** seçin
8. İsim olarak: `AutooR App` yazın
9. **"Generate"** butonuna tıklayın
10. **16 karakterlik şifre** oluşturulacak (örnek: `abcd efgh ijkl mnop`)
11. Bu şifreyi kopyalayın (boşluklar olmadan: `abcdefghijklmnop`)

`.env` dosyanıza şu satırları ekleyin:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

**Örnek:**
```env
EMAIL_USER=orhancodes@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

Değişikliklerin etkili olması için server'ı yeniden başlatın:
```bash
npm start
```

1. `https://localhost:3443/register` sayfasına gidin
2. Email adresini girin
3. "Code senden" butonuna tıklayın
4. Email'inize doğrulama kodu gönderilecek

- **"Invalid login" hatası:** App Password'u kontrol edin (boşluklar olmadan)
- **"Less secure app" hatası:** 2-Step Verification açık olmalı
- **Email gelmiyor:** Spam klasörünü kontrol edin


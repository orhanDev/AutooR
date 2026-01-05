

- ✅ Gmail
- ✅ Outlook/Hotmail
- ✅ Yahoo Mail
- ✅ Custom SMTP (herhangi bir email servisi)

1. Google Account → Security → 2-Step Verification → App Passwords
2. App Password oluşturun (16 karakter)
3. `.env` dosyasına ekleyin:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM_NAME=AutooR
```

1. Microsoft Account → Security → Advanced security options → App passwords
2. App Password oluşturun
3. `.env` dosyasına ekleyin:

```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM_NAME=AutooR
```

1. Yahoo Account → Account Security → Generate app password
2. App Password oluşturun
3. `.env` dosyasına ekleyin:

```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM_NAME=AutooR
```

```env
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-smtp-password
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM_NAME=AutooR
```

DNS kayıtlarınıza SPF kaydı ekleyin:
```
TXT @ "v=spf1 include:_spf.google.com ~all"
```

Email servisinizden DKIM kayıtlarını alın ve DNS'e ekleyin.

DNS kayıtlarınıza DMARC kaydı ekleyin:
```
TXT _dmarc "v=DMARC1; p=none; rua=mailto:your-email@yourdomain.com"
```

- Gerçek bir email adresi kullanın (noreply@yourdomain.com yerine)
- Email adresiniz domain'inizle eşleşmeli
- Reply-To header eklenmiş durumda

- ✅ Text ve HTML versiyonları mevcut
- ✅ Profesyonel HTML tasarımı
- ✅ Unsubscribe linki eklendi
- ✅ Gönderen adı belirtildi
- ✅ Date header otomatik ekleniyor

1. `.env` dosyasını güncelleyin
2. Server'ı yeniden başlatın: `npm start`
3. `https://localhost:3443/register` sayfasına gidin
4. Email adresini girin ve "Code senden" butonuna tıklayın
5. Email'inizi kontrol edin (Spam klasörünü de kontrol edin)
- Spam klasörünü kontrol edin
- Email servisi ayarlarını kontrol edin
- Server console'unda hata mesajlarını kontrol edin
- App Password'u kontrol edin (boşluklar olmadan)
- 2-Step Verification açık olmalı
- SPF, DKIM, DMARC kayıtlarını ekleyin
- Email gönderen adresini domain'inizle eşleştirin
- Email içeriğini kontrol edin


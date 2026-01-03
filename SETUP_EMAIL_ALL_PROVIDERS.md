# Email Gönderme Ayarları - Tüm Email Servisleri

## Desteklenen Email Servisleri

- ✅ Gmail
- ✅ Outlook/Hotmail
- ✅ Yahoo Mail
- ✅ Custom SMTP (herhangi bir email servisi)

## Adım 1: Email Servisinize Göre Ayarlar

### Gmail

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

### Outlook/Hotmail

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

### Yahoo Mail

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

### Custom SMTP (Diğer Email Servisleri)

```env
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-smtp-password
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM_NAME=AutooR
```

## Adım 2: Spam Önleme İçin Öneriler

### 1. SPF Kaydı (Domain için)

DNS kayıtlarınıza SPF kaydı ekleyin:
```
TXT @ "v=spf1 include:_spf.google.com ~all"
```

### 2. DKIM Kaydı (Domain için)

Email servisinizden DKIM kayıtlarını alın ve DNS'e ekleyin.

### 3. DMARC Kaydı (Domain için)

DNS kayıtlarınıza DMARC kaydı ekleyin:
```
TXT _dmarc "v=DMARC1; p=none; rua=mailto:your-email@yourdomain.com"
```

### 4. Email Gönderen Adresi

- Gerçek bir email adresi kullanın (noreply@yourdomain.com yerine)
- Email adresiniz domain'inizle eşleşmeli
- Reply-To header eklenmiş durumda

### 5. Email İçeriği

- ✅ Text ve HTML versiyonları mevcut
- ✅ Profesyonel HTML tasarımı
- ✅ Unsubscribe linki eklendi
- ✅ Gönderen adı belirtildi
- ✅ Date header otomatik ekleniyor

## Adım 3: Test Etme

1. `.env` dosyasını güncelleyin
2. Server'ı yeniden başlatın: `npm start`
3. `https://localhost:3443/register` sayfasına gidin
4. Email adresini girin ve "Code senden" butonuna tıklayın
5. Email'inizi kontrol edin (Spam klasörünü de kontrol edin)

## Sorun Giderme

### Email gelmiyor
- Spam klasörünü kontrol edin
- Email servisi ayarlarını kontrol edin
- Server console'unda hata mesajlarını kontrol edin

### "Invalid login" hatası
- App Password'u kontrol edin (boşluklar olmadan)
- 2-Step Verification açık olmalı

### Spam'a düşüyor
- SPF, DKIM, DMARC kayıtlarını ekleyin
- Email gönderen adresini domain'inizle eşleştirin
- Email içeriğini kontrol edin


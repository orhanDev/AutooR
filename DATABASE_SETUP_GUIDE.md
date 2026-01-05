# Veritabanı Yapılandırma Rehberi

## 🎯 Olması Gereken Yapı

### ✅ Doğru Yapı:

1. **Production (Netlify Demo)** → Railway PostgreSQL veritabanına bağlanmalı
2. **Localhost (Development)** → İki seçenek:
   - **Seçenek A:** Local PostgreSQL veritabanına bağlan (development için)
   - **Seçenek B:** Railway PostgreSQL veritabanına bağlan (test için - ÖNERİLEN)

### ❌ Şu Anki Sorun:

- Localhost'ta kayıt olunca → Local veritabanına kaydediliyor
- Railway'de kayıt olunca → Railway veritabanına kaydediliyor
- **Sonuç:** İki farklı veritabanı var, kullanıcılar karışıyor!

---

## 🔧 Çözüm: Localhost'u da Railway'e Bağla

### Adım 1: `.env` Dosyasını Güncelle

Proje kök dizininde `.env` dosyasını açın veya oluşturun:

```env
# Railway PostgreSQL Bağlantı Bilgileri
# Railway Dashboard → Postgres → Connection URL'den alın
# ÖNEMLİ: Gerçek şifreleri buraya yazmayın! Sadece .env dosyasında saklayın!
PGUSER=postgres
PGHOST=your-railway-host.rlwy.net
PGDATABASE=railway
PGPASSWORD=YOUR_RAILWAY_PASSWORD_HERE
PGPORT=51096

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Email Configuration (SendGrid)
EMAIL_PROVIDER=sendgrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key

# Base URL
BASE_URL=https://autoor-demo.netlify.app
NODE_ENV=production
```

### Adım 2: Railway Connection URL'yi Kullan

Railway Dashboard'da:
1. **Postgres** servisine gidin
2. **Variables** sekmesine tıklayın
3. **Connection URL** değerini kopyalayın
4. `.env` dosyasına ekleyin:

```env
# VEYA direkt Connection URL kullanın:
DATABASE_URL=postgresql://postgres:AuXmRQKsueCCkRSnlfYKFifvrfYlUBGT@ballast.proxy.rlwy.net:51096/railway
```

### Adım 3: Backend'i Yeniden Başlat

```bash
# Terminal'de backend'i durdurun (Ctrl+C)
# Sonra tekrar başlatın:
node server.js
```

---

## 📊 Veritabanı Kontrolü

### Local Veritabanında Kullanıcı Arama:

```sql
-- pgAdmin'de LOCAL bağlantıya bağlanın
SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM('ooorhanyilmaz35@gmail.com'));
```

### Railway Veritabanında Kullanıcı Arama:

```sql
-- pgAdmin'de RAILWAY bağlantısına bağlanın
SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM('ooorhanyilmaz35@gmail.com'));
```

---

## 🎯 Önerilen Yapı

### **Seçenek 1: Her Zaman Railway Kullan (ÖNERİLEN)**

**Avantajlar:**
- ✅ Tek bir veritabanı (karışıklık yok)
- ✅ Production ve development aynı veritabanı
- ✅ Test verileri production'da görünür

**Dezavantajlar:**
- ⚠️ Development sırasında production verilerini etkileyebilirsiniz

**Yapılandırma:**
- `.env` dosyasında Railway bağlantı bilgilerini kullanın
- Localhost'ta da Railway'e bağlanın

### **Seçenek 2: Ayrı Veritabanları Kullan**

**Avantajlar:**
- ✅ Production verileri korunur
- ✅ Development sırasında test verileri production'u etkilemez

**Dezavantajlar:**
- ⚠️ İki farklı veritabanı yönetmek gerekir
- ⚠️ Kullanıcılar karışabilir

**Yapılandırma:**
- Production: Railway PostgreSQL
- Development: Local PostgreSQL
- `.env` dosyasında `NODE_ENV` değerine göre otomatik seçim

---

## 🔍 Hangi Veritabanına Bağlı Olduğunuzu Kontrol Etme

### Backend Terminalinde:

```bash
# Windows PowerShell
echo $env:PGHOST

# Linux/Mac
echo $PGHOST
```

### Backend Loglarında:

Backend başlatıldığında şu log'u görmelisiniz:
```
Connected to PostgreSQL database: railway (veya AutooR)
```

---

## ✅ Sonuç

**Önerilen:** Localhost'ta da Railway veritabanına bağlanın. Böylece:
- ✅ Tek bir veritabanı kullanırsınız
- ✅ Tüm kullanıcılar Railway'de görünür
- ✅ pgAdmin'de Railway bağlantısına bakmanız yeterli

**Nasıl Yapılır:**
1. `.env` dosyasını Railway bağlantı bilgileriyle güncelleyin
2. Backend'i yeniden başlatın
3. Localhost'ta kayıt olun ve Railway veritabanında görün


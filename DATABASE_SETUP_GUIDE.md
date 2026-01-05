

1. **Production (Netlify Demo)** → Railway PostgreSQL veritabanına bağlanmalı
2. **Localhost (Development)** → İki seçenek:
   - **Seçenek A:** Local PostgreSQL veritabanına bağlan (development için)
   - **Seçenek B:** Railway PostgreSQL veritabanına bağlan (test için - ÖNERİLEN)

- Localhost'ta kayıt olunca → Local veritabanına kaydediliyor
- Railway'de kayıt olunca → Railway veritabanına kaydediliyor
- **Sonuç:** İki farklı veritabanı var, kullanıcılar karışıyor!

---

Proje kök dizininde `.env` dosyasını açın veya oluşturun:

```env
PGUSER=postgres
PGHOST=your-railway-host.rlwy.net
PGDATABASE=railway
PGPASSWORD=YOUR_RAILWAY_PASSWORD_HERE
PGPORT=51096
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
EMAIL_PROVIDER=sendgrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
BASE_URL=https://autoor-demo.netlify.app
NODE_ENV=production
```

Railway Dashboard'da:
1. **Postgres** servisine gidin
2. **Variables** sekmesine tıklayın
3. **Connection URL** değerini kopyalayın
4. `.env` dosyasına ekleyin:

```env
DATABASE_URL=postgresql://postgres:AuXmRQKsueCCkRSnlfYKFifvrfYlUBGT@ballast.proxy.rlwy.net:51096/railway
```

```bash
node server.js
```

---

```sql
-- pgAdmin'de LOCAL bağlantıya bağlanın
SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM('ooorhanyilmaz35@gmail.com'));
```

```sql
-- pgAdmin'de RAILWAY bağlantısına bağlanın
SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM('ooorhanyilmaz35@gmail.com'));
```

---

**Avantajlar:**
- ✅ Tek bir veritabanı (karışıklık yok)
- ✅ Production ve development aynı veritabanı
- ✅ Test verileri production'da görünür

**Dezavantajlar:**
- ⚠️ Development sırasında production verilerini etkileyebilirsiniz

**Yapılandırma:**
- `.env` dosyasında Railway bağlantı bilgilerini kullanın
- Localhost'ta da Railway'e bağlanın

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

```bash
echo $env:PGHOST
echo $PGHOST
```

Backend başlatıldığında şu log'u görmelisiniz:
```
Connected to PostgreSQL database: railway (veya AutooR)
```

---

**Önerilen:** Localhost'ta da Railway veritabanına bağlanın. Böylece:
- ✅ Tek bir veritabanı kullanırsınız
- ✅ Tüm kullanıcılar Railway'de görünür
- ✅ pgAdmin'de Railway bağlantısına bakmanız yeterli

**Nasıl Yapılır:**
1. `.env` dosyasını Railway bağlantı bilgileriyle güncelleyin
2. Backend'i yeniden başlatın
3. Localhost'ta kayıt olun ve Railway veritabanında görün


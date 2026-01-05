# Railway Backend Deployment Rehberi - AutooR

## 📋 Ön Hazırlık

### 1. Railway Hesabı Oluşturma
1. **Railway'a gidin**: https://railway.app
2. **"Start a New Project"** butonuna tıklayın
3. **GitHub ile giriş yapın** (önerilen) veya email ile kayıt olun
4. GitHub hesabınızı bağlayın (eğer GitHub ile giriş yaptıysanız)

---

## 🚀 Adım 1: Yeni Proje Oluşturma

1. Railway dashboard'da **"New Project"** butonuna tıklayın
2. **"Deploy from GitHub repo"** seçeneğini seçin
3. GitHub repository listesinden **`orhanDev/AutooR`** repository'sini seçin
4. **"Deploy Now"** butonuna tıklayın

---

## 🗄️ Adım 2: PostgreSQL Database Ekleme

1. Railway dashboard'da projenizin içine girin
2. **"+ New"** butonuna tıklayın
3. **"Database"** → **"Add PostgreSQL"** seçin
4. Railway otomatik olarak PostgreSQL database oluşturacak
5. Database'in **"Variables"** sekmesine gidin
6. **`DATABASE_URL`** değişkenini kopyalayın (daha sonra kullanacağız)

**Örnek DATABASE_URL formatı:**
```
postgresql://postgres:password@hostname:5432/railway
```

---

## ⚙️ Adım 3: Backend Service Ekleme

Railway'de backend servisini eklemek için:

1. Railway dashboard'da projenizin içinde **"+ New"** butonuna tıklayın
2. **"GitHub Repo"** seçeneğini seçin
3. **"Deploy from GitHub repo"** seçeneğini seçin
4. Eğer repository listesi açılmazsa:
   - **"Configure GitHub App"** butonuna tıklayın
   - GitHub hesabınızı bağlayın
   - Repository'leri seçin (AutooR repository'sini seçin)
5. Repository listesinden **`orhanDev/AutooR`** repository'sini seçin
6. Railway otomatik olarak deploy başlatacak

**Not:** İlk deploy biraz zaman alabilir (2-5 dakika)

---

## ⚙️ Adım 4: Backend Service Ayarları

Backend servisi eklendikten sonra:

1. Railway dashboard'da projenizin içinde **backend servisinizi** bulun (repository adı ile görünecek, örneğin "AutooR")
2. Servise tıklayın
3. **"Settings"** sekmesine tıklayın
4. **"Root Directory"** ayarını kontrol edin (boş bırakın veya `/` olarak ayarlayın)
5. **"Start Command"** ayarını kontrol edin:
   - Eğer boşsa: `npm start` yazın
   - Veya `node server.js` yazın
6. **"Save"** butonuna tıklayın

---

## 🔐 Adım 5: Environment Variables (Çevre Değişkenleri) Ekleme

Railway dashboard'da projenizin **"Variables"** sekmesine gidin ve şu değişkenleri ekleyin:

### PostgreSQL Database Ayarları

Railway'de PostgreSQL database adı **"railway"** olur (değiştirilemez). Kodunuz `PGDATABASE` kullandığı için şu değişkenleri ekleyin:

**Seçenek 1: DATABASE_URL Kullanın (Önerilen - Daha Kolay)**
```
DATABASE_URL=<Railway PostgreSQL'in Variables sekmesinden kopyaladığınız DATABASE_URL>
```
**Not:** Kodunuz şu an DATABASE_URL kullanmıyor, bu yüzden kodda küçük bir değişiklik gerekebilir.

**Seçenek 2: Ayrı Değişkenler (Mevcut Kod ile Uyumlu)**
Railway PostgreSQL servisinin **"Variables"** sekmesine gidin ve şu değişkenleri kopyalayın:
```
PGHOST=<Railway PostgreSQL hostname>
PGPORT=5432
PGDATABASE=railway
PGUSER=postgres
PGPASSWORD=<Railway PostgreSQL password>
```

**Önemli:** Railway'de database adı **"railway"** olur (local'deki "AutooR" değil). Bu Railway'in varsayılan adıdır ve değiştirilemez.

### JWT Secret (Güvenlik için önemli!)
```
JWT_SECRET=<Güçlü bir random string, en az 32 karakter>
```
**Örnek:** `JWT_SECRET=your_super_secret_jwt_key_autoor_2024_production_secure`

### Email Ayarları (Forgot Password için gerekli)
```
EMAIL_USER=<Gmail email adresiniz>
EMAIL_PASS=<Gmail App Password (2FA aktifse)>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM_NAME=AutooR
```

**Gmail App Password Nasıl Alınır:**
1. Google Account → Security → 2-Step Verification (aktif olmalı)
2. App passwords → Select app: "Mail" → Select device: "Other"
3. Oluşturulan 16 karakterli şifreyi `EMAIL_PASS` olarak kullanın

### Google OAuth (Opsiyonel - şimdilik atlayabilirsiniz)
```
GOOGLE_CLIENT_ID=<Google Cloud Console'dan>
GOOGLE_CLIENT_SECRET=<Google Cloud Console'dan>
GOOGLE_REDIRECT_URI=https://your-railway-url.railway.app/auth/google/callback
```

### Encryption Key (Kredi kartı şifreleme için)
```
ENCRYPTION_KEY=<32 karakterlik random string>
```
**Örnek:** `ENCRYPTION_KEY=autoor_encryption_key_2024_secure!`

### Port Ayarları
```
PORT=3000
NODE_ENV=production
```

---

## 📝 Adım 5: Database Migration (Veritabanı Tablolarını Oluşturma)

Railway'de database oluşturulduktan sonra, tabloları oluşturmanız gerekiyor:

### Seçenek 1: Railway CLI ile (Önerilen)
1. Railway CLI'yi yükleyin:
   ```bash
   npm install -g @railway/cli
   ```
2. Railway'a giriş yapın:
   ```bash
   railway login
   ```
3. Projeyi link edin:
   ```bash
   railway link
   ```
4. Database'e bağlanın ve SQL script'lerini çalıştırın:
   ```bash
   railway connect postgres
   ```
   Sonra SQL dosyalarınızı çalıştırın (örneğin `db/init.sql`)

### Seçenek 2: pgAdmin veya DBeaver ile
1. Railway database'in **"Connect"** sekmesine gidin
2. Connection bilgilerini alın
3. pgAdmin veya DBeaver ile bağlanın
4. `db/init.sql` dosyasını çalıştırın

### Seçenek 3: Railway'de Script Çalıştırma
1. Railway dashboard'da **"Deployments"** sekmesine gidin
2. **"View Logs"** ile database connection'ı kontrol edin
3. İlk deploy'dan sonra database tabloları otomatik oluşturulabilir (eğer `server.js` içinde init kodu varsa)

---

## 🚀 Adım 7: Deploy ve Test

1. Railway otomatik olarak GitHub'dan değişiklikleri çeker
2. **"Deployments"** sekmesinde deploy durumunu izleyin
3. Deploy tamamlandığında **"Settings"** → **"Generate Domain"** ile bir URL alın
4. Backend URL'iniz şu formatta olacak: `https://autoor-production.railway.app`

---

## 🔗 Adım 8: Netlify ile Bağlama

Backend URL'inizi aldıktan sonra:

1. `netlify.toml` dosyasını açın
2. API proxy ayarlarını güncelleyin (yorum satırlarını kaldırın):
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://your-railway-url.railway.app/api/:splat"
     status = 200
     force = true

   [[redirects]]
     from = "/auth/*"
     to = "https://your-railway-url.railway.app/auth/:splat"
     status = 200
     force = true
   ```
3. Değişiklikleri commit edin ve push edin
4. Netlify otomatik olarak yeniden deploy edecek

---

## ✅ Test Etme

1. **Backend Test:**
   - `https://your-railway-url.railway.app/api/health` (eğer health endpoint varsa)
   - Veya `https://your-railway-url.railway.app/api/cars` (araç listesi)

2. **Netlify Demo Test:**
   - `https://autoor-demo.netlify.app/forgot-password` sayfasına gidin
   - Email adresinizi girin
   - "Link senden" butonuna tıklayın
   - Artık çalışmalı! ✅

---

## 🐛 Sorun Giderme

### Database Connection Hatası
- Railway database'in `DATABASE_URL` değişkenini kontrol edin
- `PGHOST`, `PGUSER`, `PGPASSWORD` değişkenlerini doğru ayarlayın

### Port Hatası
- Railway otomatik olarak `PORT` environment variable'ını ayarlar
- `server.js` içinde `process.env.PORT || 3000` kullanıldığından emin olun

### Email Gönderme Hatası
- Gmail App Password'un doğru olduğundan emin olun
- 2FA'nın aktif olduğundan emin olun
- `EMAIL_HOST` ve `EMAIL_PORT` ayarlarını kontrol edin

### CORS Hatası
- `server.js` içinde CORS ayarlarını kontrol edin
- Netlify domain'ini allowed origins'e ekleyin

---

## 📚 Ek Kaynaklar

- Railway Dokümantasyon: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

## 💡 İpuçları

1. **Free Tier:** Railway'de aylık $5 kredi var (yeterli olmalı)
2. **Database Backup:** Railway otomatik backup alır
3. **Logs:** Railway dashboard'da real-time logs görebilirsiniz
4. **Environment Variables:** Hassas bilgileri environment variables'da saklayın
5. **Custom Domain:** Railway'de custom domain ekleyebilirsiniz (ücretli plan gerekebilir)

---

## 🎉 Başarılı Deploy Sonrası

Backend başarıyla deploy edildikten sonra:
1. ✅ Forgot password sayfası çalışacak
2. ✅ Login/Register çalışacak
3. ✅ Tüm API endpoint'leri çalışacak
4. ✅ Email gönderimi çalışacak

**Sorun yaşarsanız Railway dashboard'daki logs'u kontrol edin!**


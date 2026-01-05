# Netlify Otomatik Deployment Rehberi

## 🎯 Amaç
Her Git push'unda otomatik olarak `https://autoor-demo.netlify.app/` adresine deploy edilmesi.

---

## ✅ Kontrol Listesi

### 1. GitHub Repository Bağlantısı
- [ ] Netlify'da site GitHub repository'sine bağlı mı?
- [ ] Doğru repository seçili mi? (`orhanDev/AutooR`)

### 2. Continuous Deployment Ayarları
- [ ] Continuous deployment açık mı?
- [ ] Hangi branch deploy ediliyor? (genellikle `main` veya `master`)
- [ ] Build command doğru mu? (`npm install` veya boş)
- [ ] Publish directory doğru mu? (`public`)

### 3. Build Settings
- [ ] Build command: `npm install` (veya boş bırakılabilir)
- [ ] Publish directory: `public`
- [ ] Base directory: (boş bırakın)

---

## 🔧 Adım Adım Kurulum

### Adım 1: Netlify Dashboard'a Gidin
1. https://app.netlify.com adresine gidin
2. `autoor-demo` sitesine tıklayın

### Adım 2: Repository Bağlantısını Kontrol Edin
1. Sol menüden **"Site configuration"** → **"Build & deploy"** seçin
2. **"Continuous deployment"** bölümüne gidin
3. **"Repository"** kartında hangi repository'nin bağlı olduğunu kontrol edin
4. Eğer bağlı değilse veya yanlış repository ise:
   - **"Manage repository"** butonuna tıklayın
   - **"Change repository"** veya **"Disconnect repository"** seçin
   - **"Connect repository"** ile `orhanDev/AutooR` repository'sini bağlayın

### Adım 3: Build Settings'i Kontrol Edin
**"Build settings"** kartında:
- **Build command:** `npm install` (veya boş bırakın - static site olduğu için gerekli değil)
- **Publish directory:** `public`
- **Base directory:** (boş bırakın)

### Adım 4: Branch Ayarlarını Kontrol Edin
1. **"Continuous deployment"** bölümünde **"Branch deploys"** ayarını kontrol edin
2. **Production branch:** `main` veya `master` (hangi branch'i kullanıyorsanız)
3. **Branch deploys:** `All branches` veya sadece `main` branch'i seçin

### Adım 5: Deploy Hook'larını Kontrol Edin (Opsiyonel)
1. **"Build & deploy"** → **"Deploy hooks"** bölümüne gidin
2. Eğer manuel deploy hook'u kullanmak istiyorsanız, buradan oluşturabilirsiniz

---

## 🚀 Test Etme

### Test 1: Otomatik Deploy
1. Local'de bir değişiklik yapın (örneğin `public/index.html` dosyasına bir yorum ekleyin)
2. Git'e commit edin:
   ```bash
   git add .
   git commit -m "Test: Netlify auto deploy test"
   ```
3. GitHub'a push edin:
   ```bash
   git push origin main
   ```
4. Netlify Dashboard'da **"Deploys"** sekmesine gidin
5. Yeni bir deploy'ın otomatik olarak başladığını görmelisiniz
6. Deploy tamamlandıktan sonra (1-2 dakika) https://autoor-demo.netlify.app/ adresini kontrol edin

### Test 2: Deploy Loglarını Kontrol Etme
1. Netlify Dashboard'da **"Deploys"** sekmesine gidin
2. En son deploy'a tıklayın
3. **"Deploy log"** sekmesinde build loglarını görebilirsiniz
4. Hata varsa burada görünecektir

---

## ⚠️ Sorun Giderme

### Sorun 1: Push yaptım ama deploy başlamadı
**Çözüm:**
1. Netlify Dashboard'da **"Build & deploy"** → **"Continuous deployment"** bölümüne gidin
2. Repository bağlantısının aktif olduğundan emin olun
3. **"Trigger deploy"** → **"Deploy site"** ile manuel deploy başlatın
4. Eğer hala çalışmıyorsa, repository'yi yeniden bağlayın

### Sorun 2: Deploy başladı ama başarısız oldu
**Çözüm:**
1. **"Deploys"** sekmesinde başarısız deploy'a tıklayın
2. **"Deploy log"** sekmesinde hata mesajını okuyun
3. Genellikle şu hatalar olabilir:
   - Build command hatası → `netlify.toml` dosyasını kontrol edin
   - Publish directory bulunamadı → `public` klasörünün var olduğundan emin olun
   - Node version uyumsuzluğu → `netlify.toml` dosyasında `NODE_VERSION = "18"` olduğundan emin olun

### Sorun 3: Değişiklikler sitede görünmüyor
**Çözüm:**
1. Tarayıcı cache'ini temizleyin (Ctrl+Shift+R veya Cmd+Shift+R)
2. Netlify Dashboard'da deploy'un tamamlandığından emin olun
3. **"Deploys"** sekmesinde deploy durumunu kontrol edin (yeşil ✓ işareti olmalı)

### Sorun 4: Yanlış branch deploy ediliyor
**Çözüm:**
1. **"Build & deploy"** → **"Continuous deployment"** bölümüne gidin
2. **"Production branch"** ayarını kontrol edin
3. Doğru branch'i seçin (`main` veya `master`)

---

## 📋 Netlify.toml Kontrolü

`netlify.toml` dosyanız şu şekilde olmalı:

```toml
[build]
  command = "npm install"
  publish = "public"

[build.environment]
  NODE_VERSION = "18"

# API proxy - Backend için (Railway backend URL'i)
[[redirects]]
  from = "/api/*"
  to = "https://autoor-production.up.railway.app/api/:splat"
  status = 200
  force = true

# Auth routes için proxy
[[redirects]]
  from = "/auth/*"
  to = "https://autoor-production.up.railway.app/auth/:splat"
  status = 200
  force = true

# ... diğer redirect'ler
```

---

## ✅ Sonuç

Her `git push` yaptığınızda:
1. ✅ Netlify otomatik olarak deploy başlatır
2. ✅ Build işlemi tamamlanır (1-2 dakika)
3. ✅ Site https://autoor-demo.netlify.app/ adresinde güncellenir

**Not:** İlk deploy biraz daha uzun sürebilir (3-5 dakika). Sonraki deploy'lar genellikle 1-2 dakika sürer.

---

## 🔔 Bildirimler

Netlify, deploy durumları hakkında email bildirimi gönderebilir:
1. **"Site settings"** → **"Notifications"** bölümüne gidin
2. Email bildirimlerini açın/kapatın

---

## 📞 Yardım

Sorun yaşarsanız:
1. Netlify Dashboard'da **"Deploys"** sekmesindeki logları kontrol edin
2. Netlify dokümantasyonu: https://docs.netlify.com/
3. Netlify Community: https://answers.netlify.com/


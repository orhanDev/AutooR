# Netlify Deployment Guide - AutooR

## Önemli Not

Netlify **static site hosting** ve **serverless functions** için tasarlanmıştır. Tam bir Express.js backend'i direkt çalıştıramaz.

## Çözüm: Hybrid Yaklaşım

### Frontend → Netlify
- Static HTML/CSS/JS dosyaları Netlify'da host edilir
- Ücretsiz ve hızlı CDN

### Backend → Railway/Render (Önerilen)
- Express.js server Railway veya Render'da çalışır
- PostgreSQL database için de uygun

## Adım 1: Netlify'da Frontend Deploy

1. **Netlify'a gidin**: https://app.netlify.com
2. **"Add new site" → "Import an existing project"**
3. **GitHub'ı seçin** ve `orhanDev/AutooR` repository'sini seçin
4. **Build settings**:
   - **Build command**: `npm install` (veya boş bırakın)
   - **Publish directory**: `public`
   - **Base directory**: (boş bırakın)
5. **"Deploy site"** butonuna tıklayın

## Adım 2: Backend için Railway/Render Kurulumu

Backend için ayrı bir servis gerekiyor. Railway veya Render kullanabilirsiniz.

### Railway (Önerilen)
1. https://railway.app adresine gidin
2. GitHub ile giriş yapın
3. "New Project" → "Deploy from GitHub repo"
4. `AutooR` repository'sini seçin
5. Environment variables ekleyin (`.env` dosyasındaki değerler)
6. PostgreSQL database ekleyin
7. Deploy edin

### Render
1. https://render.com adresine gidin
2. GitHub ile giriş yapın
3. "New Web Service" → GitHub repo seçin
4. Environment variables ekleyin
5. PostgreSQL database ekleyin
6. Deploy edin

## Adım 3: Netlify Redirects Güncelleme

Backend URL'i aldıktan sonra `netlify.toml` dosyasındaki redirect'leri güncelleyin:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/auth/*"
  to = "https://your-backend-url.com/auth/:splat"
  status = 200
  force = true
```

## Adım 4: Environment Variables

### Netlify'da:
- Backend URL'i (REACT_APP_API_URL veya benzeri)

### Railway/Render'da:
- Tüm `.env` dosyasındaki değişkenler
- PostgreSQL connection string
- Google OAuth credentials
- JWT_SECRET

## Domain Ayarları

1. **Domain satın alın**: www.autoor.com
2. **Netlify'da domain ekleyin**:
   - Site settings → Domain management
   - "Add custom domain" → `www.autoor.com`
   - DNS ayarlarını yapın
3. **SSL**: Netlify otomatik SSL sağlar

## Sonraki Adımlar

1. Backend'i Railway/Render'da deploy edin
2. Backend URL'ini alın
3. `netlify.toml` dosyasını güncelleyin
4. Netlify'ı yeniden deploy edin
5. Domain'i bağlayın


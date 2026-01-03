# Netlify Deploy Adımları - AutooR Demo

## Durum
- **Portfolio Sitesi:** `www.orhancodes.com` (ayrı proje, değişmeyecek)
- **AutooR Demo Sitesi:** `autoor-demo.netlify.app` (yeni proje)

## Adım 1: Repository'yi Düzelt

1. Netlify'da `autoor-demo` projesine gidin
2. Sol menüden **"Build & deploy"** → **"Continuous deployment"** seçin
3. **"Repository"** kartında **"Manage repository"** butonuna tıklayın
4. **"Change repository"** veya **"Disconnect repository"** seçin
5. **"Connect repository"** ile `orhanDev/AutooR` repository'sini bağlayın

## Adım 2: Build Ayarlarını Kontrol Et

**"Build settings"** kartında:
- **Build command:** `npm install` (veya boş bırakılabilir)
- **Publish directory:** `public`

## Adım 3: Deploy Et

### Yöntem 1: Otomatik Deploy (Önerilen)
- GitHub'a push yaptığınızda otomatik deploy başlar

### Yöntem 2: Manuel Deploy
1. Sol menüden **"Deploys"** sekmesine gidin
2. Sağ üstte **"Trigger deploy"** → **"Deploy site"** butonuna tıklayın

## Sonuç
- Site URL: `https://autoor-demo.netlify.app`
- Portfolio'da link: `https://autoor-demo.netlify.app`


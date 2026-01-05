
- **Portfolio Sitesi:** `www.orhancodes.com` (ayrı proje, değişmeyecek)
- **AutooR Demo Sitesi:** `autoor-demo.netlify.app` (yeni proje)

1. Netlify'da `autoor-demo` projesine gidin
2. Sol menüden **"Build & deploy"** → **"Continuous deployment"** seçin
3. **"Repository"** kartında **"Manage repository"** butonuna tıklayın
4. **"Change repository"** veya **"Disconnect repository"** seçin
5. **"Connect repository"** ile `orhanDev/AutooR` repository'sini bağlayın

**"Build settings"** kartında:
- **Build command:** `npm install` (veya boş bırakılabilir)
- **Publish directory:** `public`
- GitHub'a push yaptığınızda otomatik deploy başlar
1. Sol menüden **"Deploys"** sekmesine gidin
2. Sağ üstte **"Trigger deploy"** → **"Deploy site"** butonuna tıklayın
- Site URL: `https://autoor-demo.netlify.app`
- Portfolio'da link: `https://autoor-demo.netlify.app`


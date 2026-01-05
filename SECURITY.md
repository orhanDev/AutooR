# Güvenlik Rehberi - AutooR

## ⚠️ ÖNEMLİ: Şifreler ve Gizli Bilgiler

Bu proje **public GitHub repository** olarak yayınlanacaktır. Bu nedenle **ASLA** gerçek şifreleri, API key'leri veya gizli bilgileri kod içine yazmayın!

## ✅ Güvenli Yöntem: Environment Variables (.env)

Tüm şifreler ve gizli bilgiler `.env` dosyasında saklanmalıdır. Bu dosya `.gitignore` içinde olduğu için GitHub'a yüklenmeyecektir.

### Adım 1: .env Dosyası Oluşturun

```bash
# Proje kök dizininde
cp env-example.txt .env
```

### Adım 2: .env Dosyasını Doldurun

`.env` dosyasını açın ve gerçek değerlerle doldurun:

```env
# Database
PGUSER=your-database-user
PGHOST=localhost
PGDATABASE=your-database-name
PGPASSWORD=your-real-password-here
PGPORT=5432

# JWT Secret (güçlü bir random string - en az 32 karakter)
JWT_SECRET=your-super-secret-jwt-key-here

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Adım 3: .env Dosyasının Git'te Olmadığını Kontrol Edin

```bash
git status
# .env dosyası listede görünmemeli!
```

Eğer görünüyorsa:
```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

## 🚫 YAPILMAMASI GEREKENLER

### ❌ ASLA Yapmayın:

1. **Hardcoded şifreler yazmayın:**
   ```javascript
   // YANLIŞ ❌
   password: 'Vekil4023.'
   
   // DOĞRU ✅
   password: process.env.PGPASSWORD
   ```

2. **Şifreleri commit etmeyin:**
   ```bash
   # YANLIŞ ❌
   git add .env
   git commit -m "Add .env"
   
   # DOĞRU ✅
   # .env zaten .gitignore'da, commit edilemez
   ```

3. **Şifreleri dokümantasyonda yazmayın:**
   ```markdown
   # YANLIŞ ❌
   PGPASSWORD=AuXmRQKsueCCkRSnlfYKFifvrfYlUBGT
   
   # DOĞRU ✅
   PGPASSWORD=your-railway-password-here
   ```

## 🔒 Güvenlik Kontrol Listesi

- [ ] `.env` dosyası `.gitignore` içinde
- [ ] `.env` dosyası Git'te commit edilmemiş
- [ ] Kod içinde hardcoded şifre yok
- [ ] Dokümantasyonda gerçek şifre yok
- [ ] `env-example.txt` sadece placeholder'lar içeriyor
- [ ] Production'da environment variables kullanılıyor

## 🔐 Güçlü Şifre Oluşturma

### JWT Secret için:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Encryption Key için:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## 📋 Railway/Netlify Deployment

### Railway (Backend):
Railway Dashboard'da environment variables ekleyin:
- `PGUSER`
- `PGHOST`
- `PGDATABASE`
- `PGPASSWORD`
- `PGPORT`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Netlify (Frontend):
Netlify Dashboard'da environment variables ekleyin (eğer gerekirse):
- Frontend genellikle environment variable gerektirmez
- API URL'leri frontend kodunda veya build-time'da set edilebilir

## 🆘 Şifre Sızdırıldıysa Ne Yapmalı?

Eğer bir şifre GitHub'a commit edildiyse:

1. **Hemen şifreyi değiştirin:**
   - Database şifresini değiştirin
   - API key'leri yenileyin
   - JWT secret'ı değiştirin

2. **Git history'den temizleyin:**
   ```bash
   # BFG Repo-Cleaner kullanarak (önerilen)
   # veya
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push yapın (dikkatli!):**
   ```bash
   git push origin --force --all
   ```

## 📚 Daha Fazla Bilgi

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP: Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_cryptographic_key)


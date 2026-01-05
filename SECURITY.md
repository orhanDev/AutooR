

Bu proje **public GitHub repository** olarak yayınlanacaktır. Bu nedenle **ASLA** gerçek şifreleri, API key'leri veya gizli bilgileri kod içine yazmayın!

Tüm şifreler ve gizli bilgiler `.env` dosyasında saklanmalıdır. Bu dosya `.gitignore` içinde olduğu için GitHub'a yüklenmeyecektir.

```bash
cp env-example.txt .env
```

`.env` dosyasını açın ve gerçek değerlerle doldurun:

```env
PGUSER=your-database-user
PGHOST=localhost
PGDATABASE=your-database-name
PGPASSWORD=your-real-password-here
PGPORT=5432
JWT_SECRET=your-super-secret-jwt-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

```bash
git status
```

Eğer görünüyorsa:
```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

1. **Hardcoded şifreler yazmayın:**
   ```javascript
   // YANLIŞ ❌
   password: 'Vekil4023.'
   
   // DOĞRU ✅
   password: process.env.PGPASSWORD
   ```

2. **Şifreleri commit etmeyin:**
   ```bash
   git add .env
   git commit -m "Add .env"
   ```

3. **Şifreleri dokümantasyonda yazmayın:**
   ```markdown
   PGPASSWORD=AuXmRQKsueCCkRSnlfYKFifvrfYlUBGT
   PGPASSWORD=your-railway-password-here
   ```

- [ ] `.env` dosyası `.gitignore` içinde
- [ ] `.env` dosyası Git'te commit edilmemiş
- [ ] Kod içinde hardcoded şifre yok
- [ ] Dokümantasyonda gerçek şifre yok
- [ ] `env-example.txt` sadece placeholder'lar içeriyor
- [ ] Production'da environment variables kullanılıyor
```bash
openssl rand -base64 32
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```
```bash
openssl rand -base64 32
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```
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
Netlify Dashboard'da environment variables ekleyin (eğer gerekirse):
- Frontend genellikle environment variable gerektirmez
- API URL'leri frontend kodunda veya build-time'da set edilebilir

Eğer bir şifre GitHub'a commit edildiyse:

1. **Hemen şifreyi değiştirin:**
   - Database şifresini değiştirin
   - API key'leri yenileyin
   - JWT secret'ı değiştirin

2. **Git history'den temizleyin:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push yapın (dikkatli!):**
   ```bash
   git push origin --force --all
   ```

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP: Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_cryptographic_key)


# PostgreSQL Bağlantı Sorunu Çözümü

## Sorun
pgAdmin'de şu hata alınıyor:
```
FATAL: Passwort-Authentifizierung für Benutzer "autor_user" fehlgeschlagen
```

## Çözüm Adımları

### Yöntem 1: pgAdmin'de Kullanıcı Oluşturma (Önerilen)

1. **pgAdmin'i açın**
2. **PostgreSQL sunucusuna bağlanın** (genellikle "PostgreSQL 15" veya benzeri)
   - Host: `localhost`
   - Port: `5432`
   - Username: `postgres` (varsayılan admin kullanıcı)
   - Password: PostgreSQL kurulumunda belirlediğiniz şifre (muhtemelen `admin123` veya başka bir şifre)

3. **Query Tool'u açın** (sağ tık → Query Tool)

4. **Aşağıdaki SQL komutlarını çalıştırın:**

```sql
-- autor_user kullanıcısını oluştur
CREATE USER autor_user WITH PASSWORD 'Vekil4023.';
ALTER USER autor_user CREATEDB;

-- autor_db veritabanını oluştur
CREATE DATABASE autor_db OWNER autor_user;

-- Veritabanına bağlan
\c autor_db

-- Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE autor_db TO autor_user;
```

5. **Yeni bir sunucu bağlantısı oluşturun:**
   - Name: `AutooR Database`
   - Host: `localhost`
   - Port: `5432`
   - Username: `autor_user`
   - Password: `Vekil4023.`
   - Database: `autor_db`

### Yöntem 2: Şifreyi Değiştirme (Kullanıcı zaten varsa)

Eğer `autor_user` kullanıcısı zaten varsa, şifresini değiştirin:

```sql
ALTER USER autor_user WITH PASSWORD 'Vekil4023.';
```

### Yöntem 3: Docker Kullanarak (Alternatif)

Eğer Docker Desktop yüklüyse ve çalışıyorsa:

```bash
docker-compose up -d
```

Bu komut `docker-compose.yml` dosyasındaki ayarlarla PostgreSQL'i başlatır.

## Bağlantı Bilgileri

- **Host:** `localhost` veya `127.0.0.1`
- **Port:** `5432`
- **Username:** `autor_user`
- **Password:** `Vekil4023.`
- **Database:** `autor_db`

## Test Etme

pgAdmin'de yeni bir sunucu bağlantısı oluşturduktan sonra, bağlantıyı test edin. Başarılı olursa, `autor_db` veritabanını görebilmelisiniz.

## Sorun Devam Ederse

1. PostgreSQL servisinin çalıştığından emin olun:
   ```powershell
   sc query postgresql-x64-15
   ```

2. PostgreSQL'in varsayılan şifresini kontrol edin (kurulum sırasında belirlediğiniz şifre)

3. `pg_hba.conf` dosyasını kontrol edin (genellikle `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`)


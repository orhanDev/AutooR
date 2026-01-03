# PostgreSQL Bağlantı Sorunu Çözümü

## Sorun
pgAdmin'de şu hata alınıyor:
```
FATAL: Passwort-Authentifizierung für Benutzer "AutooR_user" fehlgeschlagen
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
-- AutooR_user kullanıcısını oluştur
CREATE USER AutooR_user WITH PASSWORD 'Vekil4023.';
ALTER USER AutooR_user CREATEDB;

-- AutooR_db veritabanını oluştur
CREATE DATABASE AutooR_db OWNER AutooR_user;

-- Veritabanına bağlan
\c AutooR_db

-- Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE AutooR_db TO AutooR_user;
```

5. **Yeni bir sunucu bağlantısı oluşturun:**
   - Name: `AutooR Database`
   - Host: `localhost`
   - Port: `5432`
   - Username: `AutooR_user`
   - Password: `Vekil4023.`
   - Database: `AutooR_db`

### Yöntem 2: Şifreyi Değiştirme (Kullanıcı zaten varsa)

Eğer `AutooR_user` kullanıcısı zaten varsa, şifresini değiştirin:

```sql
ALTER USER AutooR_user WITH PASSWORD 'Vekil4023.';
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
- **Username:** `AutooR_user`
- **Password:** `Vekil4023.`
- **Database:** `AutooR_db`

## Test Etme

pgAdmin'de yeni bir sunucu bağlantısı oluşturduktan sonra, bağlantıyı test edin. Başarılı olursa, `AutooR_db` veritabanını görebilmelisiniz.

## Sorun Devam Ederse

1. PostgreSQL servisinin çalıştığından emin olun:
   ```powershell
   sc query postgresql-x64-15
   ```

2. PostgreSQL'in varsayılan şifresini kontrol edin (kurulum sırasında belirlediğiniz şifre)

3. `pg_hba.conf` dosyasını kontrol edin (genellikle `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`)


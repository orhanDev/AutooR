# pgAdmin Bağlantı Sorunu - Adım Adım Çözüm

## Adım 1: PostgreSQL Servisi Durumu ✅
- PostgreSQL servisi çalışıyor: `postgresql-x64-18`
- Port 5432 dinleniyor

## Adım 2: pgAdmin'de Sunucu Özelliklerini Kontrol Edin

1. **pgAdmin'de "localhost" sunucusuna sağ tıklayın**
2. **"Properties" (Özellikler) seçin**
3. **"Connection" sekmesine gidin**
4. **Şu bilgileri kontrol edin:**
   - Host name/address: `localhost` veya `127.0.0.1`
   - Port: `5432`
   - Maintenance database: `postgres`
   - Username: `postgres` (veya başka bir admin kullanıcı)
   - Password: PostgreSQL kurulumunda belirlediğiniz şifre

## Adım 3: Şifreyi Test Edin

Eğer şifreyi bilmiyorsanız veya unuttuysanız:

### Seçenek A: Varsayılan postgres şifresini deneyin
- `admin123` (install-postgresql.bat dosyasında görünen şifre)
- Kurulum sırasında belirlediğiniz şifre

### Seçenek B: Şifreyi sıfırlayın (Windows'ta)

1. **Windows Services'i açın** (Win+R → `services.msc`)
2. **PostgreSQL servisini bulun** (`postgresql-x64-18`)
3. **Servisi durdurun** (sağ tık → Stop)
4. **PostgreSQL data klasörüne gidin** (genellikle `C:\Program Files\PostgreSQL\18\data`)
5. **`pg_hba.conf` dosyasını açın**
6. **İlk satırı şu şekilde değiştirin:**
   ```
   # TYPE  DATABASE        USER            ADDRESS                 METHOD
   host    all             all             127.0.0.1/32            trust
   ```
7. **Servisi başlatın**
8. **pgAdmin'de şifre olmadan bağlanın**
9. **Şifreyi değiştirin:**
   ```sql
   ALTER USER postgres WITH PASSWORD 'yeni_sifreniz';
   ```
10. **`pg_hba.conf` dosyasını geri alın** (md5 veya scram-sha-256)

## Adım 4: autor_user Kullanıcısını Oluşturun

PostgreSQL'e bağlandıktan sonra:

1. **Query Tool'u açın** (sağ tık → Query Tool)
2. **Aşağıdaki SQL'i çalıştırın:**

```sql
-- autor_user kullanıcısını oluştur
CREATE USER autor_user WITH PASSWORD 'Vekil4023.';
ALTER USER autor_user CREATEDB;

-- autor_db veritabanını oluştur
CREATE DATABASE autor_db OWNER autor_user;

-- Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE autor_db TO autor_user;
```

## Adım 5: Yeni Sunucu Bağlantısı Oluşturun

1. **pgAdmin'de "Servers" üzerine sağ tıklayın**
2. **"Register" → "Server" seçin**
3. **General sekmesi:**
   - Name: `AutooR Database`
4. **Connection sekmesi:**
   - Host name/address: `localhost`
   - Port: `5432`
   - Maintenance database: `autor_db`
   - Username: `autor_user`
   - Password: `Vekil4023.`
   - "Save password" seçeneğini işaretleyin
5. **"Save" butonuna tıklayın**

## Adım 6: Veritabanı Tablolarını Oluşturun

1. **"AutooR Database" sunucusuna bağlanın**
2. **"autor_db" veritabanına sağ tıklayın**
3. **Query Tool'u açın**
4. **`db/init.sql` dosyasının içeriğini Query Tool'a yapıştırın**
5. **F5 ile çalıştırın**


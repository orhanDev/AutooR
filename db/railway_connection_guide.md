# Railway PostgreSQL Bağlantı Rehberi

## pgAdmin'de Railway PostgreSQL'e Bağlanma

### Adım 1: pgAdmin'de Yeni Server Oluşturun

1. pgAdmin'i açın
2. Sol panelde **Servers** üzerine sağ tıklayın
3. **Create** → **Server** seçin

### Adım 2: General Sekmesi

- **Name:** `Railway Postgres` (veya istediğiniz bir isim)

### Adım 3: Connection Sekmesi

Aşağıdaki bilgileri girin:

- **Host name/address:** `ballast.proxy.rlwy.net`
- **Port:** `51096`
- **Maintenance database:** `railway`
- **Username:** `postgres`
- **Password:** `AuXmRQKsueCCkRSnlfYKFifvrfYlUBGT`
- **Save password:** ✅ (işaretleyin)

### Adım 4: Advanced Sekmesi (Opsiyonel)

- **DB restriction:** `railway` (sadece bu veritabanını göster)

### Adım 5: Save

**Save** butonuna tıklayın ve bağlantıyı test edin.

## Kullanıcı Oluşturma

Bağlantı başarılı olduktan sonra:

1. **Servers** → **Railway Postgres** → **Databases** → **railway** → **Schemas** → **public** → **Tables** → **users**
2. **users** tablosuna sağ tıklayın → **Query Tool**
3. Aşağıdaki sorguyu çalıştırın:

```sql
-- Railway'de orhancodes@gmail.com kullanıcısını oluştur
INSERT INTO users (
    first_name,
    last_name,
    email,
    password_hash,
    phone_number,
    login_method,
    is_admin,
    is_verified
) VALUES (
    'Orhan',
    'Codes',
    'orhancodes@gmail.com',
    '$2b$10$rQZ8K9vL8mN7jK6hG5fD3sA2qW1eR4tY6uI8oP9lK2jH3gF4dS5aQ6wE7rT8yU9i',
    NULL,
    'email',
    false,
    false
) ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    password_hash = EXCLUDED.password_hash;

-- Kontrol et
SELECT user_id, email, first_name, last_name, created_at 
FROM users 
WHERE LOWER(email) = LOWER('orhancodes@gmail.com');
```

## Alternatif: psql Komutu ile Bağlanma

Terminal/Command Prompt'ta:

```bash
PGPASSWORD=AuXmRQKsueCCkRSnlfYKFifvrfYlUBGT psql -h ballast.proxy.rlwy.net -U postgres -p 51096 -d railway
```

Bağlandıktan sonra yukarıdaki INSERT sorgusunu çalıştırın.


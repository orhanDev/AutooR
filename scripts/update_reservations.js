const { Client } = require('pg');
require('dotenv').config();

async function updateReservations() {
  const connectionConfig = {
    user: process.env.PGUSER || 'cinetime',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'rentacar_db',
    password: process.env.PGPASSWORD || 'Vekil4023.',
    port: Number(process.env.PGPORT || 5432),
  };

  const client = new Client(connectionConfig);

  try {
    console.log('PostgreSQL\'e bağlanılıyor...', connectionConfig);
    await client.connect();
    console.log('Bağlantı başarılı!');

    // Extras alanını ekle
    console.log('\n=== RESERVATIONS TABLOSU GÜNCELLENİYOR ===');
    await client.query('ALTER TABLE reservations ADD COLUMN IF NOT EXISTS extras JSONB;');
    console.log('✅ Extras alanı eklendi');

    // Rezervasyon durumlarını güncelle
    await client.query("UPDATE reservations SET status = 'Beklemede' WHERE status IS NULL OR status = '';");
    console.log('✅ Rezervasyon durumları güncellendi');

    // Örnek rezervasyon verileri ekle
    console.log('\n=== ÖRNEK REZERVASYON VERİLERİ EKLENİYOR ===');
    const insertResult = await client.query(`
      INSERT INTO reservations (
        user_id, car_id, pickup_date, dropoff_date, pickup_time, dropoff_time, 
        pickup_location_id, dropoff_location_id, total_price, status, extras
      ) VALUES 
        (1, 1, '2025-01-15', '2025-01-17', '10:00:00', '18:00:00', 1, 1, 250.00, 'Tamamlandı', '{"insurance": true, "gps": false}'),
        (1, 2, '2025-02-01', '2025-02-03', '09:00:00', '17:00:00', 2, 2, 400.00, 'Onaylandı', '{"insurance": true, "gps": true}'),
        (1, 3, '2025-01-20', '2025-01-22', '14:00:00', '12:00:00', 3, 3, 390.00, 'Beklemede', '{"insurance": false, "gps": false}')
      ON CONFLICT DO NOTHING RETURNING reservation_id;
    `);
    
    if (insertResult.rows.length > 0) {
      console.log(`✅ ${insertResult.rows.length} yeni rezervasyon eklendi`);
    } else {
      console.log('ℹ️ Yeni rezervasyon eklenmedi (zaten mevcut)');
    }

    // Güncel rezervasyonları göster
    console.log('\n=== GÜNCEL REZERVASYONLAR ===');
    const reservations = await client.query(`
      SELECT 
        r.reservation_id,
        r.pickup_date,
        r.dropoff_date,
        r.total_price,
        r.status,
        c.make as car_make,
        c.model as car_model,
        c.year as car_year,
        l.name as pickup_location
      FROM reservations r
      JOIN cars c ON r.car_id = c.car_id
      JOIN locations l ON r.pickup_location_id = l.location_id
      ORDER BY r.created_at DESC
    `);

    if (reservations.rows.length > 0) {
      reservations.rows.forEach((res, index) => {
        console.log(`${index + 1}. ${res.car_make} ${res.car_model} (${res.car_year})`);
        console.log(`   Tarih: ${res.pickup_date} - ${res.dropoff_date}`);
        console.log(`   Lokasyon: ${res.pickup_location}`);
        console.log(`   Durum: ${res.status} | Fiyat: €${res.total_price}`);
        console.log('');
      });
    } else {
      console.log('Henüz rezervasyon bulunmuyor');
    }

    console.log('\n✅ Reservations tablosu güncelleme tamamlandı!');

  } catch (err) {
    console.error('Hata:', err.message, err.stack);
    process.exitCode = 1;
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

updateReservations();

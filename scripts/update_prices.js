const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function updatePrices() {
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

    // Önce mevcut fiyatları kontrol et
    console.log('\n=== MEVCUT FİYATLAR ===');
    const currentPrices = await client.query(`
      SELECT make, model, year, daily_rate 
      FROM cars 
      ORDER BY daily_rate ASC
    `);
    
    currentPrices.rows.forEach(row => {
      console.log(`${row.make} ${row.model} (${row.year}): €${row.daily_rate}`);
    });

    // Fiyat istatistikleri
    const stats = await client.query(`
      SELECT 
        COUNT(*) as toplam_arac,
        MIN(daily_rate) as en_dusuk_fiyat,
        MAX(daily_rate) as en_yuksek_fiyat,
        AVG(daily_rate) as ortalama_fiyat,
        COUNT(CASE WHEN daily_rate < 100 THEN 1 END) as alti_arac
      FROM cars
    `);
    
    console.log('\n=== FİYAT İSTATİSTİKLERİ ===');
    console.log(`Toplam araç: ${stats.rows[0].toplam_arac}`);
    console.log(`En düşük fiyat: €${stats.rows[0].en_dusuk_fiyat}`);
    console.log(`En yüksek fiyat: €${stats.rows[0].en_yuksek_fiyat}`);
    console.log(`Ortalama fiyat: €${Math.round(stats.rows[0].ortalama_fiyat)}`);
    console.log(`100€ altı araç: ${stats.rows[0].alti_arac}`);

    // Fiyat güncelleme scriptini oku ve çalıştır
    console.log('\n=== FİYAT GÜNCELLENİYOR ===');
    const updateSqlPath = path.join(__dirname, '..', 'db', 'update_prices_realistic.sql');
    const updateSql = fs.readFileSync(updateSqlPath, 'utf8');
    
    // SQL komutlarını satır satır çalıştır
    const commands = updateSql.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (command && !command.startsWith('--')) {
        try {
          await client.query(command);
          console.log(`Komut ${i + 1} başarılı`);
        } catch (err) {
          console.log(`Komut ${i + 1} hatası:`, err.message);
        }
      }
    }

    // Güncel fiyatları kontrol et
    console.log('\n=== GÜNCEL FİYATLAR ===');
    const updatedPrices = await client.query(`
      SELECT make, model, year, daily_rate 
      FROM cars 
      ORDER BY daily_rate ASC
    `);
    
    updatedPrices.rows.forEach(row => {
      console.log(`${row.make} ${row.model} (${row.year}): €${row.daily_rate}`);
    });

    // Güncel istatistikler
    const updatedStats = await client.query(`
      SELECT 
        COUNT(*) as toplam_arac,
        MIN(daily_rate) as en_dusuk_fiyat,
        MAX(daily_rate) as en_yuksek_fiyat,
        AVG(daily_rate) as ortalama_fiyat,
        COUNT(CASE WHEN daily_rate < 100 THEN 1 END) as alti_arac
      FROM cars
    `);
    
    console.log('\n=== GÜNCEL FİYAT İSTATİSTİKLERİ ===');
    console.log(`Toplam araç: ${updatedStats.rows[0].toplam_arac}`);
    console.log(`En düşük fiyat: €${updatedStats.rows[0].en_dusuk_fiyat}`);
    console.log(`En yüksek fiyat: €${updatedStats.rows[0].en_yuksek_fiyat}`);
    console.log(`Ortalama fiyat: €${Math.round(updatedStats.rows[0].ortalama_fiyat)}`);
    console.log(`100€ altı araç: ${updatedStats.rows[0].alti_arac}`);

    console.log('\n✅ Fiyat güncelleme tamamlandı!');

  } catch (err) {
    console.error('Hata:', err.message, err.stack);
    process.exitCode = 1;
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

updatePrices();

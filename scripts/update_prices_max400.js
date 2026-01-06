const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function updatePrices() {
    const client = await pool.connect();
    
    try {
        console.log('🚗 Begrenzung der Fahrzeugpreise auf maximal 400€ beginnt...\n');

        console.log('📊 AKTUELLE PREISE:');
        const currentPrices = await client.query(`
            SELECT make, model, daily_rate 
            FROM cars 
            ORDER BY daily_rate DESC 
            LIMIT 10
        `);
        
        currentPrices.rows.forEach(car => {
            console.log(`${car.make} ${car.model}: €${car.daily_rate}`);
        });

        const sqlFilePath = path.join(__dirname, '../db/update_prices_max400.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('\n🔄 Preisaktualisierungen werden durchgeführt...');
        await client.query(sqlContent);

        console.log('\n✅ AKTUALISIERTE PREISE:');
        const updatedPrices = await client.query(`
            SELECT make, model, daily_rate 
            FROM cars 
            ORDER BY daily_rate DESC 
            LIMIT 10
        `);
        
        updatedPrices.rows.forEach(car => {
            console.log(`${car.make} ${car.model}: €${car.daily_rate}`);
        });

        console.log('\n📈 PREISSTATISTIKEN:');
        const stats = await client.query(`
            SELECT 
                COUNT(*) as toplam_arac,
                COUNT(CASE WHEN daily_rate <= 100 THEN 1 END) as "100€ altı",
                COUNT(CASE WHEN daily_rate > 100 AND daily_rate <= 200 THEN 1 END) as "100-200€",
                COUNT(CASE WHEN daily_rate > 200 AND daily_rate <= 300 THEN 1 END) as "200-300€",
                COUNT(CASE WHEN daily_rate > 300 AND daily_rate <= 400 THEN 1 END) as "300-400€",
                COUNT(CASE WHEN daily_rate > 400 THEN 1 END) as "400€ üstü",
                ROUND(AVG(daily_rate), 2) as ortalama_fiyat,
                MIN(daily_rate) as minimum_fiyat,
                MAX(daily_rate) as maksimum_fiyat
            FROM cars
        `);
        
        const data = stats.rows[0];
        console.log(`Gesamtzahl der Fahrzeuge: ${data.toplam_arac}`);
        console.log(`Unter 100€: ${data["100€ altı"]}`);
        console.log(`100-200€: ${data["100-200€"]}`);
        console.log(`200-300€: ${data["200-300€"]}`);
        console.log(`300-400€: ${data["300-400€"]}`);
        console.log(`Über 400€: ${data["400€ üstü"]}`);
        console.log(`Durchschnittspreis: €${data.ortalama_fiyat}`);
        console.log(`Mindestpreis: €${data.minimum_fiyat}`);
        console.log(`Höchstpreis: €${data.maksimum_fiyat}`);
        
        console.log('\n🎉 Alle Fahrzeugpreise erfolgreich aktualisiert!');
        console.log('💡 Maximaler Tagesmietpreis: €400');
        
    } catch (error) {
        console.error('❌ Fehler aufgetreten:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

updatePrices().catch(console.error);
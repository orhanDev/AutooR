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
                COUNT(*) as gesamt_fahrzeuge,
                COUNT(CASE WHEN daily_rate <= 100 THEN 1 END) as unter_100_eur,
                COUNT(CASE WHEN daily_rate > 100 AND daily_rate <= 200 THEN 1 END) as "100_200_eur",
                COUNT(CASE WHEN daily_rate > 200 AND daily_rate <= 300 THEN 1 END) as "200_300_eur",
                COUNT(CASE WHEN daily_rate > 300 AND daily_rate <= 400 THEN 1 END) as "300_400_eur",
                COUNT(CASE WHEN daily_rate > 400 THEN 1 END) as ueber_400_eur,
                ROUND(AVG(daily_rate), 2) as durchschnittspreis,
                MIN(daily_rate) as mindestpreis,
                MAX(daily_rate) as hoechstpreis
            FROM cars
        `);
        
        const data = stats.rows[0];
        console.log(`Gesamtzahl der Fahrzeuge: ${data.gesamt_fahrzeuge}`);
        console.log(`Unter 100€: ${data.unter_100_eur}`);
        console.log(`100-200€: ${data["100_200_eur"]}`);
        console.log(`200-300€: ${data["200_300_eur"]}`);
        console.log(`300-400€: ${data["300_400_eur"]}`);
        console.log(`Über 400€: ${data.ueber_400_eur}`);
        console.log(`Durchschnittspreis: €${data.durchschnittspreis}`);
        console.log(`Mindestpreis: €${data.mindestpreis}`);
        console.log(`Höchstpreis: €${data.hoechstpreis}`);
        
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
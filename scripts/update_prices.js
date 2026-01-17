const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function updatePrices() {
  const connectionConfig = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT || 5432),
  };

  const client = new Client(connectionConfig);

  try {
    console.log('Verbindung zu PostgreSQL wird hergestellt...', connectionConfig);
    await client.connect();
    console.log('Verbindung erfolgreich!');

    console.log('\n=== AKTUELLE PREISE ===');
    const currentPrices = await client.query(`
      SELECT make, model, year, daily_rate 
      FROM cars 
      ORDER BY daily_rate ASC
    `);
    
    currentPrices.rows.forEach(row => {
      console.log(`${row.make} ${row.model} (${row.year}): €${row.daily_rate}`);
    });

    const stats = await client.query(`
      SELECT 
        COUNT(*) as gesamt_fahrzeuge,
        MIN(daily_rate) as niedrigster_preis,
        MAX(daily_rate) as hoechster_preis,
        AVG(daily_rate) as durchschnittspreis,
        COUNT(CASE WHEN daily_rate < 100 THEN 1 END) as fahrzeuge_unter_100
      FROM cars
    `);
    
    console.log('\n=== PREISSTATISTIKEN ===');
    console.log(`Gesamt Fahrzeuge: ${stats.rows[0].gesamt_fahrzeuge}`);
    console.log(`Niedrigster Preis: €${stats.rows[0].niedrigster_preis}`);
    console.log(`Höchster Preis: €${stats.rows[0].hoechster_preis}`);
    console.log(`Durchschnittspreis: €${Math.round(stats.rows[0].durchschnittspreis)}`);
    console.log(`Fahrzeuge unter 100€: ${stats.rows[0].fahrzeuge_unter_100}`);

    console.log('\n=== PREISE WERDEN AKTUALISIERT ===');
    const updateSqlPath = path.join(__dirname, '..', 'db', 'update_prices_realistic.sql');
    const updateSql = fs.readFileSync(updateSqlPath, 'utf8');

    const commands = updateSql.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (command && !command.startsWith('--')) {
        try {
          await client.query(command);
          console.log(`Befehl ${i + 1} erfolgreich`);
        } catch (err) {
          console.log(`Befehl ${i + 1} Fehler:`, err.message);
        }
      }
    }

    console.log('\n=== AKTUELLE PREISE ===');
    const updatedPrices = await client.query(`
      SELECT make, model, year, daily_rate 
      FROM cars 
      ORDER BY daily_rate ASC
    `);
    
    updatedPrices.rows.forEach(row => {
      console.log(`${row.make} ${row.model} (${row.year}): €${row.daily_rate}`);
    });

    const updatedStats = await client.query(`
      SELECT 
        COUNT(*) as gesamt_fahrzeuge,
        MIN(daily_rate) as niedrigster_preis,
        MAX(daily_rate) as hoechster_preis,
        AVG(daily_rate) as durchschnittspreis,
        COUNT(CASE WHEN daily_rate < 100 THEN 1 END) as fahrzeuge_unter_100
      FROM cars
    `);
    
    console.log('\n=== AKTUELLE PREISSTATISTIKEN ===');
    console.log(`Gesamtzahl der Fahrzeuge: ${updatedStats.rows[0].gesamt_fahrzeuge}`);
    console.log(`Niedrigster Preis: €${updatedStats.rows[0].niedrigster_preis}`);
    console.log(`Höchster Preis: €${updatedStats.rows[0].hoechster_preis}`);
    console.log(`Durchschnittspreis: €${Math.round(updatedStats.rows[0].durchschnittspreis)}`);
    console.log(`Fahrzeuge unter 100€: ${updatedStats.rows[0].fahrzeuge_unter_100}`);

    console.log('\n✅ Preisaktualisierung abgeschlossen!');

  } catch (err) {
    console.error('Fehler:', err.message, err.stack);
    process.exitCode = 1;
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

updatePrices();
const { Client } = require('pg');
require('dotenv').config();

async function updateReservations() {
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

    // Extras-Feld hinzufügen
    console.log('\n=== RESERVATIONS-TABELLE WIRD AKTUALISIERT ===');
    await client.query('ALTER TABLE reservations ADD COLUMN IF NOT EXISTS extras JSONB;');
    console.log('✅ Extras-Feld hinzugefügt');

    // Reservierungsstatus aktualisieren
    await client.query("UPDATE reservations SET status = 'Beklemede' WHERE status IS NULL OR status = '';");
    console.log('✅ Reservierungsstatus aktualisiert');

    // Beispielreservierungsdaten hinzufügen
    console.log('\n=== BEISPIELRESERVIERUNGSDATEN WERDEN HINZUGEFÜGT ===');
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
      console.log(`✅ ${insertResult.rows.length} neue Reservierungen hinzugefügt`);
    } else {
      console.log('ℹ️ Keine neuen Reservierungen hinzugefügt (bereits vorhanden)');
    }

    // Aktuelle Reservierungen anzeigen
    console.log('\n=== AKTUELLE RESERVIERUNGEN ===');
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
        console.log(`   Datum: ${res.pickup_date} - ${res.dropoff_date}`);
        console.log(`   Standort: ${res.pickup_location}`);
        console.log(`   Status: ${res.status} | Preis: €${res.total_price}`);
        console.log('');
      });
    } else {
      console.log('Noch keine Reservierungen vorhanden');
    }

    console.log('\n✅ Aktualisierung der Reservations-Tabelle abgeschlossen!');

  } catch (err) {
    console.error('Fehler:', err.message, err.stack);
    process.exitCode = 1;
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

updateReservations();

const { Client } = require('pg');
require('dotenv').config();

async function fixUsersTable() {
  const connectionConfig = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT || 5432),
  };

  const client = new Client(connectionConfig);

  try {
    console.log('Verbinde mit PostgreSQL...', connectionConfig);
    await client.connect();
    console.log('Verbindung erfolgreich!');

    // Users tablosuna eksik sütunları ekle
    console.log('Füge fehlende Spalten zur Users-Tabelle hinzu...');
    
    const alterTableQuery = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS payment_card_json JSONB,
      ADD COLUMN IF NOT EXISTS payment_paypal_json JSONB,
      ADD COLUMN IF NOT EXISTS payment_klarna_json JSONB;
    `;
    
    await client.query(alterTableQuery);
    console.log('Users-Tabelle erfolgreich aktualisiert!');

    // Tablo yapısını kontrol et
    const checkTableQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `;
    
    const result = await client.query(checkTableQuery);
    console.log('Users-Tabelle Struktur:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });

  } catch (err) {
    console.error('Fehler:', err.message, err.stack);
    process.exitCode = 1;
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

fixUsersTable();

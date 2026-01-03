const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function createPasswordResetTable() {
  const connectionConfig = {
    user: process.env.PGUSER || 'AutooR_user',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'AutooR',
    password: process.env.PGPASSWORD || 'Vekil4023.',
    port: Number(process.env.PGPORT || 5432),
  };

  const client = new Client(connectionConfig);

  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Connected successfully.');

    // Check if table exists
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'password_reset_tokens'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('✅ password_reset_tokens table already exists.');
      return;
    }

    console.log('Creating password_reset_tokens table...');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'db', 'create_password_reset_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL
    await client.query(sql);
    console.log('✅ password_reset_tokens table created successfully.');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);
    process.exitCode = 1;
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

createPasswordResetTable();


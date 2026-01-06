const path = require('path');
const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const connectionConfig = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT || 5432),
  };

  const client = new Client(connectionConfig);

  try {
    console.log('Connecting to PostgreSQL...', connectionConfig);
    await client.connect();
    console.log('Connected. Ensuring required extensions...');
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    } catch (e) {
      console.warn('Warning: pgcrypto extension could not be created (continuing):', e.message);
    }

    const initSqlPath = path.join(__dirname, '..', 'db', 'init.sql');
    const seedSqlPath = path.join(__dirname, '..', 'db', 'seed.sql');

    console.log('Running init.sql:', initSqlPath);
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    if (initSql.trim().length > 0) {
      await client.query(initSql);
      console.log('init.sql executed successfully.');
    } else {
      console.log('init.sql is empty or missing content.');
    }

    console.log('Running seed.sql:', seedSqlPath);
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
    if (seedSql.trim().length > 0) {
      await client.query(seedSql);
      console.log('seed.sql executed successfully.');
    } else {
      console.log('seed.sql is empty or missing content.');
    }

    console.log('Database initialization and seeding completed.');
  } catch (err) {
    console.error('DB setup error:', err.message, err.stack);
    process.exitCode = 1;
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

run();
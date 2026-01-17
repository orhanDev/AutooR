/**
 * Migration script to add personal data columns to users table
 * Run this script to add date_of_birth, city, postal_code, country columns
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration - use same config as database.js
const pool = new Pool({
    user: process.env.PGUSER || process.env.DB_USER || 'AutooR_user',
    host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
    database: process.env.PGDATABASE || process.env.DB_NAME || 'AutooR_db',
    password: process.env.PGPASSWORD || process.env.DB_PASSWORD || 'AutooR_password123',
    port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
});

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log('Starting migration: Add personal data columns to users table...');
        
        // Read migration files
        const migrationPath1 = path.join(__dirname, '../db/migrate_add_personal_data_columns.sql');
        const migrationSQL1 = fs.readFileSync(migrationPath1, 'utf8');
        
        const migrationPath2 = path.join(__dirname, '../db/migrate_add_gender_column.sql');
        const migrationSQL2 = fs.readFileSync(migrationPath2, 'utf8');
        
        // Execute migrations
        await client.query(migrationSQL1);
        await client.query(migrationSQL2);
        
        console.log('✅ Migration completed successfully!');
        console.log('Added columns: date_of_birth, gender, city, postal_code, country');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run migration
runMigration()
    .then(() => {
        console.log('Migration script completed.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration script failed:', error);
        process.exit(1);
    });

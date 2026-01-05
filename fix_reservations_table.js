const { Pool } = require('pg');

const pool = new Pool({
    user: 'AutooR_user',
    host: 'localhost',
    database: 'AutooR_db',
    password: 'Vekil4023.',
    port: 5432
});

async function fixReservationsTable() {
    try {
        console.log('Reservations tablosunu güncelleniyor...');

        const columns = [
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS vehicle_image TEXT;',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(255);',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS dropoff_location VARCHAR(255);',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS pickup_date DATE;',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS pickup_time TIME;',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS dropoff_date DATE;',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS dropoff_time TIME;',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2);',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS insurance_price DECIMAL(10,2);',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS extras_price DECIMAL(10,2);',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS insurance_type VARCHAR(100);',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS extras JSONB;',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT \'pending\';',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT \'confirmed\';',
            'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;'
        ];
        
        for (const column of columns) {
            await pool.query(column);
            console.log('✓ Sütun eklendi:', column.split(' ')[5]);
        }
        
        console.log('✅ Reservations tablosu başarıyla güncellendi!');
        
    } catch (error) {
        console.error('❌ Hata:', error.message);
    } finally {
        await pool.end();
    }
}

fixReservationsTable();

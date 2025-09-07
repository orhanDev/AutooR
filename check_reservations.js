const { Pool } = require('pg');

const pool = new Pool({
    user: 'autor_user',
    host: 'localhost',
    database: 'autor_db',
    password: 'Vekil4023.',
    port: 5432
});

async function checkReservations() {
    try {
        const result = await pool.query(`
            SELECT 
                booking_id,
                user_id,
                vehicle_name,
                pickup_date,
                return_date,
                total_price,
                payment_status,
                created_at
            FROM reservations 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        
        console.log('Son 10 rezervasyon:');
        console.log('==================');
        
        if (result.rows.length === 0) {
            console.log('Hiç rezervasyon bulunamadı!');
        } else {
            result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.booking_id}`);
                console.log(`   User ID: ${row.user_id}`);
                console.log(`   Araç: ${row.vehicle_name}`);
                console.log(`   Tarih: ${row.pickup_date} - ${row.return_date}`);
                console.log(`   Fiyat: €${row.total_price}`);
                console.log(`   Ödeme: ${row.payment_status}`);
                console.log(`   Oluşturulma: ${row.created_at}`);
                console.log('   ---');
            });
        }
        
    } catch (error) {
        console.error('Hata:', error.message);
    } finally {
        await pool.end();
    }
}

checkReservations();

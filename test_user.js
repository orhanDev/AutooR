const { Pool } = require('pg');

const pool = new Pool({
    user: 'autor_user',
    host: 'localhost',
    database: 'autor_db',
    password: 'Vekil4023.',
    port: 5432
});

async function testUser() {
    try {
        // Kullanıcıyı kontrol et
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', ['orhancodes@gmail.com']);
        console.log('User found:', userResult.rows.length > 0);
        if (userResult.rows.length > 0) {
            console.log('User data:', userResult.rows[0]);
        }
        
        // Rezervasyon tablosunu kontrol et
        const tableResult = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'reservations'
            ORDER BY ordinal_position
        `);
        console.log('Reservations table columns:');
        tableResult.rows.forEach(row => {
            console.log(`  ${row.column_name}: ${row.data_type}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

testUser();

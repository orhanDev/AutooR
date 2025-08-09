const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

// Bağlantı başarılı olduğunda logla
pool.on('connect', () => {
    console.log('PostgreSQL veritabanına başarıyla bağlandı!');
});

// Hata durumunda logla
pool.on('error', (err, client) => {
    console.error('PostgreSQL bağlantı hatası:', err.message, err.stack);
});

module.exports = {
    query: (text, params) => {
        console.log('Sorgu yürütülüyor:', text, params || '');
        return pool.query(text, params)
            .then(res => {
                console.log('Sorgu sonucu:', res.rows.length, 'satır döndü');
                return res;
            })
            .catch(err => {
                console.error('Sorgu yürütme hatası:', err.message, err.stack);
                throw err;
            });
    },
};
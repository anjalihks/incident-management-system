const { Pool } = require('pg');

const pool = new Pool({
  user: 'ims_user',
  host: '127.0.0.1',
  database: 'ims_db',
  password: 'ims_pass',
  port: 5432,
});

pool.on('connect', () => {
  console.log('🐘 PostgreSQL Connected');
});

pool.on('error', (err) => {
  console.error('❌ Postgres Error:', err);
});

module.exports = pool;
const { Pool } = require('pg');

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

async function updateSessionsTable() {
    try {
        await pool.query(`
            ALTER TABLE Sessions 
            ADD COLUMN IF NOT EXISTS analysis_image_url TEXT,
            ADD COLUMN IF NOT EXISTS analysis_description TEXT,
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING'
        `);
        
        console.log('Sessions table updated successfully');
    } catch (err) {
        console.error('Failed to update Sessions table:', err);
    } finally {
        await pool.end();
    }
}

updateSessionsTable(); 
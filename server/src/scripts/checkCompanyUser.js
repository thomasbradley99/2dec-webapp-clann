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

async function checkCompanyUser() {
    try {
        const result = await pool.query(`
            SELECT id, email, role, created_at 
            FROM Users 
            WHERE email = 'thomas@clann.coach'
        `);
        
        if (result.rows.length > 0) {
            console.log('Company user exists:', result.rows[0]);
        } else {
            console.log('Company user not found');
        }
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await pool.end();
    }
}

checkCompanyUser(); 
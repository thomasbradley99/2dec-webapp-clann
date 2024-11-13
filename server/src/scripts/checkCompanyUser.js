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
            WHERE role = 'COMPANY_MEMBER'
        `);
        
        console.log('\nCompany Users:');
        console.table(result.rows);
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await pool.end();
    }
}

checkCompanyUser(); 
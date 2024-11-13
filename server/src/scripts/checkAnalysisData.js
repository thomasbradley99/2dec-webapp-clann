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

async function checkAnalysisData() {
    try {
        const analysis = await pool.query(`
            SELECT 
                a.*,
                s.footage_url as session_footage_url,
                s.status as session_status,
                u.email as analyst_email
            FROM Analysis a
            LEFT JOIN Sessions s ON a.session_id = s.id
            LEFT JOIN Users u ON a.analyst_id = u.id
            ORDER BY a.created_at DESC;
        `);
        
        console.log('\nCurrent Analysis Data:');
        console.table(analysis.rows);
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await pool.end();
    }
}

checkAnalysisData(); 
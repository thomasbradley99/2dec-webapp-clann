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

async function checkSessionsData() {
    try {
        const sessions = await pool.query(`
            SELECT 
                s.*,
                t.name as team_name,
                u.email as uploaded_by_email,
                COUNT(a.id) as analysis_count
            FROM Sessions s
            LEFT JOIN Teams t ON s.team_id = t.id
            LEFT JOIN Users u ON s.uploaded_by = u.id
            LEFT JOIN Analysis a ON s.id = a.session_id
            GROUP BY s.id, t.name, u.email
            ORDER BY s.created_at DESC;
        `);
        
        console.log('\nCurrent Sessions Data:');
        console.table(sessions.rows);

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await pool.end();
    }
}

checkSessionsData(); 
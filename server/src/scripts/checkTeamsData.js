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

async function checkTeamsData() {
    try {
        const teams = await pool.query(`
            SELECT 
                t.*,
                COUNT(DISTINCT tm.user_id) as member_count,
                COUNT(DISTINCT s.id) as session_count
            FROM Teams t
            LEFT JOIN TeamMembers tm ON t.id = tm.team_id
            LEFT JOIN Sessions s ON t.id = s.team_id
            GROUP BY t.id
            ORDER BY t.created_at DESC;
        `);
        
        console.log('\nTeams Data:');
        console.table(teams.rows);
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await pool.end();
    }
}

checkTeamsData(); 
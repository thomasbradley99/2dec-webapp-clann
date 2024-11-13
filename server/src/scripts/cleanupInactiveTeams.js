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

async function cleanupInactiveTeams() {
    try {
        await pool.query('BEGIN');

        // Delete teams with no members AND no sessions
        const deletedTeams = await pool.query(`
            DELETE FROM Teams t
            WHERE NOT EXISTS (
                SELECT 1 FROM TeamMembers tm WHERE tm.team_id = t.id
            )
            AND NOT EXISTS (
                SELECT 1 FROM Sessions s WHERE s.team_id = t.id
            )
            RETURNING *;
        `);

        await pool.query('COMMIT');

        console.log(`\nDeleted ${deletedTeams.rowCount} inactive teams:`);
        console.table(deletedTeams.rows);

        // Show remaining teams
        const remaining = await pool.query(`
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

        console.log('\nRemaining Teams:');
        console.table(remaining.rows);

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Cleanup failed:', err);
    } finally {
        await pool.end();
    }
}

cleanupInactiveTeams(); 
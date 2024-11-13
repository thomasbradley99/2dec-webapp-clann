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

async function cleanupTestData() {
    try {
        await pool.query('BEGIN');

        // 1. First standardize all team names (remove spaces between name and number)
        await pool.query(`
            UPDATE Teams 
            SET name = REGEXP_REPLACE(TRIM(name), '\\s+(\\d+)', '\\1', 'g')
            WHERE name ~ '\\s+\\d+'
        `);

        // 2. Now handle duplicates with standardized names
        const duplicateTeams = await pool.query(`
            WITH TeamActivity AS (
                SELECT 
                    t.id,
                    t.name,
                    t.created_at,
                    COUNT(DISTINCT tm.user_id) as member_count,
                    COUNT(DISTINCT s.id) as session_count,
                    ROW_NUMBER() OVER (
                        PARTITION BY LOWER(t.name)
                        ORDER BY 
                            COUNT(DISTINCT tm.user_id) DESC,
                            COUNT(DISTINCT s.id) DESC,
                            t.created_at DESC
                    ) as rank
                FROM Teams t
                LEFT JOIN TeamMembers tm ON t.id = tm.team_id
                LEFT JOIN Sessions s ON t.id = s.team_id
                GROUP BY t.id, t.name, t.created_at
            )
            SELECT id, name
            FROM TeamActivity
            WHERE rank > 1;
        `);

        const teamsToDelete = duplicateTeams.rows.map(t => t.id);

        // 3. Move sessions from duplicates to primary teams and delete duplicates
        if (teamsToDelete.length > 0) {
            for (let teamId of teamsToDelete) {
                const primaryTeam = await pool.query(`
                    SELECT t2.id as primary_id 
                    FROM Teams t1 
                    JOIN Teams t2 ON LOWER(t1.name) = LOWER(t2.name) 
                    WHERE t1.id = $1 
                    AND t2.id != $1 
                    ORDER BY 
                        (SELECT COUNT(*) FROM TeamMembers WHERE team_id = t2.id) DESC,
                        (SELECT COUNT(*) FROM Sessions WHERE team_id = t2.id) DESC,
                        t2.created_at DESC 
                    LIMIT 1
                `, [teamId]);

                if (primaryTeam.rows.length > 0) {
                    await pool.query(`
                        UPDATE Sessions 
                        SET team_id = $1 
                        WHERE team_id = $2
                    `, [primaryTeam.rows[0].primary_id, teamId]);
                }
            }

            // Delete the duplicates
            const deletedTeams = await pool.query(`
                DELETE FROM Teams 
                WHERE id = ANY($1::uuid[])
                RETURNING *
            `, [teamsToDelete]);

            console.log(`\nDeleted ${deletedTeams.rowCount} duplicate teams`);
        }

        await pool.query('COMMIT');

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

cleanupTestData(); 
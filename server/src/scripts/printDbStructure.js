const { Pool } = require("pg");
const path = require('path');
require("dotenv").config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false,
        sslmode: 'require'
    }
});

async function printDatabaseStructure() {
    try {
        // Your existing structure printing code...

        // Add these new sections:
        console.log('\n=== ANALYSIS DATA ===');
        const analyses = await pool.query(`
            SELECT 
                a.id,
                a.session_id,
                a.type,
                a.image_url,
                a.created_at,
                s.status as session_status
            FROM analysis a
            LEFT JOIN sessions s ON a.session_id = s.id
            ORDER BY a.created_at DESC;
        `);
        console.table(analyses.rows);

        console.log('\n=== ANALYSIS BY TYPE ===');
        const typeCount = await pool.query(`
            SELECT 
                type, 
                COUNT(*) as count,
                array_agg(session_id) as session_ids
            FROM analysis
            GROUP BY type;
        `);
        console.table(typeCount.rows);

        console.log('\n=== SESSIONS WITH ANALYSIS COUNT ===');
        const sessionCount = await pool.query(`
            SELECT 
                s.id as session_id,
                s.status,
                COUNT(a.id) as analysis_count,
                array_agg(a.type) as analysis_types
            FROM sessions s
            LEFT JOIN analysis a ON s.id = a.session_id
            GROUP BY s.id, s.status;
        `);
        console.table(sessionCount.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

printDatabaseStructure().catch(console.error); 
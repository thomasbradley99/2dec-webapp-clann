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

async function checkAnalysisTable() {
    try {
        console.log('\n=== Analysis Table Structure ===');
        const schema = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'analysis'
            ORDER BY ordinal_position;
        `);
        console.table(schema.rows);

        console.log('\n=== All Analysis Records ===');
        const analyses = await pool.query(`
            SELECT 
                a.id,
                a.session_id,
                a.analyst_id,
                a.description,
                a.image_url,
                a.type,
                a.created_at,
                s.status as session_status
            FROM analysis a
            LEFT JOIN sessions s ON a.session_id = s.id
            ORDER BY a.created_at DESC;
        `);
        console.table(analyses.rows);

        console.log('\n=== Analysis Count by Type ===');
        const typeCount = await pool.query(`
            SELECT type, COUNT(*) as count
            FROM analysis
            GROUP BY type;
        `);
        console.table(typeCount.rows);

        console.log('\n=== Sessions with Analysis Count ===');
        const sessionCount = await pool.query(`
            SELECT 
                s.id as session_id,
                s.status,
                COUNT(a.id) as analysis_count
            FROM sessions s
            LEFT JOIN analysis a ON s.id = a.session_id
            GROUP BY s.id, s.status;
        `);
        console.table(sessionCount.rows);

    } catch (error) {
        console.error('Error checking analysis table:', error);
    } finally {
        await pool.end();
    }
}

checkAnalysisTable().catch(console.error); 
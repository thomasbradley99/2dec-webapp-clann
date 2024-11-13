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

async function checkTableStructure() {
    try {
        // Get table columns for Sessions
        const sessionsColumns = await pool.query(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'sessions'
            ORDER BY ordinal_position;
        `);
        
        console.log('\nSessions Table Structure:');
        console.table(sessionsColumns.rows);

        // Get table columns for Analysis
        const analysisColumns = await pool.query(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'analysis'
            ORDER BY ordinal_position;
        `);
        
        console.log('\nAnalysis Table Structure:');
        console.table(analysisColumns.rows);

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await pool.end();
    }
}

checkTableStructure(); 
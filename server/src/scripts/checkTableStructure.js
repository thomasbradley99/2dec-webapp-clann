const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'clann-db-11nov.cfcgo2cma4or.eu-west-1.rds.amazonaws.com',
    database: 'postgres',
    password: 'ClannPass123!',
    port: 5432,
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
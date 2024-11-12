const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'clann-db-11nov.cfcgo2cma4or.eu-west-1.rds.amazonaws.com',
    database: 'postgres',
    password: 'ClannPass123!',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

async function updateSessionsTable() {
    try {
        await pool.query(`
            ALTER TABLE Sessions 
            ADD COLUMN IF NOT EXISTS analysis_image_url TEXT,
            ADD COLUMN IF NOT EXISTS analysis_description TEXT,
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING'
        `);
        
        console.log('Sessions table updated successfully');
    } catch (err) {
        console.error('Failed to update Sessions table:', err);
    } finally {
        await pool.end();
    }
}

updateSessionsTable(); 
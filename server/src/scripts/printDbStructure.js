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
        // Get tables
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('\n=== TABLES ===');
        console.table(tables.rows);

        // Get Sessions structure
        console.log('\n=== SESSIONS TABLE ===');
        const sessions = await pool.query(`
            SELECT * FROM sessions LIMIT 5;
        `);
        console.table(sessions.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

printDatabaseStructure(); 
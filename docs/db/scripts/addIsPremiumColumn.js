const { Pool } = require('pg');
require('dotenv').config({ path: '../../server/.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

async function addIsPremiumColumn() {
    try {
        await pool.query(`
            ALTER TABLE Teams 
            ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
        `);
        console.log('Successfully added is_premium column to Teams table');
    } catch (error) {
        console.error('Error adding is_premium column:', error);
    } finally {
        await pool.end();
    }
}

addIsPremiumColumn(); 
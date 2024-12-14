const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../server/.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

async function addNameColumns() {
    try {
        await pool.query(`
            ALTER TABLE Users 
            ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
        `);
        console.log('Successfully added name columns');
    } catch (error) {
        console.error('Error adding name columns:', error);
    } finally {
        await pool.end();
    }
}

addNameColumns(); 
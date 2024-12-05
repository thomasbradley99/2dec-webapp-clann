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

async function addSubscriptionColumns() {
    try {
        await pool.query(`
            ALTER TABLE Teams 
            ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'FREE'
                CHECK (subscription_status IN ('FREE', 'TRIAL', 'PREMIUM')),
            ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
        console.log('Successfully added subscription columns to Teams table');
    } catch (error) {
        console.error('Error adding subscription columns:', error);
    } finally {
        await pool.end();
    }
}

addSubscriptionColumns(); 
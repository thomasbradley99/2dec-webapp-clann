const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

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

async function createCompanyUser() {
    try {
        const hashedPassword = await bcrypt.hash('clannpass99', 10);
        
        await pool.query(`
            INSERT INTO Users (id, email, password_hash, role)
            VALUES ($1, $2, $3, 'COMPANY_MEMBER')
            ON CONFLICT (email) DO NOTHING
        `, [uuidv4(), 'thomas@clann.coach', hashedPassword]);
        
        console.log('Company user created successfully');
    } catch (err) {
        console.error('Failed to create company user:', err);
    } finally {
        await pool.end();
    }
}

createCompanyUser(); 
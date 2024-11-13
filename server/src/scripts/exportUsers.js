const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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

async function exportUsers() {
    try {
        const result = await pool.query('SELECT id, email, role, created_at FROM Users');
        const headers = ['ID', 'Email', 'Role', 'Created At'];
        const csvData = [
            headers.join(','),
            ...result.rows.map(row => [
                row.id,
                row.email,
                row.role,
                row.created_at
            ].join(','))
        ].join('\n');

        fs.writeFileSync(path.join(__dirname, 'users.csv'), csvData);
        console.log('Users exported to users.csv');
    } catch (err) {
        console.error('Export failed:', err);
    } finally {
        await pool.end();
    }
}

exportUsers(); 
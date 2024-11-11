const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: 'postgres',
    host: 'clann-db-11nov.cfcgo2cma4or.eu-west-1.rds.amazonaws.com',
    database: 'postgres',
    password: 'ClannPass123!',
    port: 5432,
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
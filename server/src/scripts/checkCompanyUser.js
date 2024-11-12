const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'clann-db-11nov.cfcgo2cma4or.eu-west-1.rds.amazonaws.com',
    database: 'postgres',
    password: 'ClannPass123!',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

async function checkCompanyUser() {
    try {
        const result = await pool.query(`
            SELECT id, email, role, created_at 
            FROM Users 
            WHERE email = 'thomas@clann.coach'
        `);
        
        if (result.rows.length > 0) {
            console.log('Company user exists:', result.rows[0]);
        } else {
            console.log('Company user not found');
        }
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await pool.end();
    }
}

checkCompanyUser(); 
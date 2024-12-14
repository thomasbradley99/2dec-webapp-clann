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

async function getCurrentSchema() {
    try {
        // Get tables in correct order
        const tables = await pool.query(`
            SELECT tablename as table_name
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        `);

        console.log('-- Current Database Schema\n');
        console.log('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n');

        for (const table of tables.rows) {
            const tableName = table.table_name;

            // Get columns
            const columns = await pool.query(`
                SELECT 
                    column_name,
                    data_type,
                    character_maximum_length,
                    column_default,
                    is_nullable
                FROM information_schema.columns
                WHERE table_name = $1
                ORDER BY ordinal_position;
            `, [tableName]);

            // Get constraints
            const constraints = await pool.query(`
                SELECT pg_get_constraintdef(c.oid) as constraint_def
                FROM pg_constraint c
                JOIN pg_class t ON c.conrelid = t.oid
                WHERE t.relname = $1;
            `, [tableName]);

            console.log(`-- Table: ${tableName}`);
            console.log(`CREATE TABLE ${tableName} (`);
            console.log('    ' + columns.rows.map(col => `    ${col.column_name} ${col.data_type}
                ${col.character_maximum_length ? '(' + col.character_maximum_length + ')' : ''}
                ${col.is_nullable === 'NO' ? ' NOT NULL' : ''}
                ${col.column_default ? ' DEFAULT ' + col.column_default : ''}`).join(',\n    '));
            if (constraints.rows.length > 0) {
                console.log('    -- Constraints');
                console.log('    ' + constraints.rows.map(constraint => `    ${constraint.constraint_def}`).join(',\n    '));
            }
            console.log(');\n');
        }

    } catch (err) {
        console.error('Error getting schema:', err);
    } finally {
        await pool.end();
    }
}

getCurrentSchema(); 
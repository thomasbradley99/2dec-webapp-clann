require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

async function dumpDbData() {
    try {
        let output = '';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `db-dump-${timestamp}.txt`;

        // Teams Data
        const teams = await pool.query(`
            SELECT 
                t.*,
                COUNT(DISTINCT tm.user_id) as member_count,
                COUNT(DISTINCT s.id) as session_count
            FROM Teams t
            LEFT JOIN TeamMembers tm ON t.id = tm.team_id
            LEFT JOIN Sessions s ON t.id = s.team_id
            GROUP BY t.id
            ORDER BY t.created_at DESC;
        `);
        output += '=== TEAMS ===\n';
        output += JSON.stringify(teams.rows, null, 2) + '\n\n';

        // Sessions Data
        const sessions = await pool.query(`
            SELECT 
                s.*,
                t.name as team_name,
                u.email as uploaded_by_email,
                COUNT(a.id) as analysis_count
            FROM Sessions s
            LEFT JOIN Teams t ON s.team_id = t.id
            LEFT JOIN Users u ON s.uploaded_by = u.id
            LEFT JOIN Analysis a ON s.id = a.session_id
            GROUP BY s.id, t.name, u.email
            ORDER BY s.created_at DESC;
        `);
        output += '=== SESSIONS ===\n';
        output += JSON.stringify(sessions.rows, null, 2) + '\n\n';

        // Analysis Data
        const analysis = await pool.query(`
            SELECT 
                a.*,
                s.footage_url as session_footage_url,
                s.status as session_status,
                u.email as analyst_email
            FROM Analysis a
            LEFT JOIN Sessions s ON a.session_id = s.id
            LEFT JOIN Users u ON a.analyst_id = u.id
            ORDER BY a.created_at DESC;
        `);
        output += '=== ANALYSIS ===\n';
        output += JSON.stringify(analysis.rows, null, 2) + '\n\n';

        // Users Data (excluding sensitive info)
        const users = await pool.query(`
            SELECT 
                id,
                email,
                role,
                created_at
            FROM Users
            ORDER BY created_at DESC;
        `);
        output += '=== USERS ===\n';
        output += JSON.stringify(users.rows, null, 2) + '\n\n';

        // Team Members
        const teamMembers = await pool.query(`
            SELECT 
                tm.*,
                t.name as team_name,
                u.email as user_email
            FROM TeamMembers tm
            JOIN Teams t ON tm.team_id = t.id
            JOIN Users u ON tm.user_id = u.id
            ORDER BY tm.joined_at DESC;
        `);
        output += '=== TEAM MEMBERS ===\n';
        output += JSON.stringify(teamMembers.rows, null, 2) + '\n\n';

        // Write to file
        const filePath = path.join(__dirname, '..', '..', 'db-dumps', fileName);
        
        // Create db-dumps directory if it doesn't exist
        const dirPath = path.join(__dirname, '..', '..', 'db-dumps');
        if (!fs.existsSync(dirPath)){
            fs.mkdirSync(dirPath);
        }

        fs.writeFileSync(filePath, output);
        console.log(`Database dump created: ${fileName}`);

    } catch (err) {
        console.error('Database dump failed:', err);
    } finally {
        await pool.end();
    }
}

dumpDbData(); 
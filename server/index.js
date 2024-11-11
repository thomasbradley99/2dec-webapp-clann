const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const sessionsRoutes = require('./routes/sessions');

// Create Express server
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/sessions', sessionsRoutes);

// Connect to AWS RDS
const pool = new Pool({
    user: 'postgres',
    host: 'clann-db-11nov.cfcgo2cma4or.eu-west-1.rds.amazonaws.com',
    database: 'postgres',
    password: 'ClannPass123!',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

// Handle registration requests
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO Users (...) VALUES (...)',
            [email, hashedPassword, 'USER']
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Handle session creation
app.post('/api/sessions/create', async (req, res) => {
    const { footage_url, team_name } = req.body;
    try {
        // First create team
        const teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const teamResult = await pool.query(
            'INSERT INTO Teams (name, team_code) VALUES ($1, $2) RETURNING id',
            [team_name, teamCode]
        );
        
        // Then create session
        const result = await pool.query(
            'INSERT INTO Sessions (team_id, footage_url, game_date, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [teamResult.rows[0].id, footage_url, new Date(), 'PENDING']
        );
        
        res.json({
            ...result.rows[0],
            team_code: teamCode
        });
    } catch (err) {
        console.error('Session creation failed:', err);
        res.status(500).json({ error: err.message });
    }
});
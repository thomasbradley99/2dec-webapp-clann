const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Create Express server
const app = express();
app.use(cors());
app.use(express.json());

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
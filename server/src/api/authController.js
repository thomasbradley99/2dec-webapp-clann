const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const db = require("../db");

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const ST_MARYS_TEAM_ID = '2470d524-e6e1-42f4-8d82-15bc8c833ac9';

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    try {
        const result = await db.query("SELECT * FROM Users WHERE email = $1", [email]);
        console.log('User found:', !!result.rows[0]);

        const user = result.rows[0];
        if (user && await bcrypt.compare(password, user.password_hash)) {
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            console.log('Login successful for:', email);
            res.json({
                token,
                id: user.id,
                email: user.email,
                role: user.role
            });
        } else {
            console.log('Password match failed for:', email);
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        console.log('Starting registration process...');
        const { email, password } = req.body;

        await db.query('BEGIN');

        try {
            // Create the user
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await db.query(
                'INSERT INTO Users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
                [email, hashedPassword, 'USER']
            );
            console.log('User created:', newUser.rows[0]);

            // Verify St Mary's team exists
            const teamCheck = await db.query(
                'SELECT * FROM Teams WHERE id = $1',
                [ST_MARYS_TEAM_ID]
            );
            console.log('Team check result:', teamCheck.rows[0]);

            // Add to St Mary's team
            const teamMember = await db.query(
                'INSERT INTO TeamMembers (user_id, team_id, is_admin) VALUES ($1, $2, $3) RETURNING *',
                [newUser.rows[0].id, ST_MARYS_TEAM_ID, false]
            );
            console.log('Successfully added to team:', teamMember.rows[0]);

            await db.query('COMMIT');
            console.log('Transaction committed successfully');

            const token = jwt.sign(
                {
                    id: newUser.rows[0].id,
                    email: newUser.rows[0].email,
                    teamId: ST_MARYS_TEAM_ID
                },
                process.env.JWT_SECRET
            );

            res.status(201).json({
                token,
                user: {
                    ...newUser.rows[0],
                    teamId: ST_MARYS_TEAM_ID
                }
            });

        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            details: error.message
        });
    }
};

exports.deleteAccount = async (req, res) => {
    const userId = req.user.id;
    try {
        await db.query('BEGIN');
        await db.query("DELETE FROM Sessions WHERE uploaded_by = $1", [userId]);
        await db.query("DELETE FROM TeamMembers WHERE user_id = $1", [userId]);
        await db.query("DELETE FROM Users WHERE id = $1", [userId]);
        await db.query('COMMIT');
        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Account deletion failed:', err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

module.exports = {
    register: exports.register,
    deleteAccount: exports.deleteAccount,
    login: exports.login
};

const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const db = require("../db");

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query("SELECT * FROM Users WHERE email = $1", [email]);
        const user = result.rows[0];
        if (user && await bcrypt.compare(password, user.password_hash)) {
            // Create JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({ 
                token,
                id: user.id, 
                email: user.email, 
                role: user.role 
            });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            "INSERT INTO Users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
            [email, hashedPassword, "USER"]
        );
        
        // Create JWT token for new user
        const token = jwt.sign(
            { id: result.rows[0].id, email, role: "USER" },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            ...result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAccount = async (req, res) => {
    const userId = req.user.id;
    try {
        await db.query('BEGIN');

        // Delete user's sessions first
        await db.query("DELETE FROM Sessions WHERE uploaded_by = $1", [userId]);
        
        // Delete user from TeamMembers
        await db.query("DELETE FROM TeamMembers WHERE user_id = $1", [userId]);

        // Delete user from Users table
        await db.query("DELETE FROM Users WHERE id = $1", [userId]);

        await db.query('COMMIT');
        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Account deletion failed:', err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

const bcrypt = require("bcryptjs");
const db = require("../db");

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query("SELECT * FROM Users WHERE email = $1", [email]);
        const user = result.rows[0];
        if (user && await bcrypt.compare(password, user.password_hash)) {
            res.json({ id: user.id, email: user.email, role: user.role });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    const { email, password } = req.body;
    console.log(`Registration attempt for email: ${email}`);
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            "INSERT INTO Users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
            [email, hashedPassword, "USER"]
        );
        console.log(`User registered successfully: ${email}`);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`Registration failed for ${email}:`, err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAccount = async (req, res) => {
    const userId = req.user.id;
    try {
        // Start transaction
        await db.query('BEGIN');

        // Delete user from TeamMembers
        await db.query("DELETE FROM TeamMembers WHERE user_id = $1", [userId]);

        // Delete user from Users table
        await db.query("DELETE FROM Users WHERE id = $1", [userId]);

        // Commit transaction
        await db.query('COMMIT');

        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        // Rollback on error
        await db.query('ROLLBACK');
        console.error('Account deletion failed:', err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

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
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            "INSERT INTO Users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
            [email, hashedPassword, "USER"]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

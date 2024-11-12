const db = require("../db");

const auth = async (req, res, next) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify user exists
        const userResult = await db.query(
            'SELECT id, email, role FROM Users WHERE id = $1',
            [userId]
        );

        if (!userResult.rows.length) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = userResult.rows[0];
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

module.exports = auth; 
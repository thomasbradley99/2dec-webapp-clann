const db = require("../db");
const { v4: uuidv4 } = require('uuid');

exports.createSession = async (req, res) => {
    const { footage_url, team_name } = req.body;
    try {
        // Create team first
        const teamId = uuidv4();
        const teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        await db.query(
            "INSERT INTO Teams (id, name, team_code) VALUES ($1, $2, $3)",
            [teamId, team_name, teamCode]
        );
        
        // Create session
        const sessionId = uuidv4();
        const result = await db.query(
            "INSERT INTO Sessions (id, team_id, footage_url, game_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [sessionId, teamId, footage_url, new Date(), 'PENDING']
        );
        
        res.json({
            ...result.rows[0],
            team_code: teamCode
        });
    } catch (err) {
        console.error('Session creation failed:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                s.*,
                t.name as team_name,
                t.team_code
            FROM Sessions s
            LEFT JOIN Teams t ON s.team_id = t.id
            ORDER BY s.created_at DESC
        `);
        
        console.log('Fetched sessions:', result.rows); // Debug log
        res.json(result.rows);
    } catch (err) {
        console.error('Failed to fetch sessions:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSession = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM Sessions WHERE id = $1", [id]);
        res.json({ message: "Session deleted successfully" });
    } catch (err) {
        console.error('Session deletion failed:', err);
        res.status(500).json({ error: err.message });
    }
}; 
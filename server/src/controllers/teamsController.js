const db = require("../db");

exports.getUserTeams = async (req, res) => {
    try {
        // Simple query to get teams associated with sessions
        const result = await db.query(`
            SELECT DISTINCT t.* 
            FROM Teams t
            INNER JOIN Sessions s ON t.id = s.team_id
            ORDER BY t.created_at DESC
        `);
        
        console.log('Teams fetched:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching teams:', err);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
}; 
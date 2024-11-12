const db = require("../db");
const { v4: uuidv4 } = require('uuid');

exports.createSession = async (req, res) => {
    const { footage_url, team_name } = req.body;
    try {
        // Start transaction
        await db.query('BEGIN');
        
        // Check if team already exists for this user
        const existingTeam = await db.query(`
            SELECT t.* 
            FROM Teams t
            INNER JOIN TeamMembers tm ON t.id = tm.team_id
            WHERE LOWER(t.name) = LOWER($1) AND tm.user_id = $2
        `, [team_name, req.user.id]);

        let teamId, teamCode;

        if (existingTeam.rows.length > 0) {
            // Use existing team
            teamId = existingTeam.rows[0].id;
            teamCode = existingTeam.rows[0].team_code;
        } else {
            // Create new team
            teamId = uuidv4();
            teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            await db.query(
                "INSERT INTO Teams (id, name, team_code) VALUES ($1, $2, $3)",
                [teamId, team_name, teamCode]
            );
            
            // Add user as team admin in TeamMembers table
            await db.query(
                "INSERT INTO TeamMembers (team_id, user_id, is_admin) VALUES ($1, $2, $3)",
                [teamId, req.user.id, true]
            );
        }
        
        // Create session
        const sessionId = uuidv4();
        const result = await db.query(
            "INSERT INTO Sessions (id, team_id, footage_url, game_date, status, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [sessionId, teamId, footage_url, new Date(), 'PENDING', req.user.id]
        );
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.json({
            ...result.rows[0],
            team_name,
            team_code: teamCode
        });
    } catch (err) {
        // Rollback on error
        await db.query('ROLLBACK');
        console.error('Session creation failed:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getSessions = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query(`
            SELECT 
                s.*,
                t.name as team_name,
                t.team_code,
                u.email as uploaded_by_email
            FROM Sessions s
            INNER JOIN Teams t ON s.team_id = t.id
            INNER JOIN TeamMembers tm ON t.id = tm.team_id
            INNER JOIN Users u ON s.uploaded_by = u.id
            WHERE tm.user_id = $1
            ORDER BY s.created_at DESC
        `, [userId]);
        
        console.log('Fetched sessions for user:', userId);
        res.json(result.rows);
    } catch (err) {
        console.error('Failed to fetch sessions:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSession = async (req, res) => {
    const { id } = req.params;
    try {
        // Start transaction
        await db.query('BEGIN');

        // Get the team ID associated with the session
        const sessionResult = await db.query("SELECT team_id FROM Sessions WHERE id = $1", [id]);
        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        const teamId = sessionResult.rows[0].team_id;

        // Delete the session
        await db.query("DELETE FROM Sessions WHERE id = $1", [id]);

        // Check if there are any remaining sessions for the team
        const remainingSessions = await db.query("SELECT COUNT(*) FROM Sessions WHERE team_id = $1", [teamId]);
        if (parseInt(remainingSessions.rows[0].count, 10) === 0) {
            // Delete the team if no sessions remain
            await db.query("DELETE FROM Teams WHERE id = $1", [teamId]);
            await db.query("DELETE FROM TeamMembers WHERE team_id = $1", [teamId]);
        }

        // Commit transaction
        await db.query('COMMIT');

        res.json({ message: "Session and associated team (if no sessions remain) deleted successfully" });
    } catch (err) {
        // Rollback on error
        await db.query('ROLLBACK');
        console.error('Session deletion failed:', err);
        res.status(500).json({ error: err.message });
    }
}; 
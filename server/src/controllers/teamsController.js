const db = require("../db");

exports.getUserTeams = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query(`
            SELECT t.*, tm.is_admin 
            FROM Teams t
            INNER JOIN TeamMembers tm ON t.id = tm.team_id
            WHERE tm.user_id = $1
            ORDER BY t.created_at DESC
        `, [userId]);
        
        console.log('Teams fetched for user:', userId, result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching teams:', err);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
};

exports.createTeam = async (req, res) => {
    const { name, team_code } = req.body;
    const userId = req.user.id;
    
    try {
        await db.query('BEGIN');
        
        const teamResult = await db.query(`
            INSERT INTO Teams (name, team_code)
            VALUES ($1, $2)
            RETURNING id, name, team_code
        `, [name, team_code]);
        
        await db.query(`
            INSERT INTO TeamMembers (team_id, user_id, is_admin)
            VALUES ($1, $2, true)
        `, [teamResult.rows[0].id, userId]);
        
        await db.query('COMMIT');
        
        res.json(teamResult.rows[0]);
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Team creation failed:', err);
        res.status(500).json({ error: 'Failed to create team' });
    }
};

exports.joinTeam = async (req, res) => {
    const { team_code } = req.body;
    const userId = req.user.id;

    try {
        // Find the team by team code
        const teamResult = await db.query(`
            SELECT id FROM Teams WHERE team_code = $1
        `, [team_code]);

        if (teamResult.rows.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const teamId = teamResult.rows[0].id;

        // Check if the user is already a member of the team
        const memberCheck = await db.query(`
            SELECT * FROM TeamMembers WHERE team_id = $1 AND user_id = $2
        `, [teamId, userId]);

        if (memberCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Already a member of this team' });
        }

        // Add the user to the team
        await db.query(`
            INSERT INTO TeamMembers (team_id, user_id) VALUES ($1, $2)
        `, [teamId, userId]);

        res.json({ message: 'Successfully joined the team' });
    } catch (err) {
        console.error('Failed to join team:', err);
        res.status(500).json({ error: 'Failed to join team' });
    }
}; 
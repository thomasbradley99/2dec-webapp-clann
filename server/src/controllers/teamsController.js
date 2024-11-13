const db = require("../db");
const { MAX_TEAM_MEMBERS } = require('../constants');

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
        // First find the team
        const teamResult = await db.query(
            `SELECT id 
             FROM Teams 
             WHERE team_code = $1`,
            [team_code]
        );

        if (teamResult.rows.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const teamId = teamResult.rows[0].id;

        // Check member count
        const memberCountResult = await db.query(
            'SELECT COUNT(*) as count FROM TeamMembers WHERE team_id = $1',
            [teamId]
        );

        if (memberCountResult.rows[0].count >= MAX_TEAM_MEMBERS) {
            return res.status(400).json({ 
                error: `Team has reached maximum capacity of ${MAX_TEAM_MEMBERS} members` 
            });
        }

        // Check if user is already a member
        const memberCheck = await db.query(
            `SELECT team_id 
             FROM TeamMembers 
             WHERE team_id = $1 AND user_id = $2`,
            [teamId, userId]
        );

        if (memberCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Already a member of this team' });
        }

        // Add user to team
        await db.query(
            `INSERT INTO TeamMembers (team_id, user_id, is_admin)
             VALUES ($1, $2, false)`,
            [teamId, userId]
        );

        res.json({ message: 'Successfully joined team' });
    } catch (err) {
        console.error('Join team error:', err);
        res.status(500).json({ error: 'Failed to join team' });
    }
};

exports.getTeamMembers = async (req, res) => {
    const { teamId } = req.params;
    const userId = req.user.id;

    try {
        // First verify user is a member of this team
        const memberCheck = await db.query(
            `SELECT team_id 
             FROM TeamMembers 
             WHERE team_id = $1 AND user_id = $2`,
            [teamId, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized to view this team' });
        }

        // Get all team members with their roles
        const members = await db.query(
            `SELECT 
                u.id,
                u.email,
                u.created_at,
                tm.is_admin
             FROM TeamMembers tm
             JOIN Users u ON u.id = tm.user_id
             WHERE tm.team_id = $1
             ORDER BY u.created_at ASC`,
            [teamId]
        );

        res.json(members.rows);
    } catch (err) {
        console.error('Get team members error:', err);
        res.status(500).json({ error: 'Failed to get team members' });
    }
};

exports.removeTeamMember = async (req, res) => {
    const { teamId, userId: memberToRemoveId } = req.params;
    const requestingUserId = req.user.id;

    try {
        // Check if requesting user is admin
        const requestingUserCheck = await db.query(
            `SELECT is_admin 
             FROM TeamMembers 
             WHERE team_id = $1 AND user_id = $2`,
            [teamId, requestingUserId]
        );

        if (!requestingUserCheck.rows[0]?.is_admin) {
            return res.status(403).json({ error: 'Only team admins can remove members' });
        }

        // Check if member to remove is admin and count total admins
        const adminCountCheck = await db.query(
            `SELECT COUNT(*) as admin_count 
             FROM TeamMembers 
             WHERE team_id = $1 AND is_admin = true`,
            [teamId]
        );

        const memberToRemoveCheck = await db.query(
            `SELECT is_admin 
             FROM TeamMembers 
             WHERE team_id = $1 AND user_id = $2`,
            [teamId, memberToRemoveId]
        );

        if (adminCountCheck.rows[0].admin_count === 1 && memberToRemoveCheck.rows[0]?.is_admin) {
            return res.status(400).json({ error: 'Cannot remove the last admin from the team' });
        }

        // Remove the member
        await db.query(
            `DELETE FROM TeamMembers 
             WHERE team_id = $1 AND user_id = $2`,
            [teamId, memberToRemoveId]
        );

        res.json({ message: 'Member removed successfully' });
    } catch (err) {
        console.error('Remove team member error:', err);
        res.status(500).json({ error: 'Failed to remove team member' });
    }
};

exports.promoteToAdmin = async (req, res) => {
    const { teamId, userId: memberToPromoteId } = req.params;
    const requestingUserId = req.user.id;

    try {
        // Check if requesting user is admin
        const requestingUserCheck = await db.query(
            `SELECT is_admin 
             FROM TeamMembers 
             WHERE team_id = $1 AND user_id = $2`,
            [teamId, requestingUserId]
        );

        if (!requestingUserCheck.rows[0]?.is_admin) {
            return res.status(403).json({ error: 'Only team admins can promote members' });
        }

        // Promote the member to admin
        await db.query(
            `UPDATE TeamMembers 
             SET is_admin = true 
             WHERE team_id = $1 AND user_id = $2`,
            [teamId, memberToPromoteId]
        );

        res.json({ message: 'Member promoted to admin successfully' });
    } catch (err) {
        console.error('Promote to admin error:', err);
        res.status(500).json({ error: 'Failed to promote member to admin' });
    }
};

exports.toggleAdminStatus = async (req, res) => {
    const { teamId, userId: memberId } = req.params;
    const { isAdmin } = req.body;
    const requestingUserId = req.user.id;

    try {
        // Check if requesting user is admin
        const requestingUserCheck = await db.query(
            `SELECT is_admin 
             FROM TeamMembers 
             WHERE team_id = $1 AND user_id = $2`,
            [teamId, requestingUserId]
        );

        if (!requestingUserCheck.rows[0]?.is_admin) {
            return res.status(403).json({ error: 'Only team admins can change admin status' });
        }

        // Update admin status
        await db.query(
            `UPDATE TeamMembers 
             SET is_admin = $1 
             WHERE team_id = $2 AND user_id = $3`,
            [isAdmin, teamId, memberId]
        );

        res.json({ message: 'Admin status updated successfully' });
    } catch (err) {
        console.error('Toggle admin status error:', err);
        res.status(500).json({ error: 'Failed to update admin status' });
    }
}; 
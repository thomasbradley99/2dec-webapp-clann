const db = require("../db");
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const { MAX_TEAM_MEMBERS } = require('../constants');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/analysis-images/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, 'analysis-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'));
        }
        cb(null, true);
    }
}).single('file');

exports.createSession = async (req, res) => {
    const { footage_url, team_name } = req.body;

    // Add validation
    if (!footage_url?.trim()) {
        return res.status(400).json({ error: 'Game footage URL is required' });
    }

    if (!team_name?.trim()) {
        return res.status(400).json({ error: 'Team name is required' });
    }

    try {
        // Check if URL already exists
        const existingUrl = await db.query(
            'SELECT id FROM Sessions WHERE footage_url = $1',
            [footage_url.trim()]
        );

        if (existingUrl.rows.length > 0) {
            return res.status(400).json({ error: 'This footage URL has already been uploaded' });
        }

        // Start transaction
        await db.query('BEGIN');
        
        // Check if team exists for this user
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

            // Check member count for existing team
            const memberCountResult = await db.query(
                'SELECT COUNT(*) as count FROM TeamMembers WHERE team_id = $1',
                [teamId]
            );

            if (memberCountResult.rows[0].count >= MAX_TEAM_MEMBERS) {
                await db.query('ROLLBACK');
                return res.status(400).json({ 
                    error: `Team has reached maximum capacity of ${MAX_TEAM_MEMBERS} members` 
                });
            }
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
        // Add console.log for debugging
        console.log('Fetching sessions for user:', userId);
        
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
        
        // Add console.log for debugging
        console.log('Query result:', result.rows);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Failed to fetch sessions:', err);
        res.status(500).json({ error: 'Failed to fetch sessions: ' + err.message });
    }
};

exports.deleteSession = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('BEGIN');

        // Get the team ID associated with the session
        const sessionResult = await db.query(
            "SELECT team_id FROM Sessions WHERE id = $1", 
            [id]
        );
        
        if (sessionResult.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Session not found' });
        }

        // Delete the session (no need to delete analysis separately)
        await db.query(
            "DELETE FROM Sessions WHERE id = $1",
            [id]
        );

        await db.query('COMMIT');
        res.json({ message: 'Session deleted successfully' });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Failed to delete session:', err);
        res.status(500).json({ error: 'Failed to delete session' });
    }
};

// Add this new function to get all sessions for company users
exports.getAllSessions = async (req, res) => {
    try {
        // Get all sessions with team and user info
        const result = await db.query(`
            SELECT 
                s.*,
                t.name as team_name,
                t.team_code,
                u.email as uploaded_by_email
            FROM Sessions s
            LEFT JOIN Teams t ON s.team_id = t.id
            LEFT JOIN Users u ON s.uploaded_by = u.id
            ORDER BY s.created_at DESC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('Failed to fetch sessions:', err);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
};

exports.addAnalysis = async (req, res) => {
    try {
        if (req.user.role !== 'COMPANY_MEMBER') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { sessionId, type } = req.body;
        if (!sessionId || !type) {
            return res.status(400).json({ error: 'Missing sessionId or type' });
        }

        const imageUrl = `/analysis-images/${req.file.filename}`;
        console.log('Processing upload:', { sessionId, type, imageUrl });
        
        // Update the appropriate column based on analysis type
        let updateQuery;
        switch(type.toUpperCase()) {
            case 'HEATMAP':
                updateQuery = `
                    UPDATE Sessions 
                    SET analysis_image1_url = $1,
                        reviewed_by = $2,
                        status = 'REVIEWED',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $3
                    RETURNING *`;
                break;
            case 'SPRINT_MAP':
                updateQuery = `
                    UPDATE Sessions 
                    SET analysis_image2_url = $1,
                        reviewed_by = $2,
                        status = 'REVIEWED',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $3
                    RETURNING *`;
                break;
            case 'GAME_MOMENTUM':
                updateQuery = `
                    UPDATE Sessions 
                    SET analysis_image3_url = $1,
                        reviewed_by = $2,
                        status = 'REVIEWED',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $3
                    RETURNING *`;
                break;
            default:
                return res.status(400).json({ error: 'Invalid analysis type' });
        }

        const result = await db.query(updateQuery, [imageUrl, req.user.id, sessionId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Analysis upload error:', err);
        res.status(500).json({ error: err.message || 'Failed to process analysis' });
    }
};

exports.toggleSessionStatus = async (req, res) => {
    console.log('--- Toggle Session Status Request ---');
    console.log('Method:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('User:', req.user);
    console.log('Session ID:', req.params.sessionId);

    if (req.user.role !== 'COMPANY_MEMBER') {
        console.log('Unauthorized attempt by user:', req.user.id);
        return res.status(403).json({ error: 'Not authorized' });
    }

    const { sessionId } = req.params;
    console.log('Session ID to toggle:', sessionId);

    try {
        // Check if the session exists
        const currentStatusResult = await db.query(
            'SELECT status FROM Sessions WHERE id = $1',
            [sessionId]
        );

        if (currentStatusResult.rows.length === 0) {
            console.log('Session not found:', sessionId);
            return res.status(404).json({ error: 'Session not found' });
        }

        const currentStatus = currentStatusResult.rows[0].status;
        console.log('Current Status:', currentStatus);

        // Toggle status
        const newStatus = currentStatus === 'PENDING' ? 'REVIEWED' : 'PENDING';
        console.log('New Status:', newStatus);

        // Update the session status
        const updateResult = await db.query(
            `
            UPDATE Sessions 
            SET 
                status = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
            `,
            [newStatus, sessionId]
        );

        console.log('Session updated:', updateResult.rows[0]);
        res.json(updateResult.rows[0]);
    } catch (error) {
        console.error('Error toggling session status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteAnalysis = async (req, res) => {
    try {
        const { analysisId, type } = req.params;
        
        if (!type) {
            return res.status(400).json({ error: 'Analysis type is required' });
        }

        let updateQuery;
        switch(type.toUpperCase()) {
            case 'HEATMAP':
                updateQuery = `
                    UPDATE Sessions 
                    SET analysis_image1_url = NULL
                    WHERE id = $1
                    RETURNING *`;
                break;
            case 'SPRINT_MAP':
                updateQuery = `
                    UPDATE Sessions 
                    SET analysis_image2_url = NULL
                    WHERE id = $1
                    RETURNING *`;
                break;
            case 'GAME_MOMENTUM':
                updateQuery = `
                    UPDATE Sessions 
                    SET analysis_image3_url = NULL
                    WHERE id = $1
                    RETURNING *`;
                break;
            default:
                return res.status(400).json({ error: 'Invalid analysis type' });
        }

        const result = await db.query(updateQuery, [analysisId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ message: 'Analysis deleted successfully' });
    } catch (err) {
        console.error('Delete analysis error:', err);
        res.status(500).json({ error: 'Failed to delete analysis' });
    }
};

exports.addDescription = async (req, res) => {
    try {
        console.log('Starting description add...');
        
        if (req.user.role !== 'COMPANY_MEMBER') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { sessionId } = req.params;
        const { description } = req.body;

        console.log('Adding description for session:', sessionId);
        console.log('Description:', description);

        // First check if description already exists
        const existing = await db.query(
            `SELECT id FROM analysis 
             WHERE session_id = $1 AND type = 'DESCRIPTION'`,
            [sessionId]
        );

        let result;
        if (existing.rows.length > 0) {
            // Update existing
            result = await db.query(
                `UPDATE analysis 
                 SET description = $1, 
                     updated_at = CURRENT_TIMESTAMP
                 WHERE session_id = $2 AND type = 'DESCRIPTION'
                 RETURNING *`,
                [description, sessionId]
            );
        } else {
            // Insert new
            result = await db.query(
                `INSERT INTO analysis 
                 (session_id, analyst_id, description, type)
                 VALUES ($1, $2, $3, 'DESCRIPTION')
                 RETURNING *`,
                [sessionId, req.user.id, description]
            );
        }

        // Update session status to REVIEWED
        await db.query(
            `UPDATE sessions 
             SET status = 'REVIEWED' 
             WHERE id = $1`,
            [sessionId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error in addDescription:', error);
        res.status(500).json({ 
            error: 'Failed to add description',
            details: error.message 
        });
    }
};

exports.updateAnalysisDescription = async (req, res) => {
    try {
        if (req.user.role !== 'COMPANY_MEMBER') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { sessionId } = req.params;
        const { description } = req.body;

        // First, check if an analysis description already exists
        const existingAnalysis = await db.query(
            `SELECT id FROM analysis 
             WHERE session_id = $1 AND type = 'DESCRIPTION'`,
            [sessionId]
        );

        let result;
        if (existingAnalysis.rows.length > 0) {
            // Update existing description
            result = await db.query(
                `UPDATE analysis 
                 SET description = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE session_id = $2 AND type = 'DESCRIPTION'
                 RETURNING *`,
                [description, sessionId]
            );
        } else {
            // Create new description
            result = await db.query(
                `INSERT INTO analysis 
                 (session_id, analyst_id, description, type)
                 VALUES ($1, $2, $3, 'DESCRIPTION')
                 RETURNING *`,
                [sessionId, req.user.id, description]
            );
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating description:', error);
        res.status(500).json({ error: 'Failed to update description' });
    }
}; 
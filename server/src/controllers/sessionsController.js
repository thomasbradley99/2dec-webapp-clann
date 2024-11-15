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
}).single('analysis');

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
        const result = await db.query(`
            SELECT 
                s.*,
                t.name as team_name,
                t.team_code,
                u.email as uploaded_by_email,
                a.id as analysis_id,
                a.description as analysis_description,
                a.image_url as analysis_image_url,
                au.email as analyst_email
            FROM Sessions s
            INNER JOIN Teams t ON s.team_id = t.id
            INNER JOIN TeamMembers tm ON t.id = tm.team_id
            INNER JOIN Users u ON s.uploaded_by = u.id
            LEFT JOIN Analysis a ON s.id = a.session_id
            LEFT JOIN Users au ON a.analyst_id = au.id
            WHERE tm.user_id = $1
            ORDER BY s.created_at DESC, a.created_at DESC
        `, [userId]);
        
        // Group analyses by session
        const sessionsWithAnalyses = result.rows.reduce((acc, row) => {
            const sessionId = row.id;
            if (!acc[sessionId]) {
                acc[sessionId] = {
                    ...row,
                    analyses: []
                };
                delete acc[sessionId].analysis_id;
                delete acc[sessionId].analysis_description;
                delete acc[sessionId].analysis_image_url;
                delete acc[sessionId].analyst_email;
            }
            if (row.analysis_id) {
                acc[sessionId].analyses.push({
                    id: row.analysis_id,
                    description: row.analysis_description,
                    image_url: row.analysis_image_url,
                    analyst_email: row.analyst_email
                });
            }
            return acc;
        }, {});

        console.log('Fetched sessions with analyses for user:', userId);
        res.json(Object.values(sessionsWithAnalyses));
    } catch (err) {
        console.error('Failed to fetch sessions:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSession = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('BEGIN');

        // Get the team ID associated with the session
        const sessionResult = await db.query("SELECT team_id FROM Sessions WHERE id = $1", [id]);
        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        const teamId = sessionResult.rows[0].team_id;

        // First delete associated analyses
        await db.query("DELETE FROM Analysis WHERE session_id = $1", [id]);

        // Then delete the session
        await db.query("DELETE FROM Sessions WHERE id = $1", [id]);

        // Check if there are any remaining sessions for the team
        const remainingSessions = await db.query("SELECT COUNT(*) FROM Sessions WHERE team_id = $1", [teamId]);
        if (parseInt(remainingSessions.rows[0].count, 10) === 0) {
            await db.query("DELETE FROM TeamMembers WHERE team_id = $1", [teamId]);
            await db.query("DELETE FROM Teams WHERE id = $1", [teamId]);
        }

        await db.query('COMMIT');
        res.json({ message: "Session and associated data deleted successfully" });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Session deletion failed:', err);
        res.status(500).json({ error: err.message });
    }
};

// Add this new function to get all sessions for company users
exports.getAllSessions = async (req, res) => {
    if (req.user.role !== 'COMPANY_MEMBER') {
        return res.status(403).json({ error: 'Not authorized' });
    }

    try {
        const result = await db.query(`
            SELECT 
                s.*,
                t.name as team_name,
                t.team_code,
                u.email as uploaded_by_email,
                a.id as analysis_id,
                a.description as analysis_description,
                a.image_url as analysis_image_url,
                au.email as analyst_email
            FROM Sessions s
            INNER JOIN Teams t ON s.team_id = t.id
            INNER JOIN Users u ON s.uploaded_by = u.id
            LEFT JOIN Analysis a ON s.id = a.session_id
            LEFT JOIN Users au ON a.analyst_id = au.id
            ORDER BY s.created_at DESC, a.created_at DESC
        `);
        
        // Group analyses by session
        const sessionsWithAnalyses = result.rows.reduce((acc, row) => {
            const sessionId = row.id;
            if (!acc[sessionId]) {
                acc[sessionId] = {
                    ...row,
                    analyses: []
                };
                delete acc[sessionId].analysis_id;
                delete acc[sessionId].analysis_description;
                delete acc[sessionId].analysis_image_url;
                delete acc[sessionId].analyst_email;
            }
            if (row.analysis_id) {
                acc[sessionId].analyses.push({
                    id: row.analysis_id,
                    description: row.analysis_description,
                    image_url: row.analysis_image_url,
                    analyst_email: row.analyst_email
                });
            }
            return acc;
        }, {});

        console.log('Fetched all sessions with analyses for company user');
        res.json(Object.values(sessionsWithAnalyses));
    } catch (err) {
        console.error('Failed to fetch sessions:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.addAnalysis = async (req, res) => {
    try {
        console.log('1. Starting analysis upload...');
        console.log('2. User:', req.user);
        
        if (req.user.role !== 'COMPANY_MEMBER') {
            console.log('3. Unauthorized role:', req.user.role);
            return res.status(403).json({ error: 'Not authorized' });
        }

        upload(req, res, async function(err) {
            console.log('4. Multer processing complete');
            
            if (err) {
                console.error('5. Multer error:', err);
                return res.status(400).json({ error: err.message });
            }

            try {
                console.log('6. Request body:', req.body);
                console.log('7. File details:', {
                    exists: !!req.file,
                    filename: req.file?.filename,
                    size: req.file?.size
                });

                if (!req.file) {
                    console.error('8. No file uploaded');
                    return res.status(400).json({ error: 'No file uploaded' });
                }

                const { sessionId, description } = req.body;
                
                if (!sessionId) {
                    console.error('9. No sessionId provided');
                    return res.status(400).json({ error: 'No sessionId provided' });
                }

                const imageUrl = `/analysis-images/${req.file.filename}`;
                console.log('10. Generated image URL:', imageUrl);

                await db.query('BEGIN');
                
                // Insert into Analysis table
                await db.query(`
                    INSERT INTO Analysis (session_id, analyst_id, description, image_url)
                    VALUES ($1, $2, $3, $4)
                `, [sessionId, req.user.id, description, imageUrl]);

                // Update only the status in Sessions table
                const updateResult = await db.query(`
                    UPDATE Sessions 
                    SET 
                        status = 'REVIEWED',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $1
                    RETURNING *
                `, [sessionId]);

                console.log('11. Update result:', updateResult.rows[0]);

                await db.query('COMMIT');
                
                res.json({ 
                    message: 'Analysis added successfully',
                    imageUrl: imageUrl
                });
            } catch (err) {
                await db.query('ROLLBACK');
                console.error('12. Database error:', err);
                res.status(500).json({ error: err.message });
            }
        });
    } catch (outerErr) {
        console.error('13. Outer error:', outerErr);
        res.status(500).json({ error: outerErr.message });
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
        const { analysisId } = req.params;
        
        if (!analysisId) {
            return res.status(400).json({ error: 'Analysis ID is required' });
        }

        // First check if the analysis exists and belongs to a session
        const analysisCheck = await db.query(
            'SELECT * FROM Analysis WHERE id = $1',
            [analysisId]
        );

        if (analysisCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Analysis not found' });
        }

        // Delete the analysis
        await db.query(
            'DELETE FROM Analysis WHERE id = $1',
            [analysisId]
        );

        res.json({ message: 'Analysis deleted successfully' });
    } catch (err) {
        console.error('Delete analysis error:', err);
        res.status(500).json({ error: 'Failed to delete analysis' });
    }
}; 
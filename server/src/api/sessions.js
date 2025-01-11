const express = require("express");
const router = express.Router();
const sessionsController = require('./sessionsController');
const auth = require("../middleware/auth");
const multer = require('multer');
const path = require('path');

// Configure multer first
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: fileFilter
});

// First, define specific routes (EXACT MATCHES FIRST)
router.post("/create", auth, sessionsController.createSession);
router.get("/", auth, sessionsController.getSessions);
router.get('/all', auth, sessionsController.getAllSessions);
router.get('/stats', auth, sessionsController.getSessionStats);
router.post('/analysis', auth, upload.single('file'), sessionsController.addAnalysis);

// Then, define parameterized routes (WILDCARDS LAST)
router.get("/:sessionId", auth, sessionsController.getSessionDetails);
router.delete("/:id", auth, sessionsController.deleteSession);
router.put('/:sessionId/toggle-status', auth, sessionsController.toggleSessionStatus);
router.delete('/analysis/:sessionId/:type', auth, sessionsController.deleteAnalysis);
router.post('/:sessionId/description', auth, sessionsController.addDescription);
router.put('/:sessionId/description', auth, sessionsController.updateAnalysisDescription);
router.put('/:sessionId/metrics', auth, sessionsController.updateTeamMetrics);

module.exports = router;


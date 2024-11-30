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

// Then define routes
router.post("/create", auth, sessionsController.createSession);
router.get("/", auth, sessionsController.getSessions);
router.delete("/:id", auth, sessionsController.deleteSession);
router.get('/all', auth, sessionsController.getAllSessions);
router.post('/analysis', auth, upload.single('file'), sessionsController.addAnalysis);
router.put('/:sessionId/toggle-status', auth, sessionsController.toggleSessionStatus);
router.delete('/analysis/:sessionId/:type', auth, sessionsController.deleteAnalysis);
router.post('/:sessionId/description', auth, sessionsController.addDescription);
router.put('/:sessionId/description', auth, sessionsController.updateAnalysisDescription);
router.get("/:sessionId", auth, sessionsController.getSessionDetails);
router.put('/:sessionId/metrics', auth, sessionsController.updateTeamMetrics);

module.exports = router; 
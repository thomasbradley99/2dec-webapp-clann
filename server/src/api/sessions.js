const express = require("express");
const router = express.Router();
const sessionsController = require('./sessionsController');
const auth = require("../middleware/auth");
const multer = require('multer');
const path = require('path');

// Configure multer first
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../storage/analysis-images/'));
    },
    filename: function (req, file, cb) {
        cb(null, 'analysis-' + Date.now() + path.extname(file.originalname));
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

module.exports = router; 
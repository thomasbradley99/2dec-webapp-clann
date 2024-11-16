const express = require("express");
const router = express.Router();
const sessionsController = require("../controllers/sessionsController");
const auth = require("../middleware/auth");
const multer = require('multer');
const path = require('path');

router.post("/create", auth, sessionsController.createSession);
router.get("/", auth, sessionsController.getSessions);
router.delete("/:id", auth, sessionsController.deleteSession);
router.get('/all', auth, sessionsController.getAllSessions);
router.post('/analysis', auth, sessionsController.addAnalysis);
router.put('/:sessionId/toggle-status', auth, sessionsController.toggleSessionStatus);
router.delete('/analysis/:analysisId', auth, sessionsController.deleteAnalysis);
router.post('/:sessionId/description', auth, sessionsController.addDescription);
router.put('/:sessionId/description', auth, sessionsController.updateAnalysisDescription);

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/analysis-images/');
        },
        filename: function (req, file, cb) {
            cb(null, 'analysis-' + Date.now() + path.extname(file.originalname));
        }
    })
}).fields([
    { name: 'heatmap', maxCount: 1 },
    { name: 'sprint_map', maxCount: 1 },
    { name: 'game_momentum', maxCount: 1 }
]);

module.exports = router; 
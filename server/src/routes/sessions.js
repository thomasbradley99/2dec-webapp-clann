const express = require("express");
const router = express.Router();
const sessionsController = require("../controllers/sessionsController");
const auth = require("../middleware/auth");

router.post("/create", auth, sessionsController.createSession);
router.get("/", auth, sessionsController.getSessions);
router.delete("/:id", auth, sessionsController.deleteSession);
router.get('/all', auth, sessionsController.getAllSessions);
router.post('/analysis', auth, sessionsController.addAnalysis);
router.put('/:sessionId/toggle-status', auth, sessionsController.toggleSessionStatus);

module.exports = router; 
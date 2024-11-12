const express = require("express");
const router = express.Router();
const sessionsController = require("../controllers/sessionsController");
const auth = require("../middleware/auth");

router.post("/create", auth, sessionsController.createSession);
router.get("/", auth, sessionsController.getSessions);
router.delete("/:id", auth, sessionsController.deleteSession);

module.exports = router; 
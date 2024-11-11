const express = require("express");
const router = express.Router();
const sessionsController = require("../controllers/sessionsController");

router.post("/create", sessionsController.createSession);
router.get("/", sessionsController.getSessions);
router.delete("/:id", sessionsController.deleteSession);

module.exports = router; 
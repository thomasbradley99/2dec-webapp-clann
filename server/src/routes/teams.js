const express = require("express");
const router = express.Router();
const teamsController = require("../controllers/teamsController");

router.get("/user", teamsController.getUserTeams);

module.exports = router;
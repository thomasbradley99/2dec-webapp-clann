const express = require("express");
const router = express.Router();
const teamsController = require("../controllers/teamsController");
const auth = require("../middleware/auth");

router.get("/user", auth, teamsController.getUserTeams);
router.post("/create", auth, teamsController.createTeam);
router.post('/join', auth, teamsController.joinTeam);
router.get("/:teamId/members", auth, teamsController.getTeamMembers);
router.delete("/:teamId/members/:userId", auth, teamsController.removeTeamMember);
router.patch("/:teamId/members/:userId/promote", auth, teamsController.promoteToAdmin);
router.patch("/:teamId/members/:userId/admin", auth, teamsController.toggleAdminStatus);

module.exports = router;
const { createTeam, getAllTeams, getTeamById, deleteTeam, updateTeam, getMyTeams } = require("../controllers/teamsController");
const { protect, hrOnly, managerOnly, hrOrManager } = require("../middlewares/authMiddleware");
const express = require ('express');
const router = express.Router ();

router.get("/my-teams", protect, managerOnly, getMyTeams);
router.get ("/", protect, hrOrManager, getAllTeams);
router.get ("/:id", protect, hrOrManager, getTeamById);

router.post ("/", protect, hrOnly, createTeam);
router.put ("/:id", protect, hrOnly, updateTeam);
router.delete ("/:id", protect, hrOnly, deleteTeam);
// router.post ("/", createTeam);

module.exports = router;
const { createTeam, getAllTeams, getTeamById, deleteTeam, updateTeam } = require("../controllers/teamsController");
const { protect, hrOnly, hrOrManager } = require("../middlewares/authMiddleware");
const express = require ('express');
const router = express.Router ();

router.get ("/", protect, hrOrManager, getAllTeams);
router.get ("/:id", protect, hrOrManager, getTeamById);

router.post ("/", protect, hrOnly, createTeam);
router.put ("/:id", protect, hrOnly, updateTeam);
router.delete ("/:id", protect, hrOnly, deleteTeam);
// router.post ("/", createTeam);

module.exports = router;
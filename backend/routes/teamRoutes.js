const { createTeam, getAllTeams, getTeamById, deleteTeam, updateTeam } = require("../controllers/teamsController");
const { protect, hrOnly } = require("../middlewares/authMiddleware");
const express = require ('express');
const router = express.Router ();

router.post ("/", protect, hrOnly, createTeam);
router.get ("/", protect, hrOnly, getAllTeams);
router.get ("/:id", protect, hrOnly, getTeamById);
router.put ("/:id", protect, hrOnly, updateTeam);
router.delete ("/:id", protect, hrOnly, deleteTeam);
// router.post ("/", createTeam);

module.exports = router;
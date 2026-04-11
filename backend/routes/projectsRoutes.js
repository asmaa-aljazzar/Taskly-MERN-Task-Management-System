const { createProject, getAllProjects, getProjectById, deleteProject, updateProject } = require("../controllers/projectsController");
const { protect, hrOnly } = require("../middlewares/authMiddleware");
const express = require ('express');
const router = express.Router ();

router.post ("/", protect, hrOnly, createProject);
router.get ("/", protect, hrOnly, getAllProjects);
router.get ("/:id", protect, hrOnly, getProjectById);
router.put ("/:id", protect, hrOnly, updateProject);
router.delete ("/:id", protect, hrOnly, deleteProject);
// router.post ("/", createProject);

module.exports = router;
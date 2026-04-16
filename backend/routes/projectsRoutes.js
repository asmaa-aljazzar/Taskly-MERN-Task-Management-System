const { createProject, getAllProjects, getProjectById, deleteProject, updateProject } = require("../controllers/projectsController");
const {createTask, getAllTasks, getTaskById, deleteTask, updateTask } = require("../controllers/projectsController");
const { protect, managerOnly } = require("../middlewares/authMiddleware");
const express = require ('express');
const router = express.Router ();

router.post ("/", protect, managerOnly, createProject);
router.get ("/", protect, managerOnly, getAllProjects);
router.get ("/:id", protect, managerOnly, getProjectById);
router.put ("/:id", protect, managerOnly, updateProject);
router.delete ("/:id", protect, managerOnly, deleteProject);


// Project tasks
router.post ("/:projectId/tasks", protect, managerOnly, createTask);
router.get ("/:projectId/tasks", protect, managerOnly, getAllTasks);
router.get ("/:projectId/tasks/:taskId", protect, managerOnly, getTaskById);
router.put ("/:projectId/tasks/:taskId", protect, managerOnly, updateTask);
router.delete ("/:projectId/tasks/:taskId", protect, managerOnly, deleteTask);
module.exports = router;
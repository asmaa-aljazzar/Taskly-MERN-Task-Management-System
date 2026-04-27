const { createProject, getAllProjects, getProjectById, deleteProject, updateProject,
        createTask, getAllTasks, getTaskById, deleteTask, updateTask, updateTaskProgress } = require("../controllers/projectsController");
const { protect, managerOnly, managerOrEmployee} = require("../middlewares/authMiddleware");
const express = require('express');
const router = express.Router();

// ── Task routes FIRST (before /:id, or Express will swallow /:projectId/tasks) ──
router.post  ("/:projectId/tasks",          protect, managerOnly, createTask);
router.get   ("/:projectId/tasks",          protect, managerOrEmployee, getAllTasks);
router.get   ("/:projectId/tasks/:taskId",  protect, managerOrEmployee, getTaskById);
router.put   ("/:projectId/tasks/:taskId",  protect, managerOnly, updateTask);
router.delete("/:projectId/tasks/:taskId",  protect, managerOnly, deleteTask);
router.patch ("/:projectId/tasks/:taskId", protect, managerOrEmployee, updateTaskProgress);

// ── Project routes AFTER ──
router.post  ("/",    protect, managerOnly, createProject);
router.get   ("/",    protect, managerOrEmployee, getAllProjects);
router.get   ("/:id", protect, managerOrEmployee, getProjectById);
router.put   ("/:id", protect, managerOnly, updateProject);
router.delete("/:id", protect, managerOnly, deleteProject);

module.exports = router;
const Project = require('../models/Project');
const Task = require('../models/Task');
const Team = require('../models/Team');
const User = require('../models/User')
const catchError = require('../utils/catchError');
const { sanitizeText } = require('../utils/validation');

//*======================== [PROJECTS] ======================

// 1. Create new project (Manager only)
const createProject = async (req, res) => {
	try {
		const projectBody = req.body;

		if (projectBody.projectName && projectBody.teamId) {
			let {
				projectName,
				description,
				teamId,
				startDate,
				endDate,
			} = projectBody;

			if (projectName) projectName = sanitizeText(projectName);
			if (description) description = sanitizeText(description);

			const team = await Team.findOne({
				_id: teamId,
				isDeleted: false,
			});

			if (!team)
				return res.status(404).json({
					success: false,
					message: "Team Not Found"
				});

			const today = new Date();
			today.setHours(0, 0, 0, 0);

			if (startDate) {
				const start = new Date(startDate);
				start.setHours(0, 0, 0, 0);
				if (start < today) {
					return res.status(400).json({
						success: false,
						message: "Start date cannot be in the past"
					});
				}
			}

			if (endDate) {
				const end = new Date(endDate);
				end.setHours(0, 0, 0, 0);
				if (end < today) {
					return res.status(400).json({
						success: false,
						message: "End date cannot be in the past"
					});
				}
			}

			if (startDate && endDate) {
				const start = new Date(startDate);
				const end = new Date(endDate);
				start.setHours(0, 0, 0, 0);
				end.setHours(0, 0, 0, 0);
				if (end < start) {
					return res.status(400).json({
						success: false,
						message: "End date cannot be before start date"
					});
				}
			}

			const project = await Project.create({
				projectName,
				description,
				teamId,
				startDate,
				endDate,
			});

			return res.status(201).json({
				success: true,
				message: "Project Created Successfully!",
				project: {
					_id: project._id,
					projectName: project.projectName,
					description: project.description,
					teamId: project.teamId,
					startDate: project.startDate,
					endDate: project.endDate,
				}
			});
		}
		else {
			return res.status(400).json({
				success: false,
				message: "Error: Missing information please provide all fields"
			});
		};

	} catch (err) {
		catchError(err, res);
	};
};

// 2. Get all projects (Manager/Admin only)
const getAllProjects = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(404).json({
				success: false,
				message: "Something Wrong Happens",
			});
		}

		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const projects = await Project.find({ isDeleted: false })
			.populate('teamId', 'name _id')
			.skip(skip)
			.limit(limit);

		const totalProjects = await Project.countDocuments({ isDeleted: false });
		const totalPages = Math.ceil(totalProjects / limit);

		if (projects.length == 0)
			return res.status(200).json({
				success: true,
				message: "No projects found",
				projects: [],
				pagination: {
					currentPage: page,
					totalPages: 0,
					totalProjects: 0,
					itemsPerPage: limit,
					hasNextPage: false,
					hasPrevPage: false,
				}
			});

		return res.status(200).json({
			success: true,
			message: "Projects retrieved successfully",
			projects: projects,
			pagination: {
				currentPage: page,
				totalPages: totalPages,
				totalProjects: totalProjects,
				itemsPerPage: limit,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			}
		});
	} catch (err) {
		catchError(err, res);
	}
};

// 3. Get single project by ID
const getProjectById = async (req, res) => {
	try {
		const _id = req.params.id;

		const project = await Project.findById(_id)
			.populate('teamId', 'name _id')

		if (!project || project.isDeleted)
			return res.status(404).json({
				success: false,
				message: `Project Not Found`,
				project: null,
			});

		return res.status(200).json({
			success: true,
			message: "Project Found",
			project: project,
		})
	} catch (err) {
		catchError(err, res);
	}
};

// 4. Update project (Manager only)
const updateProject = async (req, res) => {
	try {
		const _id = req.params.id;

		const targetProject = await Project.findById(_id);

		if (!targetProject || targetProject.isDeleted) {
			return res.status(404).json({
				success: false,
				message: "Project Not Found",
			});
		}

		let {
			projectName,
			description,
			teamId,
			startDate,
			endDate,
			status
		} = req.body;

		if (projectName) projectName = sanitizeText(projectName);
		if (description) description = sanitizeText(description);

		if (teamId) {
			const team = await Team.findOne({
				_id: teamId,
				isDeleted: false,
			});

			if (!team) {
				return res.status(404).json({
					success: false,
					message: "Team Not Found",
				});
			}
		}

		if (status && !["pending", "in-progress", "done"].includes(status)) {
			return res.status(400).json({
				success: false,
				message: "Invalid status value. Must be one of: pending, in-progress, done",
			})
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (startDate) {
			const start = new Date(startDate);
			start.setHours(0, 0, 0, 0);
			if (start < today) {
				return res.status(400).json({
					success: false,
					message: "Start date cannot be in the past"
				});
			}
		}

		if (endDate) {
			const end = new Date(endDate);
			end.setHours(0, 0, 0, 0);
			if (end < today) {
				return res.status(400).json({
					success: false,
					message: "End date cannot be in the past"
				});
			}
		}

		if (startDate && endDate) {
			const start = new Date(startDate);
			const end = new Date(endDate);
			start.setHours(0, 0, 0, 0);
			end.setHours(0, 0, 0, 0);
			if (end < start) {
				return res.status(400).json({
					success: false,
					message: "End date cannot be before start date"
				});
			}
		}

		if (projectName) targetProject.projectName = projectName;
		if (description) targetProject.description = description;
		if (teamId) targetProject.teamId = teamId;
		if (startDate) targetProject.startDate = startDate;
		if (endDate) targetProject.endDate = endDate;
		if (status) targetProject.status = status;

		await targetProject.save();

		return res.status(200).json({
			success: true,
			message: `${targetProject.projectName} updated successfully`,
			project: targetProject,
		});

	} catch (err) {
		catchError(err, res);
	}
};

// 5. Delete project (Manager/Admin only)
// @desc	Soft-delete a project with full cascade:
//			- Soft-delete all tasks that belong to this project
const deleteProject = async (req, res) => {
	try {
		const _id = req.params.id;
		const project = await Project.findById(_id);

		if (!project || project.isDeleted)
			return res.status(404).json({
				success: false,
				message: "Project not found or already deleted"
			});

		// 1. Soft-delete all tasks inside this project
		await Task.updateMany(
			{ projectId: _id, isDeleted: false },
			{ $set: { isDeleted: true } }
		);

		// 2. Soft-delete the project
		project.isDeleted = true;
		await project.save();

		return res.status(200).json({
			success: true,
			message: "Project Successfully Deleted",
			project: {
				_id: project._id,
				projectName: project.projectName,
			}
		});

	} catch (err) {
		catchError(err, res);
	}
};

//*======================== [TASKS] ======================

// 1. Create new task (Manager only)
// 1. Create new task (Manager only)
const createTask = async (req, res) => {
	try {
		const { projectId } = req.params;

		const project = await Project.findOne({
			_id: projectId,
			isDeleted: false,
		});

		if (!project) {
			return res.status(404).json({
				success: false,
				message: "Project Not Found"
			});
		};

		const taskBody = req.body;

		if (taskBody.title && taskBody.assignedTo) {
			let {
				title,
				description,
				assignedTo,
				estimatedHours,
				priority,
				startDate,
				dueDate,
				checklist,
			} = taskBody;

			const userAssigned = await User.findById(assignedTo).select("-password");
			if (!userAssigned) {
				return res.status(404).json({
					success: false,
					message: "User Not Found"
				})
			}

			// FIX: Only employees can be assigned to tasks
			if (userAssigned.role !== 'employee') {
				return res.status(400).json({
					success: false,
					message: "Only employees can be assigned to tasks"
				});
			}

			const projectTeam = await Team.findOne({
				_id: project.teamId,
				isDeleted: false,
			});

			const isUserInTeam = projectTeam.members.some(
				member => member.toString() === userAssigned._id.toString()
			) || projectTeam.managerId.toString() === userAssigned._id.toString();

			if (!isUserInTeam) {
				return res.status(400).json({
					success: false,
					message: "User is not a member of the project's team"
				});
			}

			if (title) title = sanitizeText(title);
			if (description) description = sanitizeText(description);
			if (checklist) {
				checklist = checklist.map(item => ({
					text: sanitizeText(item.text),
					completed: item.completed,
				}))
			};

			if (priority && !["low", "medium", "high", "urgent"].includes(priority)) {
				return res.status(400).json({
					success: false,
					message: "Invalid priority value. Must be one of: low, medium, high, urgent",
				})
			}

			if (estimatedHours && (isNaN(estimatedHours) || estimatedHours < 0)) {
				return res.status(400).json({
					success: false,
					message: "Estimated hours must be a positive number"
				});
			}

			const today = new Date();
			today.setHours(0, 0, 0, 0);

			if (startDate) {
				const start = new Date(startDate);
				start.setHours(0, 0, 0, 0);
				if (start < today) {
					return res.status(400).json({
						success: false,
						message: "Start date cannot be in the past"
					});
				}
			}

			if (dueDate) {
				const end = new Date(dueDate);
				end.setHours(0, 0, 0, 0);
				if (end < today) {
					return res.status(400).json({
						success: false,
						message: "End date cannot be in the past"
					});
				}
			}

			if (startDate && dueDate) {
				const start = new Date(startDate);
				const end = new Date(dueDate);
				start.setHours(0, 0, 0, 0);
				end.setHours(0, 0, 0, 0);
				if (end < start) {
					return res.status(400).json({
						success: false,
						message: "End date cannot be before start date"
					});
				}
			}

			const task = await Task.create({
				title,
				description,
				assignedTo,
				projectId,
				estimatedHours,
				priority,
				startDate,
				dueDate,
				checklist,
			});

			return res.status(201).json({
				success: true,
				message: "Task Created Successfully!",
				task: {
					_id: task._id,
					title: task.title,
					description: task.description,
					assignedTo: {
						_id: userAssigned._id,
						fullName: userAssigned.fullName,
					},
					projectId: task.projectId,
					estimatedHours: task.estimatedHours,
					priority: task.priority,
					status: task.status,
					checklist: task.checklist,
					startDate: task.startDate,
					dueDate: task.dueDate,
				},
			});
		}
		else {
			return res.status(400).json({
				success: false,
				message: "Error: Missing information please provide all fields"
			});
		};


	} catch (err) {
		catchError(err, res);
	};
};

// 2. Get all tasks (Manager/Admin only)
const getAllTasks = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const { projectId } = req.params;

		const project = await Project.findOne({
			_id: projectId,
			isDeleted: false,
		});

		if (!project) {
			return res.status(404).json({
				success: false,
				message: "Project Not Found"
			});
		}

		const tasks = await Task.find({
			projectId: projectId,
			isDeleted: false
		})
			.populate({
				path: 'projectId',
				select: 'projectName teamId',
				populate: {
					path: 'teamId',
					select: 'name managerId',
				}
			})
			.populate('assignedTo', 'fullName email')
			.skip(skip)
			.limit(limit);

		const totalTasks = await Task.countDocuments({
			projectId: projectId,
			isDeleted: false
		});

		const totalPages = Math.ceil(totalTasks / limit);

		if (tasks.length == 0)
			return res.status(200).json({
				success: true,
				message: "No tasks found",
				tasks: [],
				pagination: {
					currentPage: page,
					totalPages: 0,
					totalTasks: 0,
					itemsPerPage: limit,
					hasNextPage: false,
					hasPrevPage: false,
				}
			});

		return res.status(200).json({
			success: true,
			message: "Tasks retrieved successfully",
			tasks: tasks,
			pagination: {
				currentPage: page,
				totalPages: totalPages,
				totalTasks: totalTasks,
				itemsPerPage: limit,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			}
		});
	} catch (err) {
		catchError(err, res);
	}
};

// 3. Get single task by ID
const getTaskById = async (req, res) => {
	try {
		const { projectId, taskId } = req.params;

		const project = await Project.findOne({
			_id: projectId,
			isDeleted: false,
		});

		if (!project)
			return res.status(404).json({
				success: false,
				message: "Project Not Found"
			});

		const task = await Task.findById(taskId)
			.populate('projectId', 'projectName _id')
			.populate('assignedTo', 'fullName _id')

		if (!task || task.isDeleted)
			return res.status(404).json({
				success: false,
				message: `Task Not Found`,
				task: null,
			});

		return res.status(200).json({
			success: true,
			message: "Task Found",
			task: task,
		})
	} catch (err) {
		catchError(err, res);
	}
};

// 4. Update task (Manager only)
// 4. Update task (Manager only)
const updateTask = async (req, res) => {
	try {
		const { projectId, taskId } = req.params;

		const project = await Project.findById(projectId);

		if (!project || project.isDeleted) {
			return res.status(404).json({
				success: false,
				message: "Project Not Found",
			});
		}

		const targetTask = await Task.findById(taskId);

		if (!targetTask || targetTask.isDeleted) {
			return res.status(404).json({
				success: false,
				message: "Task Not Found",
			});
		}

		let {
			title,
			description,
			assignedTo,
			estimatedHours,
			priority,
			status,
			startDate,
			dueDate,
			checklist,
		} = req.body;

		if (title) title = sanitizeText(title);
		if (description) description = sanitizeText(description);
		if (checklist) {
			checklist = checklist.map(item => ({
				text: sanitizeText(item.text),
				completed: item.completed,
			}))
		}

		if (priority && !["low", "medium", "high", "urgent"].includes(priority)) {
			return res.status(400).json({
				success: false,
				message: "Invalid priority value. Must be one of: low, medium, high, urgent",
			})
		}

		if (status && !["pending", "in-progress", "done"].includes(status)) {
			return res.status(400).json({
				success: false,
				message: "Invalid status value. Must be one of: pending, in-progress, done",
			})
		}

		if (estimatedHours && (isNaN(estimatedHours) || estimatedHours < 0)) {
			return res.status(400).json({
				success: false,
				message: "Estimated hours must be a positive number"
			});
		}

		if (assignedTo) {
			// FIX: Check if user exists first
			const userAssigned = await User.findById(assignedTo);
			if (!userAssigned) {
				return res.status(404).json({
					success: false,
					message: "User Not Found",
				});
			}
			
			// Then check role - only employees can be assigned
			if (userAssigned.role !== 'employee') {
				return res.status(400).json({
					success: false,
					message: "Only employees can be assigned to tasks"
				});
			}

			const projectTeam = await Team.findOne({
				_id: project.teamId,
				isDeleted: false,
			});

			const isUserInTeam = projectTeam.members.some(
				member => member.toString() === userAssigned._id.toString()
			) || projectTeam.managerId.toString() === userAssigned._id.toString();

			if (!isUserInTeam) {
				return res.status(400).json({
					success: false,
					message: "User is not a member of the project's team"
				});
			}
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (startDate) {
			const start = new Date(startDate);
			start.setHours(0, 0, 0, 0);
			if (start < today) {
				return res.status(400).json({
					success: false,
					message: "Start date cannot be in the past"
				});
			}
		}

		if (dueDate) {
			const end = new Date(dueDate);
			end.setHours(0, 0, 0, 0);
			if (end < today) {
				return res.status(400).json({
					success: false,
					message: "End date cannot be in the past"
				});
			}
		}

		if (startDate && dueDate) {
			const start = new Date(startDate);
			const end = new Date(dueDate);
			start.setHours(0, 0, 0, 0);
			end.setHours(0, 0, 0, 0);
			if (end < start) {
				return res.status(400).json({
					success: false,
					message: "End date cannot be before start date"
				});
			}
		}

		if (title) targetTask.title = title;
		if (description) targetTask.description = description;
		if (estimatedHours) targetTask.estimatedHours = estimatedHours;
		if (priority) targetTask.priority = priority;
		if (status) targetTask.status = status;
		if (startDate) targetTask.startDate = startDate;
		if (dueDate) targetTask.dueDate = dueDate;
		if (assignedTo) targetTask.assignedTo = assignedTo;
		if (checklist) targetTask.checklist = checklist;

		await targetTask.save();

		return res.status(200).json({
			success: true,
			message: `${targetTask.title} updated successfully`,
			task: targetTask,
		});

	} catch (err) {
		catchError(err, res);
	}
};
// 5. Delete task (Manager/Admin only)
const deleteTask = async (req, res) => {
	try {
		const { projectId, taskId } = req.params;

		const project = await Project.findById(projectId);
		const task = await Task.findById(taskId);

		if (!project || project.isDeleted)
			return res.status(404).json({
				success: false,
				message: "Project not found or already deleted"
			});

		if (!task || task.isDeleted)
			return res.status(404).json({
				success: false,
				message: "Task not found or already deleted"
			});

		task.isDeleted = true;
		await task.save();

		return res.status(200).json({
			success: true,
			message: "Task Successfully Deleted",
			task: {
				_id: task._id,
				title: task.title,
			}
		});

	} catch (err) {
		catchError(err, res);
	}
};
// ─── 1. Add to projectsController.js ──────────────────────────────────────────
// (add this function, then add it to module.exports)

const updateTaskProgress = async (req, res) => {
	try {
		const { projectId, taskId } = req.params;
		const { status, checklist } = req.body;

		const project = await Project.findById(projectId);
		if (!project || project.isDeleted)
			return res.status(404).json({ success: false, message: "Project Not Found" });

		const task = await Task.findById(taskId);
		if (!task || task.isDeleted)
			return res.status(404).json({ success: false, message: "Task Not Found" });

		// Only the assigned employee OR a manager can update progress
		const isAssigned = task.assignedTo?.toString() === req.user._id.toString();
		const isManager = req.user.role === 'manager';

		if (!isAssigned && !isManager)
			return res.status(403).json({ success: false, message: "Not authorized to update this task" });

		if (status) {
			if (!["pending", "in-progress", "done"].includes(status))
				return res.status(400).json({ success: false, message: "Invalid status value" });
			task.status = status;
		}

		if (checklist) {
			task.checklist = checklist.map(item => ({
				text: sanitizeText(item.text),
				completed: item.completed,
			}));
		}

		await task.save();

		return res.status(200).json({
			success: true,
			message: "Task progress updated",
			task,
		});
	} catch (err) {
		catchError(err, res);
	}
};

module.exports = { createProject, getAllProjects, getProjectById, updateProject, deleteProject, createTask, getAllTasks, getTaskById, updateTask, deleteTask, updateTaskProgress };
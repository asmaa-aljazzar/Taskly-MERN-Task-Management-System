const Project = require('../models/Project');
const Task = require('../models/Task');
const Team = require('../models/Team');
const User = require('../models/User')
const catchError = require('../utils/catchError');
const { sanitizeText } = require('../utils/validation');

//*======================== [PROJECTS] ======================

// 1. Create new project (Manager only)
// @desc	create a new project (Manager only)
// @route	POST /api/projects
// @access	Private/ Manager
// @Headers: 
// Authorization: Bearer Manager_TOKEN_HERE
// Content-Type: application/json
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

			// Validation
			const team = await Team.findOne({
				_id: teamId,
				isDeleted: false,
			});

			if (!team)
				return res.status(404).json({
					success: false,
					message: "Team Not Found"
				});
			// Date validation
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			// Check startDate is not in the past (can be today or future)
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

			// Check endDate is not in the past
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

			// Check endDate is after startDate
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
// @desc	Get all projects
// @route	GET /api/projects
// @access	Private/ Manager
// @Headers: 
// Authorization: Bearer Manager_TOKEN_HERE
// Content-Type: application/json
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

// 3. Get single project by ID (Manager/Admin only)
// @desc	Get single project
// @route	GET /api/projects/:id
// @access	Private/ Manager
// @Headers: 
// Authorization: Bearer Manager_TOKEN_HERE
// Content-Type: application/json
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

		// Sanitize
		if (projectName) projectName = sanitizeText(projectName);
		if (description) description = sanitizeText(description);

		// Validate team if provided
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
		// Date validations (same as create)
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
			targetProject.startDate = startDate;
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
			targetProject.endDate = endDate;
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

		// Update fields
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
// @desc	Delete project (Soft Delete).
// @route	DELETE /api/projects/:id
// @access	Private/ Manager
// @Headers: 
// Authorization: Bearer Manager_TOKEN_HERE
// Content-Type: application/json
const deleteProject = async (req, res) => {
	try {
		const _id = req.params.id;
		const project = await Project.findById(_id);

		if (!project || project.isDeleted)
			return res.status(404).json({
				success: false,
				message: "Project not found or already deleted"
			});

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
// @desc	create a new task (Manager only)
// @route	POST /api/projects/:id/
// @access	Private/ Manager
// @Headers: 
// Authorization: Bearer Manager_TOKEN_HERE
// Content-Type: application/json
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
			const projectTeam = await Team.findOne({
				_id: project.teamId,
				isDeleted: false,
			}
			)

			// Go to project team and extract members to chose from
			const isUserInTeam = projectTeam.members.some(
				// without toString the ids will not be equal
				member => member.toString() === userAssigned._id.toString()
			) || projectTeam.managerId.toString() === userAssigned._id.toString()

			if (!isUserInTeam) {
				return res.status(400).json({
					success: false,
					message: "User is not a member of the project's team"
				});
			}

			// Sanitize Input
			if (title) title = sanitizeText(title);
			if (description) description = sanitizeText(description);
			if (checklist) {
				checklist = checklist.map (item => ({
					text: sanitizeText (item.text),
					completed: item.completed,
				}))
			};

			// Validate Input
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

			// Date validation
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			// Check startDate is not in the past (can be today or future)
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

			// Check dueDate is not in the past
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

			// Check dueDate is after startDate
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
// @desc	Get all tasks
// @route	GET /api/projects/:id/tasks
// @access	Private/ Manager
// @Headers: 
// Authorization: Bearer Manager_TOKEN_HERE
// Content-Type: application/json
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

// 3. Get single task by ID (Manager/Admin only)
// @desc	Get single task
// @route	GET /api/projects/:projectId/tasks/:taskId
// @access	Private/ Manager
// @Headers: 
// Authorization: Bearer Manager_TOKEN_HERE
// Content-Type: application/json
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


		// Sanitize
		if (title) title = sanitizeText(title);
		if (description) description = sanitizeText(description);
		if (checklist) {
			checklist = checklist.map (item => ({
				text: sanitizeText (item.text),
				completed: item.completed,
			}))
		}

		// Validate Input
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
			const userAssigned = await User.findById(assignedTo);
			if (!userAssigned) {
				return res.status(404).json({
					success: false,
					message: "User Not Found",
				})
			}
			const projectTeam = await Team.findOne({
				_id: project.teamId,
				isDeleted: false,
			}
			)

			// Go to project team and extract members to chose from
			const isUserInTeam = projectTeam.members.some(
				// without toString the ids will not be equal
				member => member.toString() === userAssigned._id.toString()
			) || projectTeam.managerId.toString() === userAssigned._id.toString()

			if (!isUserInTeam) {
				return res.status(400).json({
					success: false,
					message: "User is not a member of the project's team"
				});
			}

		}


		// Date validations (same as create)
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

		// Update fields
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
// @desc	Delete task (Soft Delete).
// @route	DELETE /api/projects/:projectId/tasks/:id
// @access	Private/ Manager
// @Headers: 
// Authorization: Bearer Manager_TOKEN_HERE
// Content-Type: application/json
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

module.exports = { createProject, getAllProjects, getProjectById, updateProject, deleteProject, createTask, getAllTasks, getTaskById, updateTask, deleteTask };

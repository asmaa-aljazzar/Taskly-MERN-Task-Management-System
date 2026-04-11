const Project = require('../models/Project');
const Team = require('../models/Team');
const catchError = require('../utils/catchError');
const { sanitizeText } = require('../utils/validation');

// 1. Create new project (HR only)
// @desc	create a new project (HR only)
// @route	POST /api/projects
// @access	Private/ HR
// @Headers: 
// Authorization: Bearer HR_TOKEN_HERE
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

// 2. Get all projects (HR/Admin only)
// @desc	Get all projects
// @route	GET /api/projects
// @access	Private/ HR
// @Headers: 
// Authorization: Bearer HR_TOKEN_HERE
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

// 3. Get single project by ID (HR/Admin only)
// @desc	Get single project
// @route	GET /api/projects/:id
// @access	Private/ HR
// @Headers: 
// Authorization: Bearer HR_TOKEN_HERE
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
			targetProject.teamId = teamId;
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

// 5. Delete project (HR/Admin only)
// @desc	Delete project (Soft Delete).
// @route	DELETE /api/projects/:id
// @access	Private/ HR
// @Headers: 
// Authorization: Bearer HR_TOKEN_HERE
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

module.exports = { createProject, getAllProjects, getProjectById, updateProject, deleteProject };
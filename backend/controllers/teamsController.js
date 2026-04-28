const Team = require('../models/Team');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const catchError = require('../utils/catchError');
const { sanitizeText } = require('../utils/validation');

// 1. Create new team (HR only)
const createTeam = async (req, res) => {
	try {
		const teamBody = req.body;

		if (teamBody.name && teamBody.managerId) {
			let {
				name,
				managerId,
				members,
				description,
			} = teamBody;

			if (name) name = sanitizeText(name);
			if (description) description = sanitizeText(description);

			const manager = await User.findOne({
				_id: managerId,
				isDeleted: false
			});

			if (!manager)
				return res.status(404).json({
					success: false,
					message: "Manager Not Found"
				});

			if (manager.role !== 'manager') {
				return res.status(400).json({
					success: false,
					message: `Team manager must be Manager. ${manager.role} cannot be manager.`
				});
			}

			let validateMembersIds = [];
			if (members && members.length > 0) {
				const validateMembers = await User.find({
					_id: { $in: members },
					isDeleted: false,
				});

				if (validateMembers.length != members.length) {
					return res.status(400).json({
						success: false,
						message: "One or more members not found or account deactivated"
					});
				}

				const hasHrMember = validateMembers.some(member => member.role == 'hr');
				if (hasHrMember) {
					return res.status(400).json({
						success: false,
						message: "HR users cannot be added as regular team members"
					});
				}

				validateMembersIds = validateMembers.map(member => member._id);
			}

			const team = await Team.create({
				name,
				managerId,
				members: validateMembersIds,
				description,
			});

			return res.status(201).json({
				success: true,
				message: "Team Created Successfully!",
				team: {
					_id: team._id,
					name: team.name,
					managerId: team.managerId,
					members: team.members,
					description: team.description,
					isDeleted: false,
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

// 2. Get all teams (HR/Admin only)
const getAllTeams = async (req, res) => {
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

		const teams = await Team.find({ isDeleted: false })
			.populate('managerId', 'fullName email')
			.populate('members', 'fullName email')
			.skip(skip)
			.limit(limit);

		const totalTeams = await Team.countDocuments({ isDeleted: false });
		const totalPages = Math.ceil(totalTeams / limit);

		if (teams.length == 0)
			return res.status(200).json({
				success: true,
				message: "No teams found",
				teams: [],
				pagination: {
					currentPage: page,
					totalPages: 0,
					totalTeams: 0,
					itemsPerPage: limit,
					hasNextPage: false,
					hasPrevPage: false,
				}
			});

		return res.status(200).json({
			success: true,
			message: "Teams retrieved successfully",
			teams: teams,
			pagination: {
				currentPage: page,
				totalPages: totalPages,
				totalTeams: totalTeams,
				itemsPerPage: limit,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			}
		});
	} catch (err) {
		catchError(err, res);
	}
};

// 3. Get single team by ID
const getTeamById = async (req, res) => {
	try {
		const _id = req.params.id;

		const team = await Team.findById(_id)
			.populate('managerId', 'fullName email')
			.populate('members', 'fullName email');

		if (!team || team.isDeleted)
			return res.status(404).json({
				success: false,
				message: `Team Not Found`,
				team: null,
			});

		return res.status(200).json({
			success: true,
			message: "Team Found",
			team: team,
		})
	} catch (err) {
		catchError(err, res);
	}
};

// 4. Update team (HR/Admin only)
const updateTeam = async (req, res) => {
	try {
		const _id = req.params.id;

		const targetTeam = await Team.findById(_id);

		if (!targetTeam || targetTeam.isDeleted)
			return res.status(404).json({
				success: false,
				message: "Team Not Found",
			});

		let {
			name,
			managerId,
			members,
			description,
		} = req.body;

		if (name) name = sanitizeText(name);
		if (description) description = sanitizeText(description);

		if (managerId) {
			const manager = await User.findOne({
				_id: managerId,
				isDeleted: false,
			});

			if (!manager)
				return res.status(404).json({
					success: false,
					message: "Manager Not Found",
				});

			if (manager.role !== 'manager') {
				return res.status(400).json({
					success: false,
					message: `Team manager must be Manager. ${manager.role} cannot be manager.`
				});
			}

			targetTeam.managerId = managerId;
		}

		let validateMembersIds = [];
		if (members) {
			if (members.length > 0) {
				const validateMembers = await User.find({
					_id: { $in: members },
					isDeleted: false,
				});

				if (validateMembers.length !== members.length)
					return res.status(400).json({
						success: false,
						message: "One or more members not found or account deactivated"
					});

				const hasHrMember = validateMembers.some(member => member.role == 'hr');
				if (hasHrMember) {
					return res.status(400).json({
						success: false,
						message: "HR users cannot be added as regular team members"
					});
				}

				validateMembersIds = validateMembers.map(member => member._id);
			}
		}

		if (name) targetTeam.name = name;
		if (managerId) targetTeam.managerId = managerId;
		if (members) targetTeam.members = validateMembersIds;
		if (description) targetTeam.description = description;

		await targetTeam.save();

		return res.status(200).json({
			success: true,
			message: `${targetTeam.name} updated successfully`,
			team: targetTeam,
		});

	} catch (err) {
		catchError(err, res);
	}
};

// 5. Delete team (HR/Admin only)
// @desc	Soft-delete a team with full cascade:
//			- Soft-delete all projects that belong to this team
//			- Soft-delete all tasks inside those projects
const deleteTeam = async (req, res) => {
	try {
		const _id = req.params.id;
		const team = await Team.findById(_id);

		if (!team || team.isDeleted)
			return res.status(404).json({
				success: false,
				message: "Team not found or already deleted"
			});

		// 1. Find all active projects under this team
		const teamProjects = await Project.find({
			teamId: _id,
			isDeleted: false,
		});

		for (const project of teamProjects) {
			// 2. Soft-delete all tasks inside each project
			await Task.updateMany(
				{ projectId: project._id, isDeleted: false },
				{ $set: { isDeleted: true } }
			);

			// 3. Soft-delete the project
			project.isDeleted = true;
			await project.save();
		}

		// 4. Soft-delete the team
		team.isDeleted = true;
		await team.save();

		return res.status(200).json({
			success: true,
			message: "Team Successfully Deleted",
			team: {
				_id: team._id,
				name: team.name,
			}
		});

	} catch (err) {
		catchError(err, res);
	}
};
// teamsController.js
const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      managerId: req.user.id,
      isDeleted: false,
    })
      .populate('managerId', 'fullName email')
      .populate('members', 'fullName email');

    return res.status(200).json({
      success: true,
      teams,
    });
  } catch (err) {
    catchError(err, res);
  }
};

module.exports = { createTeam, getAllTeams, getTeamById, updateTeam, deleteTeam, getMyTeams };
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const catchError = require('../utils/catchError')
const {
	validateEmail,
	validatePassword,
	sanitizeEmail,
	sanitizeText,
	sanitizePhone
} = require('../utils/validation');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Task = require('../models/Task');

const MAX_HIRE_DATE_YEARS_AGO = 50;

// Helper: validates that a hire date is not in the future and not beyond the max past range
const validateHireDate = (hireDate) => {
	if (!(hireDate instanceof Date) || Number.isNaN(hireDate.getTime()))
		return { valid: false, message: "Invalid hire date" };

	const now = new Date();
	const minHireDate = new Date();
	minHireDate.setFullYear(now.getFullYear() - MAX_HIRE_DATE_YEARS_AGO);

	if (hireDate > now)
		return { valid: false, message: "Hire date can't be in the future!" };

	if (hireDate < minHireDate)
		return { valid: false, message: `Hire date can't be more than ${MAX_HIRE_DATE_YEARS_AGO} years in the past!` };

	return { valid: true };
};

// 1. Create new user (HR only)
// @desc	create a new user (HR only)
// @route	POST /api/users
// @access	Private/ HR
const createUser = async (req, res) => {
	try {
		const userBody = req.body;

		if (userBody.fullName && userBody.email && userBody.password && userBody.hireDate) {
			let {
				fullName,
				email,
				password,
				phoneNumber,
				profileImageUrl,
				role,
				hireDate } = userBody;

			email = sanitizeEmail(email);
			fullName = sanitizeText(fullName);
			phoneNumber = sanitizePhone(phoneNumber);

			if (!fullName)
				return res.status(400).json({ message: "Full name is required" });

			if (email && !validateEmail(email)) {
				return res.status(400).json({
					message: "Invalid email format"
				});
			}

			if (!validatePassword(password)) {
				return res.status(400).json({
					message: "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character"
				});
			}

			const hireDateObj = new Date(hireDate);
			const hireDateValidation = validateHireDate(hireDateObj);
			if (!hireDateValidation.valid) {
				return res.status(400).json({ message: hireDateValidation.message });
			}

			const userExist = await User.findOne({ email });
			if (userExist)
				return res.status(409).json({ message: "Email is already in use" });

			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			const user = await User.create({
				fullName,
				email,
				password: hashedPassword,
				phoneNumber,
				profileImageUrl,
				role,
				hireDate: hireDateObj
			});

			return res.status(201).json({
				message: "User Created Successfully!",
				user: {
					_id: user._id,
					fullName: user.fullName,
					email: user.email,
					phoneNumber: user.phoneNumber,
					profileImageUrl: user.profileImageUrl,
					role: user.role,
					hireDate: user.hireDate,
				}
			});
		}
		else {
			return res.status(400).json({ message: "Error: Missing information please provide all fields" });
		};

	} catch (err) {
		catchError(err, res);
	};
}

// 2. Get all users (HR/Admin only)
const getAllUsers = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(404).json({
				success: false,
				message: "Something Wrong Happens",
			});
		}
		const hr = req.user;

		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const users = await User.find({ isDeleted: false })
			.skip(skip)
			.limit(limit);

		const otherUsers = users.filter(user =>
			user._id.toString() !== req.user._id.toString()
		);

		const totalUsers = await User.countDocuments({ isDeleted: false });
		const totalPages = Math.ceil(totalUsers / limit);

		if (otherUsers.length == 0)
			return res.status(200).json({
				success: true,
				message: "There is no other users found besides you",
				users: [hr],
			});

		return res.status(200).json({
			success: true,
			message: "Users retrieved successfully",
			users: users,
			pagination: {
				currentPage: page,
				totalPages: totalPages,
				totalUsers: totalUsers,
				itemsPerPage: limit,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			}
		});
	} catch (err) {
		catchError(err, res);
	}
};

// 3. Get single user by ID
const getUserById = async (req, res) => {
	try {
		const _id = req.params.id;

		const user = await User.findById(_id).select("-password");
		if (!user || user.isDeleted)
			return res.status(404).json({
				success: false,
				message: `User Not Found`,
				user: null,
			});

		return res.status(200).json({
			success: true,
			message: "User Found",
			user: user,
		})
	} catch (err) {
		catchError(err, res);
	}
};

// 4. Update user (HR/Admin only)
const updateUser = async (req, res) => {
	try {
		const _id = req.params.id;

		const targetUser = await User.findById(_id);

		if (!targetUser || targetUser.isDeleted)
			return res.status(404).json({
				success: false,
				message: "User Not Found",
			})

		let {
			fullName,
			email,
			phoneNumber,
			role,
		} = req.body;

		if (fullName) fullName = sanitizeText(fullName);
		if (email) email = sanitizeEmail(email);
		if (phoneNumber) phoneNumber = sanitizePhone(phoneNumber);
		if (role) role = sanitizeText(role);

		let hireDate;
		if (req.body.hireDate) {
			hireDate = new Date(req.body.hireDate);
			const hireDateValidation = validateHireDate(hireDate);
			if (!hireDateValidation.valid) {
				return res.status(400).json({
					success: false,
					message: hireDateValidation.message,
				});
			}
		}

		if (email && !validateEmail(email))
			return res.status(400).json({
				success: false,
				message: "Invalid Email Format!",
			});

		const isExist = await User.findOne({
			email,
			_id: { $ne: _id },
		});

		if (email && isExist)
			return res.status(409).json({
				success: false,
				message: "Email is already in use"
			});

		if (role && !['hr', 'manager', 'employee'].includes(role)) {
			return res.status(400).json({
				success: false,
				message: "Invalid role: must be one of [hr, manager, employee]"
			})
		};

		if (role && targetUser.role === 'hr' && role !== targetUser.role)
			return res.status(403).json({
				success: false,
				message: "Cannot change HR user's role"
			});

		if (fullName) targetUser.fullName = fullName;
		if (email) targetUser.email = email;
		if (phoneNumber) targetUser.phoneNumber = phoneNumber;
		if (role) targetUser.role = role;
		if (hireDate) targetUser.hireDate = hireDate;
		await targetUser.save();

		const updatedUser = await User.findById(_id).select("-password");

		return res.status(200).json({
			success: true,
			message: `${updatedUser.fullName} Information Updated Successfully`,
			user: updatedUser,
		});

	} catch (err) {
		catchError(err, res);
	}
}

// 5. Delete user (HR/Admin only)
// @desc	Soft-delete a user with full cascade:
//			- Remove them from any team's members array
//			- If they were a manager: soft-delete their teams → soft-delete those teams'
//			  projects → soft-delete those projects' tasks
const deleteUser = async (req, res) => {
	try {
		const _id = req.params.id;
		const user = await User.findById(_id).select("-password");

		if (!user || user.isDeleted)
			return res.status(404).json({
				success: false,
				message: "User not found or already deleted"
			});

		// 1. Remove user from any team's members list
		await Team.updateMany(
			{ members: _id, isDeleted: false },
			{ $pull: { members: _id } }
		);

		// 2. If the deleted user was a manager, cascade delete their teams → projects → tasks
		if (user.role === 'manager') {
			// Find all active teams managed by this user
			const managedTeams = await Team.find({
				managerId: _id,
				isDeleted: false,
			});

			for (const team of managedTeams) {
				// Find all active projects belonging to this team
				const teamProjects = await Project.find({
					teamId: team._id,
					isDeleted: false,
				});

				for (const project of teamProjects) {
					// Soft-delete all tasks inside each project
					await Task.updateMany(
						{ projectId: project._id, isDeleted: false },
						{ $set: { isDeleted: true } }
					);

					// Soft-delete the project
					project.isDeleted = true;
					await project.save();
				}

				// Soft-delete the team
				team.isDeleted = true;
				await team.save();
			}
		}

		// 3. Soft-delete the user
		user.isDeleted = true;
		await user.save();

		return res.status(200).json({
			success: true,
			message: "User Successfully Deleted",
			user: {
				_id: user._id,
				fullName: user.fullName,
				isDeleted: user.isDeleted
			}
		});

	} catch (err) {
		catchError(err, res);
	}
}

// Get users by role
const getUsersByRole = async (req, res) => {
	try {
		const { role } = req.params;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const validRoles = ['hr', 'manager', 'employee'];
		if (!validRoles.includes(role)) {
			return res.status(400).json({
				success: false,
				message: `Invalid role. Must be: ${validRoles.join(', ')}`
			});
		}

		const users = await User.find({
			role,
			isDeleted: false
		})
			.select('-password')
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		const totalUsers = await User.countDocuments({
			role,
			isDeleted: false
		});
		const totalPages = Math.ceil(totalUsers / limit);

		if (users.length === 0) {
			return res.status(200).json({
				success: true,
				message: `No ${role} users found`,
				users: [],
				pagination: {
					currentPage: page,
					totalPages: 0,
					totalUsers: 0,
					itemsPerPage: limit,
					hasNextPage: false,
					hasPrevPage: false
				}
			});
		}

		return res.status(200).json({
			success: true,
			message: `${users.length} ${role}(s) found`,
			users,
			pagination: {
				currentPage: page,
				totalPages,
				totalUsers,
				itemsPerPage: limit,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1
			}
		});

	} catch (err) {
		catchError(err, res);
	}
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, getUsersByRole };

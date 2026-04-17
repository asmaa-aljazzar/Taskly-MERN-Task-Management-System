const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Task = require('../models/Task');
const catchError = require('../utils/catchError');

// Employee dashboard function will go here
const getEmployeeDashboard = async (req, res) => {
	try {
		const _id = req.user.id;

		// Get All Tasks
		const tasks = await Task.find(
			{
				assignedTo: _id,
				isDeleted: false,
			}
		)

		// Calculate task statistics
		const totalTasks = tasks.length;
		const pendingTasks = tasks
			.filter(task => task.status === "pending").length;
		const inProgressTasks = tasks
			.filter(task => task.status === "in-progress").length;
		const completedTasks = tasks
			.filter(task => task.status === "done").length;

		// Get Recent Tasks
		const recentTasks = tasks
			.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
			.slice(0, 5)
			.map(task => ({
				taskName: task.title,
				status: task.status,
				priority: task.priority,
				createdOn: task.createdAt
			})
			)

		res.status(200).json({
			success: true,
			dashboard: {
				stats: {
					totalTasks,
					pendingTasks,
					inProgressTasks,
					completedTasks,
				},
				recentTasks,
			}
		})
	} catch (err) {
		catchError(err, res);
	}
}

// Manager dashboard function will go here
const getManagerDashboard = async (req, res) => {
	try {
		const _id = req.user.id;

		const teams = await Team.find({
			managerId: _id,
			isDeleted: false,
		})

		const teamIds = teams.map(team => team._id);

		const projects = await Project.find({
			teamId: { $in: teamIds },
			isDeleted: false,
		})

		const projectIds = projects.map(project => project._id);

		const tasks = await Task.find({
			projectId: { $in: projectIds },
			isDeleted: false,
		})

		const totalTasks = tasks.length;
		const pendingTasks = tasks.filter(task => task.status === "pending").length;
		const inProgressTasks = tasks.filter(task => task.status === "in-progress").length;
		const completedTasks = tasks.filter(task => task.status === "done").length;

		const totalProjects = projects.length;
		const pendingProjects = projects.filter(project => project.status === "pending").length;
		const inProgressProjects = projects.filter(project => project.status === "in-progress").length;
		const completedProjects = projects.filter(project => project.status === "done").length;

		const recentTasks = tasks
			.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
			.slice(0, 5)
			.map(task => ({
				taskName: task.title,
				status: task.status,
				priority: task.priority,
				projectName: projects.find(p => p._id.equals(task.projectId)?.projectName),
				createdOn: task.createdAt,
			}))

		res.status(200).json({
			success: true,
			dashboard: {
				stats: {
					totalTeams: teams.length,
					totalProjects,
					totalTasks,
					pendingTasks,
					inProgressTasks,
					completedTasks,
					projectProgress: {
						pending: pendingProjects,
						inProgress: inProgressProjects,
						completed: completedProjects
					}
				},
				recentTasks
			}
		});
	} catch (err) {
		catchError(err, res);
	}
}

// HR dashboard function will go here
const getHrDashboard = async (req, res) => {
	try {
		const users = await User.find({ isDeleted: false, })

		const totalUsers = users.length;
		const totalEmployees = users.filter(user => user.role === 'employee').length;
		const totalManagers = users.filter(user => user.role === 'manager').length;
		const totalHrs = users.filter(user => user.role === 'hr').length;

		const teams = await Team.find({ isDeleted: false });
		const projects = await Project.find({ isDeleted: false });

		res.status(200).json({
			success: true,
			dashboard: {
				users: {
					total: totalUsers,
					employees: totalEmployees,
					managers: totalManagers,
					hr: totalHrs
				},
				teams: teams.length,
				projects: projects.length
			}
		});


	} catch (err) {
		catchError(err, res);
	}
}

module.exports = { getEmployeeDashboard, getManagerDashboard, getHrDashboard };
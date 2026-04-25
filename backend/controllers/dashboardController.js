const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Task = require('../models/Task');
const catchError = require('../utils/catchError');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const countByStatus = (items, status) =>
	items.filter(item => item.status === status).length;

const completionRate = (completed, total) =>
	total > 0 ? Math.round((completed / total) * 100) : 0;

const formatTask = task => ({
	taskName: task.title,
	status:   task.status,
	priority: task.priority,
	createdOn: task.createdAt,
});

// ─── Employee Dashboard ────────────────────────────────────────────────────────

const getEmployeeDashboard = async (req, res) => {
	try {
		const tasks = await Task.find({
			assignedTo: req.user.id,
			isDeleted:  false,
		});

		const totalTasks      = tasks.length;
		const pendingTasks    = countByStatus(tasks, 'pending');
		const inProgressTasks = countByStatus(tasks, 'in-progress');
		const completedTasks  = countByStatus(tasks, 'done');

		const recentTasks = [...tasks]
			.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
			.slice(0, 5)
			.map(formatTask);

		res.status(200).json({
			success: true,
			dashboard: {
				stats: {
					totalTasks,
					pendingTasks,
					inProgressTasks,
					completedTasks,
					completionRate: completionRate(completedTasks, totalTasks),
				},
				recentTasks,
			},
		});
	} catch (err) {
		catchError(err, res);
	}
};

// ─── Manager Dashboard ─────────────────────────────────────────────────────────

const getManagerDashboard = async (req, res) => {
	try {
		const teams = await Team.find({
			managerId: req.user.id,
			isDeleted:  false,
		});

		const teamIds = teams.map(t => t._id);

		const projects = await Project.find({
			teamId:    { $in: teamIds },
			isDeleted: false,
		});

		const projectIds = projects.map(p => p._id);

		const tasks = await Task.find({
			projectId: { $in: projectIds },
			isDeleted:  false,
		});

		const totalTasks      = tasks.length;
		const pendingTasks    = countByStatus(tasks, 'pending');
		const inProgressTasks = countByStatus(tasks, 'in-progress');
		const completedTasks  = countByStatus(tasks, 'done');

		const totalProjects      = projects.length;
		const pendingProjects    = countByStatus(projects, 'pending');
		const inProgressProjects = countByStatus(projects, 'in-progress');
		const completedProjects  = countByStatus(projects, 'done');

		const recentTasks = [...tasks]
			.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
			.slice(0, 5)
			.map(task => {
				const project = projects.find(p => p._id.equals(task.projectId));
				return {
					...formatTask(task),
					projectName: project?.projectName ?? 'No Project',
				};
			});

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
					taskCompletionRate:    completionRate(completedTasks, totalTasks),
					projectCompletionRate: completionRate(completedProjects, totalProjects),
					projectProgress: {
						pending:    pendingProjects,
						inProgress: inProgressProjects,
						completed:  completedProjects,
					},
				},
				recentTasks,
			},
		});
	} catch (err) {
		catchError(err, res);
	}
};

// ─── HR Dashboard ──────────────────────────────────────────────────────────────

const getHrDashboard = async (req, res) => {
	try {
		const [users, teams, projects, tasks] = await Promise.all([
			User.find({ isDeleted: false }),
			Team.find({ isDeleted: false }).populate('managerId', 'name email'),
			Project.find({ isDeleted: false }),
			Task.find({ isDeleted: false }).populate('assignedTo', 'name email role'),
		]);

		// ── User stats ───────────────────────────────────────────────────────────
		const totalUsers     = users.length;
		const totalEmployees = users.filter(u => u.role === 'employee').length;
		const totalManagers  = users.filter(u => u.role === 'manager').length;
		const totalHrs       = users.filter(u => u.role === 'hr').length;

		// ── Team stats ───────────────────────────────────────────────────────────
		const totalTeams         = teams.length;
		const teamsWithManagers  = teams.filter(t => t.managerId).length;
		const teamsWithoutManagers = totalTeams - teamsWithManagers;

		// ── Project stats ────────────────────────────────────────────────────────
		const totalProjects      = projects.length;
		const pendingProjects    = countByStatus(projects, 'pending');
		const inProgressProjects = countByStatus(projects, 'in-progress');
		const completedProjects  = countByStatus(projects, 'done');
		const projectCompletionRate = completionRate(completedProjects, totalProjects);

		// ── Task stats ───────────────────────────────────────────────────────────
		const totalTasks      = tasks.length;
		const pendingTasks    = countByStatus(tasks, 'pending');
		const inProgressTasks = countByStatus(tasks, 'in-progress');
		const completedTasks  = countByStatus(tasks, 'done');
		const taskCompletionRate = completionRate(completedTasks, totalTasks);

		const tasksByPriority = {
			low:    tasks.filter(t => t.priority === 'low').length,
			medium: tasks.filter(t => t.priority === 'medium').length,
			high:   tasks.filter(t => t.priority === 'high').length,
			urgent: tasks.filter(t => t.priority === 'urgent').length,
		};

		// ── Employee workload (no extra DB calls — uses already-fetched data) ────
		const workload = users
			.filter(u => u.role === 'employee')
			.map(employee => {
				const uid = employee._id.toString();

				const employeeTasks = tasks.filter(
					t => t.assignedTo?._id?.toString() === uid
				);

				const completed  = countByStatus(employeeTasks, 'done');
				const inProgress = countByStatus(employeeTasks, 'in-progress');
				const pending    = countByStatus(employeeTasks, 'pending');

				// Find teams the employee belongs to, then match projects
				const memberTeamIds = teams
					.filter(t => t.members?.some(m => m.toString() === uid))
					.map(t => t._id.toString());

				const activeProjects = projects.filter(
					p => memberTeamIds.includes(p.teamId?.toString()) && p.status !== 'done'
				).length;

				return {
					employeeId:    employee._id,
					employeeName:  employee.name,
					employeeEmail: employee.email,
					stats: {
						totalTasks:     employeeTasks.length,
						completed,
						inProgress,
						pending,
						completionRate: completionRate(completed, employeeTasks.length),
					},
					activeProjects,
				};
			})
			// Sort by lowest completion rate first (most at-risk employees first)
			.sort((a, b) => a.stats.completionRate - b.stats.completionRate)
			.slice(0, 10);

		// ── Recent tasks ─────────────────────────────────────────────────────────
		const recentTasks = [...tasks]
			.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
			.slice(0, 10)
			.map(task => {
				const project = projects.find(
					p => p._id.toString() === task.projectId?.toString()
				);
				return {
					taskId:      task._id,
					taskName:    task.title,
					status:      task.status,
					priority:    task.priority,
					assignedTo:  task.assignedTo?.name ?? 'Unassigned',
					projectName: project?.projectName ?? 'No Project',
					createdOn:   task.createdAt,
					dueDate:     task.dueDate ?? null,
				};
			});

		// ── Response ─────────────────────────────────────────────────────────────
		res.status(200).json({
			success: true,
			dashboard: {
				summary: {
					totalUsers,
					totalEmployees,
					totalManagers,
					totalHrs,
					totalTeams,
					totalProjects,
					totalTasks,
					taskCompletionRate,
					projectCompletionRate,
				},
				users: {
					total:     totalUsers,
					employees: totalEmployees,
					managers:  totalManagers,
					hr:        totalHrs,
					distribution: [
						{ name: 'Employees', value: totalEmployees, color: '#10B981' },
						{ name: 'Managers',  value: totalManagers,  color: '#F59E0B' },
						{ name: 'HR',        value: totalHrs,       color: '#484bf2' },
					],
				},
				teams: {
					total:            totalTeams,
					withManagers:     teamsWithManagers,
					withoutManagers:  teamsWithoutManagers,
					list: teams.map(t => ({
						id:      t._id,
						name:    t.teamName,
						manager: t.managerId?.name ?? 'No Manager Assigned',
					})),
				},
				projects: {
					total: totalProjects,
					status: {
						pending:    pendingProjects,
						inProgress: inProgressProjects,
						completed:  completedProjects,
					},
					completionRate: projectCompletionRate,
				},
				tasks: {
					total: totalTasks,
					status: {
						pending:    pendingTasks,
						inProgress: inProgressTasks,
						completed:  completedTasks,
					},
					completionRate: taskCompletionRate,
					byPriority:     tasksByPriority,
					priorityData: [
						{ name: 'Low',    value: tasksByPriority.low,    color: '#10B981' },
						{ name: 'Medium', value: tasksByPriority.medium, color: '#F59E0B' },
						{ name: 'High',   value: tasksByPriority.high,   color: '#EF4444' },
						{ name: 'Urgent', value: tasksByPriority.urgent, color: '#8B5CF6' },
					],
				},
				workload,
				recentTasks,
			},
		});
	} catch (err) {
		catchError(err, res);
	}
};

module.exports = { getEmployeeDashboard, getManagerDashboard, getHrDashboard };
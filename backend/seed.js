const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Team = require('./models/Team');
const Project = require('./models/Project');
const Task = require('./models/Task');

const SEED_TAG = 'seed.taskly.local';
const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || 'Taskly@123';

const getNumberOption = (name, fallback, min = 1, max = 10000) => {
	const prefix = `--${name}=`;
	const argument = process.argv.find((value) => value.startsWith(prefix));
	const value = argument ? Number(argument.slice(prefix.length)) : fallback;

	if (!Number.isInteger(value) || value < min || value > max) {
		throw new Error(`--${name} must be an integer between ${min} and ${max}`);
	}

	return value;
};

const options = {
	managers: getNumberOption('managers', 5, 1, 100),
	employees: getNumberOption('employees', 50, 1, 5000),
	teams: getNumberOption('teams', 10, 1, 500),
	projectsPerTeam: getNumberOption('projects-per-team', 4, 1, 100),
	tasksPerProject: getNumberOption('tasks-per-project', 20, 1, 500),
	reset: process.argv.includes('--reset'),
};

const totalProjects = options.teams * options.projectsPerTeam;
const totalTasks = totalProjects * options.tasksPerProject;
if (totalTasks > 250000) {
	throw new Error('Requested dataset is too large. Keep the generated task count at or below 250,000.');
}

const addDays = (date, days) => {
	const result = new Date(date);
	result.setUTCDate(result.getUTCDate() + days);
	return result;
};

const seededEmail = (prefix, index) =>
	index === undefined ? `${prefix}@${SEED_TAG}` : `${prefix}${index}@${SEED_TAG}`;

const makeChecklist = (taskIndex, status) => [
	{ text: 'Review requirements', completed: status !== 'pending' },
	{ text: 'Complete implementation', completed: status === 'done' },
	{ text: 'Verify and document', completed: status === 'done' && taskIndex % 2 === 0 },
];

const removeOnlySeedData = async () => {
	const seedUsers = await User.find({ email: { $regex: `@${SEED_TAG}$` } }).select('_id');
	const userIds = seedUsers.map((user) => user._id);
	const seedTeams = await Team.find({ managerId: { $in: userIds } }).select('_id');
	const teamIds = seedTeams.map((team) => team._id);
	const seedProjects = await Project.find({ teamId: { $in: teamIds } }).select('_id');
	const projectIds = seedProjects.map((project) => project._id);

	await Task.deleteMany({ projectId: { $in: projectIds } });
	await Project.deleteMany({ _id: { $in: projectIds } });
	await Team.deleteMany({ _id: { $in: teamIds } });
	await User.deleteMany({ _id: { $in: userIds } });
};

const seed = async () => {
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI is missing. Add it to backend/.env before seeding.');
	}

	await mongoose.connect(process.env.MONGO_URI);
	console.log('Connected to MongoDB.');

	const existingSeedUser = await User.exists({ email: { $regex: `@${SEED_TAG}$` } });
	if (existingSeedUser && !options.reset) {
		throw new Error('Seed data already exists. Re-run with --reset to replace seed data only.');
	}

	if (options.reset) {
		await removeOnlySeedData();
		console.log('Previous Taskly seed data removed. Your other data was not touched.');
	}

	const password = await bcrypt.hash(DEFAULT_PASSWORD, 10);
	const now = new Date();
	const users = [
		{ fullName: 'Taskly HR Administrator', email: seededEmail('hr'), password, phoneNumber: '+962790000000', role: 'hr', hireDate: addDays(now, -900) },
		...Array.from({ length: options.managers }, (_, index) => ({
			fullName: `Demo Manager ${index + 1}`, email: seededEmail('manager', index + 1), password,
			phoneNumber: `+96279${String(index + 1).padStart(7, '0')}`, role: 'manager', hireDate: addDays(now, -(700 - index * 7)),
		})),
		...Array.from({ length: options.employees }, (_, index) => ({
			fullName: `Demo Employee ${index + 1}`, email: seededEmail('employee', index + 1), password,
			phoneNumber: `+96278${String(index + 1).padStart(7, '0')}`, role: 'employee', hireDate: addDays(now, -(500 - (index % 365))),
		})),
	];

	const createdUsers = await User.insertMany(users);
	const managers = createdUsers.filter((user) => user.role === 'manager');
	const employees = createdUsers.filter((user) => user.role === 'employee');
	const teams = Array.from({ length: options.teams }, (_, index) => {
		const membersPerTeam = Math.max(1, Math.ceil(employees.length / options.teams));
		const members = Array.from({ length: membersPerTeam }, (__, memberIndex) =>
			employees[(index * membersPerTeam + memberIndex) % employees.length]._id
		);
		return {
			name: `Demo Team ${index + 1}`, managerId: managers[index % managers.length]._id,
			members: [...new Set(members.map(String))], description: `Seeded team ${index + 1} for hosting and UI demonstrations.`,
		};
	});
	const createdTeams = await Team.insertMany(teams);

	const projectStatuses = ['pending', 'in-progress', 'done'];
	const projects = createdTeams.flatMap((team, teamIndex) =>
		Array.from({ length: options.projectsPerTeam }, (_, projectIndex) => {
			const status = projectStatuses[(teamIndex + projectIndex) % projectStatuses.length];
			return {
				projectName: `Project ${teamIndex + 1}.${projectIndex + 1}`, description: 'Realistic demonstration project generated by the Taskly seeder.',
				teamId: team._id, progressPercentage: status === 'done' ? 100 : status === 'in-progress' ? 50 : 0,
				startDate: addDays(now, -30 + projectIndex * 3), endDate: addDays(now, 30 + projectIndex * 7), status,
			};
		})
	);
	const createdProjects = await Project.insertMany(projects);

	const priorities = ['low', 'medium', 'high', 'urgent'];
	const tasks = createdProjects.flatMap((project, projectIndex) =>
		Array.from({ length: options.tasksPerProject }, (_, taskIndex) => {
			const status = projectStatuses[(projectIndex + taskIndex) % projectStatuses.length];
			return {
				title: `Task ${projectIndex + 1}.${taskIndex + 1}`, projectId: project._id,
				description: 'Generated task with an assignee, dates, priority, and checklist.', checklist: makeChecklist(taskIndex, status),
				estimatedHours: 2 + (taskIndex % 15), startDate: addDays(now, -10 + (taskIndex % 10)), dueDate: addDays(now, 2 + (taskIndex % 30)),
				priority: priorities[taskIndex % priorities.length], status, assignedTo: employees[(projectIndex + taskIndex) % employees.length]._id,
			};
		})
	);
	await Task.insertMany(tasks);

	console.log('\nTaskly demo data created successfully:');
	console.log(`  Users: ${createdUsers.length} (1 HR, ${managers.length} managers, ${employees.length} employees)`);
	console.log(`  Teams: ${createdTeams.length}`);
	console.log(`  Projects: ${createdProjects.length}`);
	console.log(`  Tasks: ${tasks.length}`);
	console.log('\nDemo logins:');
	console.log(`  HR: ${seededEmail('hr')}`);
	console.log(`  Manager: ${seededEmail('manager', 1)}`);
	console.log(`  Employee: ${seededEmail('employee', 1)}`);
	console.log(`  Password for all demo accounts: ${process.env.SEED_PASSWORD ? '(the SEED_PASSWORD value you supplied)' : DEFAULT_PASSWORD}`);
};

seed()
	.catch((error) => {
		console.error(`Seed failed: ${error.message}`);
		process.exitCode = 1;
	})
	.finally(async () => {
		await mongoose.connection.close();
	});

// const mongoose = require('mongoose');

// const { userSchema } = require('./User');
// const { teamSchema } = require('./Team');
// const { taskSchema } = require('./Task');
// const { projectSchema } = require('./Project');
// const { timeLogShcema } = require('./TimeLog');

// // Create Models.
// const User = mongoose.model("User", userSchema);
// const Team = mongoose.model("Team", teamSchema);
// const Task = mongoose.model("Task", taskSchema);
// const Project = mongoose.model("Project", projectSchema);
// const TimeLog = mongoose.model("TimeLog", timeLogShcema);

// const connectDB = async () => {
// 	try {
// 		await mongoose.connect('mongodb://127.0.0.1:27017/test');
// 		console.log("MongoDB Connected!");
// 	}
// 	catch (err) {
// 		console.log("Error Connecting MongoDB!", err);
// 	}
// }

// const testSchemas = async () => {
// 	try {
// 		await connectDB();

// 		await User.deleteMany({});
// 		await Team.deleteMany({});
// 		await Project.deleteMany({});
// 		await Task.deleteMany({});
// 		await TimeLog.deleteMany({});

// 		console.log("All collections cleared!");

// 		const user = await User.create({
// 			fullName: "Asmaa Aljazzar",
// 			email: "asma.jazar.319@gmail.com",
// 			password: "123456",
// 			phoneNumber: "+962 791148019",
// 			profileImageUrl: "./img",
// 			role: "manager",
// 			hireDate: new Date(),
// 		});

// 		const team = await Team.create({
// 			name: "Frontend",
// 			managerId: user._id,
// 			members: [user._id],
// 			description: "HomePage",
// 		});

// 		const project = await Project.create({
// 			projectName: "Taskly",
// 			team: team._id,
// 			progressPercentage: 30,
// 			startDate: new Date(),
// 		},);

// 		const task = await Task.create({
// 			title: "Nav Bar",
// 			projectId: project._id,
// 			estimatedHours: 0.30,
// 			dueDate: new Date(2026, 16, 3),
// 			priority: "urgent",
// 			assignedTo: user._id,
// 		},);

// 		const task1 = await Task.create({
// 			title: "Home page",
// 			projectId: project._id,
// 			estimatedHours: 0.30,
// 			dueDate: new Date(2026, 16, 3),
// 			priority: "urgent",
// 			assignedTo: user._id,
// 		},);

// 		const task2 = await Task.create({
// 			title: "Landing page",
// 			projectId: project._id,
// 			estimatedHours: 0.30,
// 			dueDate: new Date(2026, 16, 3),
// 			priority: "urgent",
// 			assignedTo: user._id,
// 		},);

// 		const task3 = await Task.create({
// 			title: "About Us",
// 			projectId: project._id,
// 			estimatedHours: 0.30,
// 			dueDate: new Date(2026, 16, 3),
// 			priority: "urgent",
// 			assignedTo: user._id,
// 		},);

// 		const timeLog = await TimeLog.create({
// 			userId: user._id,
// 			taskId: task1._id,
// 			startDate: new Date(2026),
// 			endDate: new Date(2028)
// 		},);

// 		const timeLog1 = await TimeLog.create({
// 			userId: user._id,
// 			taskId: task1._id,
// 			startDate: new Date(2027),
// 			endDate: new Date(2029)
// 		},);

// 		const timeLog2 = await TimeLog.create({
// 			userId: user._id,
// 			taskId: task1._id,
// 			startDate: new Date(2028),
// 			endDate: new Date(2030)
// 		},);

// 		// console.log("A new User has been created! ", user);
// 		// console.log("A new Team has been created! ", team);
// 		// console.log("A new Project has been created! ", project);
// 		// console.log("A new Tasks has been added! ", task, task1, task2, task3);
// 		// console.log("A new TimeLogs has been added! ", timeLog, timeLog1, timeLog2);

// 		// const allUserTasks = User.findById(user._id)
// 		// 	.populate("tasks").populate("timeLogs");
// 		const allUserTasks = await User.findById(user._id)
// 			.populate(['tasks', 'timeLogs']);
// 		console.log("All User Tasks!", allUserTasks);
// 	} catch (err) {
// 		console.log("Error in testSchemas", err);
// 	}
// };

// testSchemas().then(() => mongoose.disconnect());
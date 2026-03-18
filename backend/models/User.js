const mongoose = require('mongoose');

// Defines the structure of the User document in MongoDB
exports.userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			require: true,
		},
		// Stored as string to preserve formatting (e.g., +962, leading zeros).
		phoneNumber: {
			type: String,
			default: "",
		},
		profileImageUrl: {
			type: String,
			default: "",
		},
		role: {
			type: String,
			enum: ["hr", "manager", "employee"], // Role-based
			default: "employee",
		},
		hireDate: {
			type: Date,
			required: true,
		},
		// reportsTo: {
		// 	type: mongoose.Schema.Types.ObjectId, // Stores the ID of the manager this employee reports to.
		// 	ref: "User", // User model.
		// 	default: null // If the employee has no manager.
		// },
	},
	{ timestamps: true }
);

/* 
* Virtual field to fetch all tasks assigned to this user.
* Each task has a reference to the user in the `assignedTo` field.
* Use populate() on this virtual to get the tasks.
* Use for [ 1 to M ] relationships.
*/

exports.userSchema.virtual ("tasks", {
	ref: "Task",
	localField: "_id",
	foreignField: "assignedTo",
});

exports.userSchema.virtual ("timeLogs", {
	ref: "TimeLog",
	localField: "_id",
	foreignField: "userId",
});

exports.userSchema.virtual ("teams",{
	ref: "Team",
	localField: "_id",
	foreignField: "managerId",
})

exports.userSchema.set ("toObject", { virtuals: true });
exports.userSchema.set ("toJSON", { virtuals: true });

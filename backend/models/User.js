const mongoose = require('mongoose');

// Defines the structure of the User document in MongoDB
exports.UserSchema = new mongoose.Schema(
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
		reportsTo: {
			type: mongoose.Schema.Types.ObjectId, // Stores the ID of the manager this employee reports to.
			ref: "User", // User model.
			default: null // If the employee has no manager.
		},
	},
	{ timestamps: ture }
);

/* 
* Virtual field to fetch all tasks assigned to this user.
* Each task has a reference to the user in the `assignedTo` field.
* Use populate() on this virtual to get the tasks.
* Use for [ 1 to M ] relationships.
*/

exports.UserSchema.virtual ("tasks", {
	ref: "Task",
	localField: "_id",
	foreignField: "assignedTo",
});

exports.UserSchema.virtual ("timeLog", {
	ref: "TimeLog",
	localField: "_id",
	foreignField: "userId",
});

exports.UserSchema.set ("toObject", { virtuals: true });
exports.UserSchema.set ("toJSON", { virtuals: true });
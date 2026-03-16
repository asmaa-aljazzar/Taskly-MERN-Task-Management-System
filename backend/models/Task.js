const mongoose = require ('mongoose');

exports.taskSchema = new mongoose.Schema (
	{
		title: {
			type: String,
			required: true,
		},
		projectId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Project",
			required: true,
		},
		description: {
			type: String,
			default: "",
		},
		estimatedHours: {
			type: Number,
			default: 0,
		},
		startDate: {
			type: Date,
			default: null,
		},
		dueDate: {
			type: Date,
			default: null,
		},
		priority: {
			type: String,
			enum: ["low", "medium", "high", "urgent"],
			default: "medium",
		},
		status: {
			type: String,
			enum: ["pending", "in-progress", "done"],
			default: "pending",
		},
		assignedTo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	
	{timestamps: true}
);

// exports.taskSchema.virtual ("timeLogs",{
// 	ref: 'TimeLog',
// 	localField: '_id',
// 	foreignField: 'taskId'
// });

// exports.taskSchema.set ("toObject", { virtuals: true });
// exports.taskSchema.set ("toJSON", { virtuals: true });
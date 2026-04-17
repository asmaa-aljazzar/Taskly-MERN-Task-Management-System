const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema(
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
		checklist: {
			type: [{
				text: String,
				completed: {
					type: Boolean,
					default: false,
				}
			}],
			default: [],
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
			default: null,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		}
	},

	{ timestamps: true }
);

//taskSchema.virtual ("timeLogs",{
// 	ref: 'TimeLog',
// 	localField: '_id',
// 	foreignField: 'taskId'
// });

//taskSchema.set ("toObject", { virtuals: true });
//taskSchema.set ("toJSON", { virtuals: true });

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
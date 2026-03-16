const mongoose = require ('mongoose');

exports.projectSchema = new mongoose.Schema (
	{
		projectName: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: "",
		},
		// manager: {
		// 	type: mongoose.Schema.Types.ObjectId,
		// 	ref: "User",
		// 	required: true,
		// },
		progressPercentage: {
			type: Number,
			default: 0,
		},
		startDate: {
			type: Date,
			default: null,
		},
		endDate: {
			type: Date,
			default: null,
		}
	},
	{ timestamps: true },
);

//? Virtual field to get all tasks for this project
exports.projectSchema.virtual ('tasks',
	{
		ref: 'Task',
		localField: '_id',
		foreignField: 'projectId',
	}
);

// Include virtuals when converting documents to plain objects or to JSON (API res).
// mongoose will not ignore virtuals.
exports.projectSchema.set ('toObject', { virtuals: true });
exports.projectSchema.set ('toJSON', { virtuals: true });

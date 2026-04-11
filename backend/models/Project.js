const mongoose = require ('mongoose');

const projectSchema = new mongoose.Schema (
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
		teamId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Team",
			required: true,
		},
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
		},
		status: {
			type: String,
			enum: ["pending", "in-progress", "done"],
			default: "pending",
		},
		isDeleted: {
			type: Boolean,
			default: false,
		}
	},
	{ timestamps: true },
);

//? Virtual field to get all tasks for this project
projectSchema.virtual ('tasks',
	{
		ref: 'Task',
		localField: '_id',
		foreignField: 'projectId',
	}
);

// Include virtuals when converting documents to plain objects or to JSON (API res).
// mongoose will not ignore virtuals.
projectSchema.set ('toObject', { virtuals: true });
projectSchema.set ('toJSON', { virtuals: true });

const Project = mongoose.model ("Project", projectSchema);
module.exports = Project;

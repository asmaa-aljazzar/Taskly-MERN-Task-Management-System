const mongoose = require ('mongoose');

exports.teamSchema = new mongoose.Schema (
	{
		name: {
			type: String,
			required: true,
		},
		managerId:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		members: [
			{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
			}
		],
		description: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true},
);

exports.teamSchema.virtual ("projects", {
	ref: "Project",
	localField: "_id",
	foreignField: "team",
});

exports.teamSchema.set ("toObject",{ virtuals: true });
exports.teamSchema.set ("toJSON",{ virtuals: true });


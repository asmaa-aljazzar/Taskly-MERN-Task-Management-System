const mongoose = require ('mongoose');

// always populate the Many side.
const teamSchema = new mongoose.Schema (
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
		isDeleted: {
			type: Boolean,
			default: false,
		},
		// deletedAt: {
		// 	type: Date,
		// 	default: null,
		// }
	},
	{ timestamps: true},
);

teamSchema.virtual ("projects", {
	ref: "Project",
	localField: "_id",
	foreignField: "team",
});

teamSchema.set ("toObject",{ virtuals: true });
teamSchema.set ("toJSON",{ virtuals: true });

const Team = mongoose.model ('Team', teamSchema);
module.exports = Team;

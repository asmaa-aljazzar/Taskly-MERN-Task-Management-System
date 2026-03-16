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
			type: Stirng,
			default: "",
		},
	},
	{ timestamps: true},
);


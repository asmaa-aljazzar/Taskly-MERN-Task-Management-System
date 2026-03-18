const mongoos = require ('mongoose');

exports.timeLogShcema = mongoos.Schema(
	{
		userId: {
			type: mongoos.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		taskId: {
			type: mongoos.Schema.Types.ObjectId,
			ref: "Task",
			require: true,
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
	},
	{ timestamps: true},
);

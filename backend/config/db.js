const mongoose = require ('mongoose'); // Library to connect and work with MongoDB

/*
* Connect to MongoDB asynchronously: wait for the connection to finish
* If it succeeds, log success; if it fails, catch and log the error 
*/

exports.connectDB = async () => {
	try {
		await mongoose.connect (process.env.MONGO_URI,{});
		console.log ("MongoDB connected successfully!");
	} catch (err)
	{
		console.log ("Error Connecting to MongoDB!", err);
	}
}
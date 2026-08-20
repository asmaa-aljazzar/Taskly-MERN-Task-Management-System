const mongoose = require ('mongoose'); // Library to connect and work with MongoDB

/*
* Connect to MongoDB asynchronously: wait for the connection to finish
* If it succeeds, log success; if it fails, catch and log the error 
*/

/*
* When Node.js receives a termination signal like SIGINT (sent when you press Ctrl+C)
* Mongoose keeps database connection pools active unless you intercept that event
* and explicitly call mongoose.connection.close() before calling process.exit().
* Without this, pending operations can be abruptly severed,
* potentially corrupting active writes or leaving lingering connections on MongoDB Atlas.
*/
exports.connectDB = async () => {
	try {
		await mongoose.connect (process.env.MONGO_URI,{});
		console.log ("MongoDB connected successfully!");
		process.once("SIGINT", async () => {
			await mongoose.connection.close();
			process.exit(0);
		});
	} catch (err)
	{
		console.log ("Error Connecting to MongoDB!", err);
		//* New: Exit when failure
		process.exit (1);
	}
}

require ('dotenv').config (); // All Env Variables must be in .env file, for security reason.
const express = require ('express'); // Node.js Framework that makes building web servers and handling requests simple.
const cors = require ('cors'); // To solve CORS error.
const path = require ('path'); // A Node.js module with functions that simplify creating and handling file or folder paths.
const { connectDB } = require('./config/db');

//! App → Middleware → Database → Routes → Server listening

/* 
? A CORS:
*	error happens when a browser blocks requests from one domain to another for security,
*	and requiring cors in Express allows those requests:
*	- Modify req or res objects.
*	- Check authentication.
*	- Handle errors.
*	- Log requests.
*	- Enable CORS.
*/

// Create an express instant to use for the app.
const app = express ();

/*
? Middleware:
*	is a function that runs before your route handler (or sometimes after),
*	to process a request or response.
*/

// Middleware to handle CORS.
app.use (cors());

// Middleware to automatically parse JSON bodies for all routes.
app.use (express.json ());

connectDB ();

/* 
* Routes
* define the API endpoints of the application.
* They map a URL and HTTP method (GET, POST, PUT, DELETE)
* to the appropriate controller function
* that handles the request and returns a response.
*/

// Routes: 
// app.use ("api/auth", authRoutes);
// app.use ("api/users", userRoutes);
// app.use ("api/projects", projectRoutes);
// app.use ("api/tasks", taskRoutes);
// app.use ("api/reports", reportRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen (PORT, () => console.log (`Server running on port ${PORT}`));
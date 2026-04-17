require ('dotenv').config (); // All Env Variables must be in .env file, for security reason.
const express = require ('express'); // Node.js Framework that makes building web servers and handling requests simple.
const cors = require ('cors'); // To solve CORS error.
const path = require ('path'); // A Node.js module with functions that simplify creating and handling file or folder paths.
const { connectDB } = require('./config/db');
const authRoutes = require ('./routes/authRoutes');
const userRoutes = require ('./routes/userRoutes');
const teamRoutes = require ('./routes/teamRoutes');
const projectRoutes = require ('./routes/projectsRoutes');
const dashboardRoutes = require ('./routes/dashboardRoutes');

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

//!		=== REQUEST DEBUG ===');
// app.use((req, res, next) => {
//     console.log('=== REQUEST DEBUG ===');
//     console.log('Method:', req.method);
//     console.log('Path:', req.path);
//     console.log('Headers:', req.headers);
//     console.log('Body:', req.body);
//     console.log('=====================');
//     next();
// });

connectDB ();

/* 
* Routes
* define the API endpoints of the application.
* They map a URL and HTTP method (GET, POST, PUT, DELETE)
* to the appropriate controller function
* that handles the request and returns a response.
*/

// Routes: 
app.use ("/api/auth", authRoutes);
app.use ("/api/users", userRoutes);
app.use ("/api/teams", teamRoutes);
app.use ("/api/projects", projectRoutes);
app.use ("/api/dashboard", dashboardRoutes);
// app.use ("/api/time-logs", timeLogRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen (PORT, () => console.log (`Server running on port ${PORT}`));
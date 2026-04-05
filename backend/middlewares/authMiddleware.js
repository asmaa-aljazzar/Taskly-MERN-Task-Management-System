const jwt = require("jsonwebtoken");
const User = require("../models/User");
const catchError = require('../utils/catchError')

//! Anything that touches something OUTSIDE your code needs await

//? Middleware functions:
//* are the building blocks that process requests
//* before they reach your final route handler.

// Middleware to protect routes
//? next:
// “I’m done, please move to the next function in this route’s chain.”
const protect = async (req, res, next) => {
	try {
		let token = req.headers.authorization;

		//This is a safety check to ensure the token exists and is properly formatted before you try to extract it.
		//? The Bearer prefix:
		//* is added by the frontend when sending the token to the backend.
		//* It's not automatically added by Express or any middleware.
		if (token && token.startsWith("Bearer")) {
			token = token.split(" ")[1]; // "0[Bearer] 1[token]"
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			// Add req.user to the request object
			// Remove Password from user object
			req.user = await User.findById(decoded.id).select("-password");
			if (!req.user)
				return res.status(401).json({ message: 'User not found' });
			next();
		}
		else {
			res.status(401).json({ message: "Unauthorized, not token" });
		}
	} catch (err) {
		res.status(401).json ({ message: "Token faild", err: err.message });
		// catchError(err, res);
	}
}


// Middleware for HR: HR Permissions
const hrOnly = async (req, res, next) => {
	try {
		if (req.user && req.user.role == "hr") {
			next();
		}
	} catch (err) {
		// res.status(403).json({ message: "Access denied, hr only", });
		catchError(err, res);
	}
}

// Middleware for Manager: Manager Permissions
const managerOnly = async (req, res, next) => {
	try {
		if (req.user && req.user.role == "hr") {
			next();
		}
	} catch (err) {
		// res.status(403).json({ message: "Access denied, manager only", });
		catchError (err, res);
	}
}

//?  Module is a file that exports code - it's about organizing your code.
module.exports = { protect, hrOnly, managerOnly };
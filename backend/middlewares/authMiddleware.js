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
		if (token && token.startsWith("Bearer ")) {
			token = token.slice(7).trim();
			if (!token) return res.status(401).json({ message: "Unauthorized, token missing" });
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			// Add req.user to the request object
			// Remove Password from user object
			req.user = await User.findById(decoded.id).select("-password");
			if (!req.user || req.user.isDeleted)
				return res.status(401).json({ message: 'User not found' });
			next();
		}
		else {
			res.status(401).json({ message: "Unauthorized, token missing" });
		}
	} catch (err) {
		res.status(401).json({ message: "Invalid or expired token" });
		// catchError(err, res);
	}
}


// Middleware for HR: HR Permissions
const hrOnly = async (req, res, next) => {
	try {
		if (req.user && req.user.role === "hr") {
			next();
		} else {
			return res.status(403).json({ message: "Access denied. HR only." });
		}
	} catch (err) {
		// res.status(403).json({ message: "Access denied, hr only", });
		catchError(err, res);
	}
}

// Middleware for Manager: Manager Permissions
const managerOnly = async (req, res, next) => {
	try {
		if (req.user && req.user.role === "manager") {
			next();
		} else {
			return res.status(403).json({ message: "Access denied. Manager only." });
		}
	} catch (err) {
		// res.status(403).json({ message: "Access denied, manager only", });
		catchError(err, res);
	}
}

const hrOrManager = async (req, res, next) => {
	try {
		if (req.user && (req.user.role === "hr" || req.user.role === "manager")) {
			next();
		} else {
			return res.status(403).json({ message: "Access denied. HR or Manager only." });
		}
	} catch (err) {
		catchError(err, res);
	}
}

// Middleware for Employee
const employeeOnly = async (req, res, next) => {
	try {
		if (req.user && req.user.role === "employee") {
			next();
		} else {
			return res.status(403).json({ message: "Access denied. Employee only." });
		}
	} catch (err) {
		// res.status(403).json({ message: "Access denied, manager only", });
		catchError(err, res);
	}
}

const managerOrEmployee = async (req, res, next) => {
	try {
		if (req.user && (req.user.role === "manager" || req.user.role === "employee")) {
			next();
		} else {
			return res.status(403).json({ message: "Access denied. Manager or Employee only." });
		}
	} catch (err) {
		catchError(err, res);
	}
}
//?  Module is a file that exports code - it's about organizing your code.
module.exports = { protect, hrOnly, managerOnly, employeeOnly, hrOrManager, managerOrEmployee };

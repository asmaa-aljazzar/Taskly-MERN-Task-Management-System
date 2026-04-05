const User = require('../models/User');
const bcrypt = require('bcryptjs');
const catchError = require('../utils/catchError')
const {
	validateEmail,
	validatePassword,
	sanitizeEmail,
	sanitizeText,
	sanitizePhone
} = require('../utils/validation');

// 1. Create new user (HR only)
// @desc	create a new user (HR only)
// @route	POST /api/users
// @access	Private/ HR
// @Headers: 
// Authorization: Bearer HR_TOKEN_HERE
// Content-Type: application/json
const createUser = async (req, res) => {
	try {
		// 1. Extract data from req.body
		const userBody = req.body;

		if (userBody.fullName && userBody.email && userBody.password && userBody.hireDate) {
			//? Destructuring = extracting values into variables with the same name
			let {
				fullName,
				email,
				password,
				phoneNumber,
				profileImageUrl,
				role,
				hireDate } = userBody;

			// Sanitize inputs
			email = sanitizeEmail(email);
			fullName = sanitizeText(fullName);
			phoneNumber = sanitizePhone(phoneNumber);

			// Validate
			if (!validateEmail(email)) {
				return res.status(400).json({
					message: "Invalid email format"
				});
			}

			if (!validatePassword(password)) {
				return res.status(400).json({
					message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
				});
			}
			//! Check if user already exist:
			//* Avoid unnecessary hash.
			//* Avoid race conditions.
			//* Cleaner error message.
			const userExist = await User.findOne({ email });
			if (userExist)
				return res.status(409).json({ message: "Email is already in use" });

			// Hash password
			//? bcrypt.genSalt:
			//* adds random data to the password before hashing, making it harder to crack with precomputed attacks.
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			// Create user in database
			// Set the same data to a new user;
			const user = await User.create({
				fullName,
				email,
				password: hashedPassword,
				phoneNumber,
				profileImageUrl,
				role,
				hireDate
			});

			// Send back success response.
			//? With user data
			//* Saves frontend from making an extra API call to fetch the new user.
			//* Frontend immediately has user ID, role, and other info to update UI.
			return res.status(201).json({
				message: "User Created Successfully!",
				user: {
					_id: user._id,
					fullName: user.fullName,
					email: user.email,
					phoneNumber: user.phoneNumber,
					profileImageUrl: user.profileImageUrl,
					role: user.role,
					hireDate: user.hireDate,
				}
			});
		}
		else {
			//! Always return when error.
			return res.status(400).json({ message: "Error: Missing information please provide all fields" });
		};

	} catch (err) {
		// res.status(500).json({ message: "Server error", error: err.message });
		catchError(err, res);
	};
}

// 2. Get all users (HR/Admin only)
const getAllUsers = async (req, res) => { 
	try {
		
	} catch {
		catchError (err, res);
	}
}

// 3. Get single user by ID (HR/Admin only)
const getUserById = async (req, res) => { }

// 4. Update user (HR/Admin only)
const updateUser = async (req, res) => { }

// 5. Delete user (HR/Admin only)
const deleteUser = async (req, res) => { }

module.exports = { createUser };
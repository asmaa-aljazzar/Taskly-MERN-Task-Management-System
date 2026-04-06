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
// @desc	Get all users
// @route	GET /api/users
// @access	Private/ HR
// @Headers: 
// Authorization: Bearer HR_TOKEN_HERE
// Content-Type: application/json
//Todo: Apply pagination:
//? 	Pagination is the technique of splitting a large set of data into smaller, manageable chunks (pages) rather than sending everything at once.
const getAllUsers = async (req, res) => {
	try {
		// get users from database.
		const users = await User.find();

		// ? How .filter() works:
		//* It loops through each item in the array
		//* Returns true to keep the item, false to remove it
		//* Creates a NEW array with only kept items

		const otherUsers = users.filter(user =>
			//! Without toString() - problem!
			// MongoDB ObjectId comparison fails even with same value
			user._id.toString() !== req.user._id.toString()
			// req.user = WHO is making the request (from token, NOT from body!)
		);

		if (otherUsers.length == 0)
			return res.status(200).json({ 
                message: "No other users found besides you",
                users: []
            }); 


		// return users.
		return res.status(200).json({
			message: "Users retrieved successfully",
			users
		});
	} catch (err) {
		catchError(err, res);
	}
};

// 3. Get single user by ID (HR/Admin only)
const getUserById = async (req, res) => { }

// 4. Update user (HR/Admin only)
const updateUser = async (req, res) => { }

// 5. Delete user (HR/Admin only)
const deleteUser = async (req, res) => { }

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser };
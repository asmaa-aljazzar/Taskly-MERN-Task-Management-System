const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
	return jwt.sign(
		{
			id: userId,
		},
		process.env.JWT_SECRET,
		{
			expireIn: "7d",
		})
};

const logInUser = async (req, res) => {
	try {
		// 1. Get email & password from body

	} catch {

	}

	// 2. Check if both exist (if not → 400)

	// 3. Find user by email (if not found → 401)

	// 4. Compare password with bcrypt (if wrong → 401)

	// 5. Generate JWT token (include user id)

	// 6. Send response: token + user (id, fullName, email, role)

	// 7. Catch errors → 500
};

// @desc	Get user profile
// @route	GET /api/auth/profile
// @access	Private (Requires JWT)
const getUserProfile = async (req, res) => {
	try {

	} catch {

	}
	// 1. Get user id from req.user (set by protect middleware)

	// 2. Find user by id using User.findById()
	//    - Exclude password field using .select('-password')

	// 3. If user not found → 404

	// 4. Send user data (fullName, email, role, phoneNumber, profileImageUrl, hireDate)

	// 5. Catch errors → 500
};

// @desc	Update user profile
// @route	PUT /api/auth/profile
// @access	Private (Requires JWT)
const updateUserProfile = async (req, res) => {
	try {

	} catch {

	}
	// 1. Get user id from req.user

	// 2. Find user by id

	// 3. If user not found → 404

	// 4. Update fields if provided:
	//    - fullName
	//    - phoneNumber
	//    - profileImageUrl

	// 5. If password provided:
	//    - Hash new password with bcrypt
	//    - Update password field

	// 6. Save updated user

	// 7. Send response with updated user (exclude password)

	// 8. Catch errors → 500
};

module.exports = { logInUser, getUserProfile, updateUserProfile };
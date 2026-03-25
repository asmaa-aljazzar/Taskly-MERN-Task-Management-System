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

// @desc	Login user
// @route	POST /api/auth/login
// @access	Public
const logInUser = async (req, res) => {};

// @desc	Get user profile
// @route	GET /api/auth/profile
// @access	Private (Requires JWT)
const getUserProfile = async (req, res) => {};

// @desc	Update user profile
// @route	PUT /api/auth/profile
// @access	Private (Requires JWT)
const updateUserProfile = async (req, res) => {};

module.exports = { logInUser, getUserProfile, updateUserProfile };
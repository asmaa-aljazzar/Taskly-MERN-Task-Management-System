const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const catchError = require('../utils/catchError');
const crypto = require('crypto');
const {
	validatePassword,
	sanitizeEmail,
	sanitizeText,
	sanitizePhone,
	sanitizeUrl,
} = require('../utils/validation');

// Generate JWT Token
const generateToken = (userId) => {
	return jwt.sign(
		{
			id: userId,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: "7d",
		})
};

// @desc	Login User
// @route	POST /api/auth/login
// @access	Public
// @Headers: 
// Content-Type: application/json
const logInUser = async (req, res) => {
	try {
		// Get email & password from body
		let { email, password } = req.body;

		// Check if both exist (if not → 400)
		if (!email || !password)
			return res.status(400).json({ message: "Please provide both email and password" })
		email = sanitizeEmail(email);

		// Find user by email (if not found → 401)
		const user = await User.findOne({ email, isDeleted: false }).select('+password');
		if (!user) {
			return res.status(401).json({
				message: "Account not found",
				suggestion: "Please check your email or contact HR to request access"
			});
		}

		// Compare password with bcrypt (if wrong → 401)
		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			return res.status(401).json({
				message: "Invalid password",
				action: "Please try again or contact HR to reset your password"
			});
		}

		// Generate JWT token (include user id)
		const token = generateToken(user._id);

		// Send response: token + user (id, fullName, email, role, ...)
		return res.status(200).json({
			message: "Login Successfull",
			token,
			user: {
				_id: user._id,
				fullName: user.fullName,
				email: user.email,
				phoneNumber: user.phoneNumber,
				profileImageUrl: user.profileImageUrl,
				role: user.role,
				hireDate: user.hireDate,
			},
		})

	} catch (err) {
		// res.status(500).json({ message: "Server error", error: err.message });
		catchError(err, res);
	}
};

// @desc	Get user profile
// @route	GET /api/auth/profile
// @access	Private (Requires JWT)
// @Headers: 
// Authorization: Bearer YOUR_TOKEN_HERE
// Content-Type: application/json
const getUserProfile = async (req, res) => {
	try {
		// Get user id from req.user (set by protect middleware)
		const id = req.user._id;

		// Find user by id using User.findById()
		//    - Exclude password field using .select('-password')
		const user = await User.findById(id).select('-password');

		// If user not found → 404
		if (!user || user.isDeleted)
			return res.status(404).json({ message: "User Not Found!" });

		// Send user data (fullName, email, role, phoneNumber, profileImageUrl, hireDate)
		return res.status(200).json({
			message: "User Found",
			user: {
				_id: user._id,
				fullName: user.fullName,
				email: user.email,
				role: user.role,
				phoneNumber: user.phoneNumber,
				profileImageUrl: user.profileImageUrl,
				hireDate: user.hireDate,
				isDeleted: user.isDeleted
			},
		});

	} catch (err) {
		// res.status(500).json({ message: "Server error", error: err.message });
		catchError(err, res);
	}
};

// @desc	Update user profile
// @route	PUT /api/auth/profile
// @access	Private (Requires JWT)
// @Headers: 
// Authorization: Bearer YOUR_TOKEN_HERE
// Content-Type: application/json
const updateUserProfile = async (req, res) => {
	try {
		//. Get user id from req.user
		const _id = req.user._id;

		// New Data are in req.body not in req.user
		let { password, profileImageUrl } = req.body;

		// Sanitize Input
		// if (fullName) fullName = sanitizeText(fullName);
		// if (phoneNumber) phoneNumber = sanitizePhone(phoneNumber);
		if (profileImageUrl) profileImageUrl = sanitizeUrl(profileImageUrl);

		const newData = {}; // Empty obj to fill.

		// Find user by id
		const user = await User.findById(_id);

		// If user not found → 404
		if (!user || user.isDeleted)
			return res.status(404).json({ message: "User Not Found" })

		// Update fields if provided:
		// if (fullName) newData.fullName = fullName;
		// if (phoneNumber) newData.phoneNumber = phoneNumber;
		// if (profileImageUrl) newData.profileImageUrl = profileImageUrl;

		if (password) {
			// Regex (Regular Expression) is a pattern used to match, search, or validate text.
			if (!validatePassword(password)) {
				return res.status(400).json({
					message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
				});
			}

			// If password provided:
			//    - Hash new password with bcrypt
			//    - Update password field
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			newData.password = hashedPassword;
		}


		// Only process if there is data to update in newData.
		if (Object.keys(newData).length == 0)
			return res.status(400).json({ message: 'No fields to update' });

		newData.updatedAt = new Date();

		await User.updateOne(
			{ _id: _id },
			{ $set: newData } // This will update values like all data in newData. 
		);


		const updatedUser = await User.findById(_id).select('-password');

		// Save updated user
		// Send response with updated user (exclude password)
		return res.status(200).json({
			message: "User Data updated successfully",
			user: updatedUser,
		});
	}
	catch (err) {
		// res.status(500).json({ message: "Server error", error: err.message });
		catchError(err, res);

	}
};

// In your authController.js, add these:

const uploadProfileImage = async (req, res) => {
	try {
		// Handle image upload
		if (!req.file) return res.status(400).json({
			success: false,
			message: "No file uploaded",
		});
		// Check isDeleted
		const user = await User.findById(req.user.id);
		// const user = await User.findOne({ _id: req.user.id });

		if (!user || user.isDeleted) return res.status(400).json({
			success: false,
			message: "User not found",
		})

		const imageUrl = `/uploads/${req.file.filename}`;
		user.profileImageUrl = imageUrl;
		await user.save();
		res.status(200).json({ imageUrl });
	} catch (err) {
		catchError(err, res);
	}
};

const deleteProfileImage = async (req, res) => {
	try {
		// 1. Check if user exists and not deleted
		const user = await User.findById(req.user.id);
		if (!user || user.isDeleted) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// 2. Just set the default image path
		user.profileImageUrl = "/uploads/default-avatar.jpg";
		await user.save();

		// 3. Return success response
		return res.status(200).json({
			success: true,
			message: "Profile image reset to default",
			profileImageUrl: "/uploads/default-avatar.jpg",
			user: {
				_id: user._id,
				fullName: user.fullName,
				profileImageUrl: user.profileImageUrl
			}
		});

	} catch (err) {
		catchError(err, res);
	}
}

// @desc	Forgot password
// @route	POST /api/auth/forgot-password
// @access	Public
// @Headers: 
// Content-Type: application/json
// @purpose: Allow a user who forgot their password 
// 			 to request a way to reset it, WITHOUT needing to log in.
const forgotPassword = async (req, res) => {
	try {
		// Get the user email.
		const { email } = req.body;

		if (!email)
			return res.status(400).json({ message: "Email is required" });

		// look for the email secretly
		const user = await User.findOne({ email, isDeleted: false });

		// Success message if fail [Security]
		if (!user)
			return res.status(200).json({ message: "If an account exists, you will receive a reset email" });

		// Generate reset token.
		const resetToken = crypto.randomBytes(32).toString('hex');

		// Hash token.
		const hashToken = crypto
			.createHash('sha256')
			.update(resetToken)
			.digest('hex');

		// Save hashed Token to database.
		user.resetPasswordToken = hashToken;
		user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
		await user.save();

		// Build a URL that includes the token
		const resetUrl = `http://localhost:8000/api/auth/reset-password/${resetToken}`;

		// Log the URL to console
		console.log("\n" + "=".repeat(60));
		console.log("\n" + "=".repeat(60));
		console.log("🔐 PASSWORD RESET LINK (copy this into your browser):");
		console.log(resetUrl);
		console.log("⏰ This link expires in 10 minutes");
		console.log("=".repeat(60) + "\n");

		return res.status(200).json({ message: "If an account exists, you will receive a reset email" });
		// 6. Return a Generic Success Message
		// Always say something like: "If an account exists, you'll receive a reset email"
		// Don't confirm whether the email exists or not
		// This prevents hackers from finding which emails are registered
	} catch (err) {
		catchError(err, res);
	}
}     // Request reset

//? Reset URL:
/*
?	Full URL = Base URL + Path + Token

*	Development (your computer)
	http://localhost:3000/reset-password/abc123...
*	Production (live website)
	https://myapp.com/reset-password/abc123...
* 	Mobile app (deep link)
	myapp://reset-password/abc123...
*/

//? Reset Password Flow
/*

	User clicks link in email
			↓
	Opens browser to your reset page
		↓
	Your frontend reads the token from URL
		↓
	Shows a form: "Enter new password"
			↓
	User submits password + token to your API
			↓
	API verifies token and updates password
*/

//? Email Example
/*
	Subject: Reset Your Password

	Hello John,

	You requested to reset your password for TaskMaster.

	Click the link below to create a new password:

	https://yourapp.com/reset-password/8f3a2b1c9d4e5f6a7b8c9d0e

	This link will expire in 10 minutes.

	If you didn't request this, please ignore this email.

	Thanks,
	TaskMaster Team
*/

// @desc	Reset password
// @route	POST /api/auth/reset-password/:token  // ← Token in URL!
// @access	Public  // ← NOT Private!
// @Headers: 
// Content-Type: application/json
// NO Bearer token needed!
const resetPassword = async (req, res) => {
	try {
		// Get the raw token from the URl.
		const rawToken = req.params.token;
		// Hash Token		
		const hashToken = crypto
			.createHash('sha256')
			.update(rawToken)
			.digest('hex');

		// Find the user by the token
		const user = await User.findOne({
			isDeleted: false,
			resetPasswordToken: hashToken,
			resetPasswordExpires: { $gt: Date.now() }
		});

		if (!user)
			return res.status(400).json({
				message: "User Not Found or Token Expire"
			});

		// Get the new Password
		const { password } = req.body;
		if (!password) {
			return res.status(400).json({
				message: "Please provide a new password"
			});
		};

		if (password) {
			const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;
			if (!passwordRegex.test(password)) {
				return res.status(400).json({
					message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
				});
			}

			// Hash Password
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			// Reset and save the hash Password
			user.password = hashedPassword;
			user.resetPasswordToken = "";
			user.resetPasswordExpires = null;
			await user.save();
		}
		//Set resetPasswordToken, resetPasswordExpires to null/"" after set the password 
		return res.status(200).json({
			message: 'Password updated successfully!',
		});
	} catch (err) {
		catchError(err, res);
	}
}       // Reset with token-> One-time use 

module.exports = { logInUser, getUserProfile, updateUserProfile, uploadProfileImage, deleteProfileImage, forgotPassword, resetPassword };
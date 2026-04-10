const express = require('express');
const {
	logInUser,
	getUserProfile,
	updateUserProfile,
	forgotPassword,
	resetPassword,
	uploadProfileImage,
	deleteProfileImage } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require ('../middlewares/uploadMiddleware');
const router = express.Router();

// Auth Routes
router.post('/login', logInUser); // Login User
router.get('/profile', protect, getUserProfile); // Get User Profiles
router.put('/profile', protect, updateUserProfile); // Update User Profile
router.put('/profile/image', protect, upload.single ('image'), uploadProfileImage)
router.delete('/profile/image', protect, deleteProfileImage)
router.post('/forgot-password', forgotPassword); // Forgot Password
router.put('/reset-password/:token', resetPassword); // Reset Password

//!-----------------------------[ Start Explanation ]-------------------
/* 
 ? protect: 
 a middleware function
 to verifies the user is authenticated.
 In most apps, it checks for a valid JSON Web Token (JWT)
 in the request headers (Authorization: Bearer <token>).
 If the token is valid,
 it attaches the user object to req.user and calls next().
 If not, it returns a 401 Unauthorized response.
*/

//? POST /upload-image:
//*	Endpoint URL
//? upload.single("image"):	
//* Middleware that processes file upload
//? "image"
//* The field name in the form data

/*
? upload.single("image"):
* This is from Multer (a file upload package). It:
* Takes the uploaded file
* Saves it to a folder (usually uploads/)
* Adds file info to req.file
*/

/*
? const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
* req.protocol:	http or https	The protocol used
* req.get('host'):	localhost:8000	Your server address
* /uploads/	/uploads/:	Folder where images are stored
* req.file.filename	abc123.jpg:	Random name given to uploaded file
*/
//!-----------------------------[ End Explanation ]-------------------

// Group of related routes 
module.exports = router;

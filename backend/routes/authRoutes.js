const express = require ('express');
const { logInUser, getUserProfile, updateUserProfile } = require('../controllers/authController');

const router = express.Router ();

// Auth Routes
router.post ('/login', logInUser); // Login User
router.get ('/profile', protect, getUserProfile); // Get User Profiles
router.put ('/profile', protect, updateUserProfile); // Update User Profile

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
// Group of related routes 
module.exports = router;

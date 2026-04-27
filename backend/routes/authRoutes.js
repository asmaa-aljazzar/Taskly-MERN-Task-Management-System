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
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.post('/login', logInUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/profile/image', protect, upload.single('profileImage'), uploadProfileImage); // ← fixed field name
router.delete('/profile/image', protect, deleteProfileImage);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
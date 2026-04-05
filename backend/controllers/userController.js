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

module.exports = { createUser };
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc	create a new user (HR only)
// @route	POST /api/users
// @access	Private/ HR
const createUser = async (req, res) => {
  // 1. Extract data from req.body
  // 2. Hash password
  // 3. Create user in database
  // 4. Send back success response (no token)
}

module.exports = {createUser};
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc	create a new user (HR only)
// @route	POST /api/users
// @access	Private/ HR
const createUser = async (req, res) => {
	try {
		// 1. Extract data from req.body
		const userBody = req.body;

		if (userBody.fullName && userBody.email && userBody.password && userBody.hireDate) {
			const {
				fullName,
				email,
				password,
				phoneNumber,
				profileImageUrl,
				role,
				hireDate } = userBody;

			// 2. Hash password
			//? bcrypt.genSalt:
			//* adds random data to the password before hashing, making it harder to crack with precomputed attacks.
			const salt = await bcrypt.genSalt (10);
			const hashedPassword = await bcrypt.hash (userBody.password, salt);

			// 3. Create user in database
			// Set the same data to a new user;
			const user = new User({
				fullName,
				email,
				password: hashedPassword,
				phoneNumber,
				profileImageUrl,
				role,
				hireDate
			});
			
			//! when fails, save throws an error, which gets caught by your catch block.
			user.save (); 
				
			// 4. Send back success response.
			return res.status (200).json ("User Created Successfully!")
		}
		else {
			//! Always return when error.
			return res.status(400).json({ message: "Error: Missing information please provide all fields" });
		}


	} catch (err) {
		res.status(500).json({ message: err.message });
	}
}

module.exports = { createUser };
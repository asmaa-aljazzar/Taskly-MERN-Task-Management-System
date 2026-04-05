const catchError = (err, res) => {
	// In development
	if (process.env.NODE_ENV === 'development') {
		res.status(500).json({
			message: "Server error",
			error: err.message,
			stack: err.stack,
			name: err.name
		});
	} else {
		// In production
		res.status(500).json({
			message: "Something went wrong"
		});
	}
}

module.exports = catchError;
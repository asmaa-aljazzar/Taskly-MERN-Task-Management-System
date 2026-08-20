const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '..', 'uploads'));
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname).toLowerCase();
		cb(null, `${Date.now()}-${req.user?.id ?? 'user'}${ext}`);
	},
});

const fileFilter = (req, file, cb) => {
	const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Only .jpeg, .jpg, .png, and .webp formats are allowed'));
	}
};

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = upload;

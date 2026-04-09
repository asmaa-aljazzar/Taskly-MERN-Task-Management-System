const multer = require ('multer');

// Configure Storage
const storage = multer.diskStorage ({
	destination: (req, file, cb) => {
		cb (null, 'uploads/');
	},
	filename: (req, file, cb) => {
		cb (null, `${Date.now()}-${file.originalname}`);
	}
});

//! ❌ Leading slash = from root of hard drive
// '/uploads'     → C:/uploads or /uploads
//* ✅ No leading slash = from your project folder
// 'uploads'      → your-project/uploads/
// './uploads'    → your-project/uploads/

// File filter
const fileFilter = (req, file, cb) => {
	const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
	if (allowedTypes.includes (file.mimetype)) {
		cb (null, true);
	}
	else {
		cb (new Error ('Only .jpeg , .jpg , and .png formats are allowed'));
	}
}

//! ===============================[ Start Explain ]===================================================================================================================================

//? Multer:
// is a Node.js middleware that handles multipart/form-data (file uploads). Regular JSON body parser cannot read files, only text.

// Without Multer - req.body is empty for file uploads!
//* app.post('/upload', (req, res) => {
//*     console.log(req.body); // {} Empty! Can't read files!
//* });

// With Multer - works perfectly!
//* app.post('/upload', upload.single('image'), (req, res) => {
//*     console.log(req.file); // File information!
//* });

//? multer.deskStorage ==>
	// When a user uploads a file, Multer needs to know:
//* Where to save it (which folder)
//* What to name it
// diskStorage lets you configure both!
//! ===============================[ End Explain ]===================================================================================================================================

const upload = multer ({storage, fileFilter});
// Use its methods for different upload scenarios
// upload.single('image')     // Single file
// upload.array('images', 5)  // Multiple files
// upload.fields([...])       // Different fields
// upload.none()              // No files, just text

module.exports = upload;
const { createUser } = require("../controllers/userController");
const { protect, hrOnly } = require("../middlewares/authMiddleware");
const express = require ('express');
const router = express.Router ();

router.post ("/", protect, hrOnly, createUser);
// router.post ("/", createUser);

module.exports = router;
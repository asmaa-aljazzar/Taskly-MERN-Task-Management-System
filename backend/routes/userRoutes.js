const { createUser, getAllUsers, getUserById, deleteUser, updateUser } = require("../controllers/userController");
const { protect, hrOnly } = require("../middlewares/authMiddleware");
const express = require ('express');
const router = express.Router ();

router.post ("/", protect, hrOnly, createUser);
router.get ("/", protect, hrOnly, getAllUsers);
router.get ("/:id", protect, hrOnly, getUserById);
router.put ("/:id", protect, hrOnly, updateUser);
router.delete ("/:id", protect, hrOnly, deleteUser);
// router.post ("/", createUser);

module.exports = router;
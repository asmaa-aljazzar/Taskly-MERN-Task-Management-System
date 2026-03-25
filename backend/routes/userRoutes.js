const { createUser } = require("../controllers/userController");

const express = require (express);

const router = express.Router ();

router.POST ("/users", Protect, authorizedRules ('hr'),createUser);
module.exports = router;
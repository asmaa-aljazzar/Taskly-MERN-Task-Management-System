const express = require ('express');
const router = express.Router();
const {
	protect,
	hrOnly,
	managerOnly,
	employeeOnly
} = require ('../middlewares/authMiddleware');
const {
	getEmployeeDashboard,
	getManagerDashboard,
	getHrDashboard,
} = require ('../controllers/dashboardController')

router.get ('/employee',protect, employeeOnly, getEmployeeDashboard);
router.get ('/manager',protect, managerOnly, getManagerDashboard);
router.get ('/hr',protect, hrOnly, getHrDashboard);

module.exports = router; 
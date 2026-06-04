const express = require('express');
const auth = require('../middleware/auth');
const { permit } = require('../middleware/roles');
const adminController = require('../controllers/adminController');

const router = express.Router();
router.use(auth);
router.use(permit('admin'));

router.get('/users', adminController.listUsers);
router.patch('/users/:userId/block', adminController.toggleBlockUser);
router.get('/reports/appointments', adminController.reportAppointments);
router.get('/reports/active-patients', adminController.reportActivePatients);
router.get('/audit-logs', adminController.auditLogs);

module.exports = router;

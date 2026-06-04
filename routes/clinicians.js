const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { permit } = require('../middleware/roles');
const validate = require('../middleware/validate');
const clinicianController = require('../controllers/clinicianController');

const router = express.Router();
router.use(auth);

router.get('/', clinicianController.listClinicians);
router.post(
  '/:clinicianId/assign',
  permit('admin'),
  [body('patientId').notEmpty()],
  validate,
  clinicianController.assignPatient
);
router.post(
  '/:clinicianId/unassign',
  permit('admin'),
  [body('patientId').notEmpty()],
  validate,
  clinicianController.unassignPatient
);
router.get('/:clinicianId/schedule', clinicianController.dailySchedule);

module.exports = router;

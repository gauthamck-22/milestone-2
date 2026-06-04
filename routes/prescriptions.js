const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { permit } = require('../middleware/roles');
const validate = require('../middleware/validate');
const prescriptionController = require('../controllers/prescriptionController');

const router = express.Router();
router.use(auth);

router.post(
  '/',
  permit('clinician', 'admin'),
  [body('patient').notEmpty(), body('medications').isArray({ min: 1 })],
  validate,
  prescriptionController.createPrescription
);

router.get('/patient/:patientId', prescriptionController.getPatientPrescriptions);
router.patch('/:id/fulfill', prescriptionController.markFulfilled);

module.exports = router;

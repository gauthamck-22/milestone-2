const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { permit } = require('../middleware/roles');
const validate = require('../middleware/validate');
const emrController = require('../controllers/emrController');

const router = express.Router();
router.use(auth);

router.post(
  '/',
  permit('clinician', 'admin'),
  [body('patient').notEmpty(), body('visitNotes').notEmpty()],
  validate,
  emrController.createRecord
);

router.put('/:id', permit('clinician', 'admin'), emrController.updateRecord);
router.get('/patient/:patientId', emrController.getPatientRecords);
router.get('/:id', emrController.getRecordById);

module.exports = router;

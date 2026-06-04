const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();
router.use(auth);

router.post(
  '/',
  [body('clinician').notEmpty(), body('start').notEmpty(), body('end').notEmpty()],
  validate,
  appointmentController.bookAppointment
);

router.put('/:id', appointmentController.updateAppointment);
router.patch('/:id/cancel', appointmentController.cancelAppointment);
router.get('/', appointmentController.listAppointments);

module.exports = router;

const Prescription = require('../models/Prescription');
const User = require('../models/User');

const canViewPatient = async (user, patientId) => {
  if (user.role === 'admin') return true;
  if (user.role === 'patient' && user._id.equals(patientId)) return true;
  if (user.role === 'clinician') {
    const clinician = await User.findOne({ _id: user._id, assignedPatients: patientId });
    return Boolean(clinician);
  }
  return false;
};

exports.createPrescription = async (req, res, next) => {
  try {
    const { patient, medications, notes } = req.body;
    if (!patient || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({ message: 'Patient and medication list are required' });
    }
    const prescription = await Prescription.create({
      patient,
      clinician: req.user._id,
      medications,
      notes,
    });
    res.status(201).json(prescription);
  } catch (error) {
    next(error);
  }
};

exports.getPatientPrescriptions = async (req, res, next) => {
  try {
    const patientId = req.params.patientId;
    if (!await canViewPatient(req.user, patientId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const prescriptions = await Prescription.find({ patient: patientId }).populate('clinician', 'name email profile.specialty');
    res.json(prescriptions);
  } catch (error) {
    next(error);
  }
};

exports.markFulfilled = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    if (!await canViewPatient(req.user, prescription.patient)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    prescription.fulfilled = true;
    prescription.fulfilledAt = new Date();
    await prescription.save();
    res.json(prescription);
  } catch (error) {
    next(error);
  }
};

const User = require('../models/User');
const Appointment = require('../models/Appointment');

exports.listClinicians = async (req, res, next) => {
  try {
    const clinicians = await User.find({ role: 'clinician' }).select('-password');
    res.json(clinicians);
  } catch (error) {
    next(error);
  }
};

exports.assignPatient = async (req, res, next) => {
  try {
    const clinician = await User.findById(req.params.clinicianId);
    if (!clinician || clinician.role !== 'clinician') {
      return res.status(404).json({ message: 'Clinician not found' });
    }
    const patient = await User.findById(req.body.patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    if (!clinician.assignedPatients.includes(patient._id)) {
      clinician.assignedPatients.push(patient._id);
      await clinician.save();
    }
    patient.assignedClinician = clinician._id;
    await patient.save();
    res.json({ clinician, patient });
  } catch (error) {
    next(error);
  }
};

exports.unassignPatient = async (req, res, next) => {
  try {
    const clinician = await User.findById(req.params.clinicianId);
    const patient = await User.findById(req.body.patientId);
    if (!clinician || !patient) {
      return res.status(404).json({ message: 'Clinician or patient not found' });
    }
    clinician.assignedPatients = clinician.assignedPatients.filter((id) => !id.equals(patient._id));
    await clinician.save();
    if (patient.assignedClinician && patient.assignedClinician.equals(clinician._id)) {
      patient.assignedClinician = null;
      await patient.save();
    }
    res.json({ clinician, patient });
  } catch (error) {
    next(error);
  }
};

exports.dailySchedule = async (req, res, next) => {
  try {
    const clinicianId = req.params.clinicianId;
    const date = new Date(req.query.date || new Date());
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));
    const appointments = await Appointment.find({
      clinician: clinicianId,
      start: { $gte: start, $lte: end },
    }).populate('patient', 'name email');
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

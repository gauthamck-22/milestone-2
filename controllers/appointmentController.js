const Appointment = require('../models/Appointment');
const User = require('../models/User');

const hasConflict = async (clinicianId, start, end, appointmentId) => {
  const query = {
    clinician: clinicianId,
    status: 'scheduled',
    $or: [
      { start: { $lt: end, $gte: start } },
      { end: { $gt: start, $lte: end } },
      { start: { $lte: start }, end: { $gte: end } },
    ],
  };
  if (appointmentId) query._id = { $ne: appointmentId };
  const existing = await Appointment.findOne(query);
  return Boolean(existing);
};

exports.bookAppointment = async (req, res, next) => {
  try {
    const { clinician, start, end, notes } = req.body;
    const patient = req.user.role === 'patient' ? req.user._id : req.body.patient;

    if (!patient) {
      return res.status(400).json({ message: 'Patient is required' });
    }

    const clinicianUser = await User.findById(clinician);
    if (!clinicianUser || clinicianUser.role !== 'clinician') {
      return res.status(400).json({ message: 'Invalid clinician' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate >= endDate) {
      return res.status(400).json({ message: 'Invalid appointment interval' });
    }

    if (await hasConflict(clinician, startDate, endDate)) {
      return res.status(409).json({ message: 'Appointment conflict detected' });
    }

    const appointment = await Appointment.create({
      patient,
      clinician,
      start: startDate,
      end: endDate,
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (!appointment.patient.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot modify this appointment' });
    }

    const { start, end, notes, status } = req.body;
    const updates = {};
    if (start) updates.start = new Date(start);
    if (end) updates.end = new Date(end);
    if (notes !== undefined) updates.notes = notes;
    if (status) updates.status = status;

    if (updates.start || updates.end) {
      const newStart = updates.start || appointment.start;
      const newEnd = updates.end || appointment.end;
      if (newStart >= newEnd) {
        return res.status(400).json({ message: 'Invalid appointment interval' });
      }
      if (await hasConflict(appointment.clinician, newStart, newEnd, appointment._id)) {
        return res.status(409).json({ message: 'Appointment conflict detected' });
      }
    }

    const updated = await Appointment.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (!appointment.patient.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot cancel this appointment' });
    }
    appointment.status = 'cancelled';
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

exports.listAppointments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'patient') {
      filter.patient = req.user._id;
    } else if (req.user.role === 'clinician') {
      filter.clinician = req.user._id;
    }
    const appointments = await Appointment.find(filter).populate('patient clinician', 'name email profile.specialty');
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

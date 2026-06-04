const EMR = require('../models/EMR');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const canAccessRecord = async (user, patientId) => {
  if (user.role === 'admin') return true;
  if (user.role === 'patient' && user._id.equals(patientId)) return true;
  if (user.role === 'clinician') {
    const assigned = await User.findOne({ _id: user._id, assignedPatients: patientId });
    return Boolean(assigned);
  }
  return false;
};

exports.createRecord = async (req, res, next) => {
  try {
    const { patient, visitNotes, diagnosis, medications, labResults } = req.body;
    if (!await canAccessRecord(req.user, patient)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const record = await EMR.create({
      patient,
      clinician: req.user._id,
      visitNotes,
      diagnosis,
      medications,
      labResults,
    });
    await AuditLog.create({
      user: req.user._id,
      action: 'create_emr',
      resource: 'EMR',
      resourceId: record._id,
      details: `Created EMR for patient ${patient}`,
    });
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

exports.updateRecord = async (req, res, next) => {
  try {
    const record = await EMR.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    if (!await canAccessRecord(req.user, record.patient)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const updates = { ...req.body, updatedAt: new Date() };
    const updated = await EMR.findByIdAndUpdate(req.params.id, updates, { new: true });
    await AuditLog.create({
      user: req.user._id,
      action: 'update_emr',
      resource: 'EMR',
      resourceId: record._id,
      details: `Updated EMR ${record._id}`,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.getPatientRecords = async (req, res, next) => {
  try {
    const patientId = req.params.patientId;
    if (!await canAccessRecord(req.user, patientId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const records = await EMR.find({ patient: patientId }).populate('clinician', 'name email profile.specialty');
    res.json(records);
  } catch (error) {
    next(error);
  }
};

exports.getRecordById = async (req, res, next) => {
  try {
    const record = await EMR.findById(req.params.id).populate('patient clinician', 'name email');
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    if (!await canAccessRecord(req.user, record.patient._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(record);
  } catch (error) {
    next(error);
  }
};

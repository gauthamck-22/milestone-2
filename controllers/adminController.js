const User = require('../models/User');
const Appointment = require('../models/Appointment');
const AuditLog = require('../models/AuditLog');

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.blocked = !user.blocked;
    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.reportAppointments = async (req, res, next) => {
  try {
    const start = new Date(req.query.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const end = new Date(req.query.end || new Date());
    const pipeline = [
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ];
    const summary = await Appointment.aggregate(pipeline);
    res.json({ start, end, summary });
  } catch (error) {
    next(error);
  }
};

exports.reportActivePatients = async (req, res, next) => {
  try {
    const activePatients = await User.countDocuments({ role: 'patient', blocked: false });
    res.json({ activePatients });
  } catch (error) {
    next(error);
  }
};

exports.auditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

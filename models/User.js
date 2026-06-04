const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  day: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'clinician', 'admin'], default: 'patient' },
  profile: {
    specialty: String,
    qualifications: String,
    bio: String,
    availability: [availabilitySchema],
  },
  assignedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedClinician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  blocked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

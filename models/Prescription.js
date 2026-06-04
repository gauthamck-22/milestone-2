const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: String,
  duration: String,
  notes: String,
});

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clinician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medications: [medicationSchema],
  notes: String,
  fulfilled: { type: Boolean, default: false },
  fulfilledAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);

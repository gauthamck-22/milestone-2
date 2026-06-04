const mongoose = require('mongoose');

const medicalEntrySchema = new mongoose.Schema({
  title: String,
  details: String,
  date: { type: Date, default: Date.now },
});

const emrSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clinician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visitNotes: String,
  diagnosis: String,
  medications: [medicalEntrySchema],
  labResults: [medicalEntrySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('EMR', emrSchema);

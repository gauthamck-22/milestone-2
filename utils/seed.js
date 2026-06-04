const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDb = require('../config/db');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

dotenv.config();

const run = async () => {
  await connectDb();

  const users = [
    {
      name: 'Admin User',
      email: 'admin@healthcare.test',
      password: 'Admin123',
      role: 'admin',
    },
    {
      name: 'Dr. Maya Patel',
      email: 'dr.maya@healthcare.test',
      password: 'Doctor123',
      role: 'clinician',
      profile: {
        specialty: 'General Medicine',
        qualifications: 'MBBS, MD',
        bio: 'Experienced physician with a focus on preventive care.',
        availability: [
          { day: 'Monday', start: '09:00', end: '17:00' },
          { day: 'Wednesday', start: '09:00', end: '17:00' },
        ],
      },
    },
    {
      name: 'Patient Sara Lee',
      email: 'sara@healthcare.test',
      password: 'Patient123',
      role: 'patient',
    },
  ];

  for (const input of users) {
    const existing = await User.findOne({ email: input.email });
    if (!existing) {
      const hashed = await bcrypt.hash(input.password, 10);
      await User.create({ ...input, password: hashed });
      console.log(`Created ${input.role}: ${input.email}`);
    } else {
      console.log(`Already exists: ${input.email}`);
    }
  }

  const clinician = await User.findOne({ role: 'clinician' });
  const patient = await User.findOne({ role: 'patient' });
  if (clinician && patient) {
    if (!clinician.assignedPatients.includes(patient._id)) {
      clinician.assignedPatients.push(patient._id);
      await clinician.save();
    }
    patient.assignedClinician = clinician._id;
    await patient.save();

    const appointmentExists = await Appointment.findOne({ clinician: clinician._id, patient: patient._id });
    if (!appointmentExists) {
      await Appointment.create({
        clinician: clinician._id,
        patient: patient._id,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        notes: 'Initial wellness visit',
        createdBy: patient._id,
      });
      console.log('Created sample appointment');
    }
  }

  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  marks: { type: Number, required: true, min: 0, max: 100 },
  grade: { type: String, required: true },
  status: { type: String, enum: ['Pass', 'Fail'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);

const mongoose = require('mongoose');

const examRegistrationSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  exam_date: { type: Date, required: true }
}, { timestamps: true });

// Prevent duplicate registrations for same student + course
examRegistrationSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

// Ensure virtual fields (like id) are serialized
examRegistrationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

module.exports = mongoose.model('ExamRegistration', examRegistrationSchema);

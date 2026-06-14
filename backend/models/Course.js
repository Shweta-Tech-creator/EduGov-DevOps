const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  course_name: { type: String, required: true, trim: true },
  course_code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  instructor: { type: String, required: true, trim: true },
  credits: { type: Number, required: true, min: 1, max: 6 },
  description: { type: String, trim: true }
}, { timestamps: true });

// Ensure virtual fields (like id) are serialized
courseSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

module.exports = mongoose.model('Course', courseSchema);

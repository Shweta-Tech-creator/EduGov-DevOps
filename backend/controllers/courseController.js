const Course = require('../models/Course');

// Get all courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ course_code: 1 });
    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Fetch Courses Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
};

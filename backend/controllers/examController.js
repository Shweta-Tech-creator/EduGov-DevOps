const Course = require('../models/Course');
const ExamRegistration = require('../models/ExamRegistration');

// Register for an exam
exports.registerExam = async (req, res) => {
  const { course_id, exam_date } = req.body;
  const student_id = req.user.id; // From authMiddleware (student's ObjectId string)

  // Validate input
  if (!course_id || !exam_date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide course ID and exam date'
    });
  }

  try {
    // Check if course exists
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'The selected course does not exist'
      });
    }

    // Check if student is already registered for this exam
    const existing = await ExamRegistration.findOne({ student_id, course_id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this course exam'
      });
    }

    // Insert registration
    const registration = new ExamRegistration({
      student_id,
      course_id,
      exam_date
    });
    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Exam registration completed successfully',
      data: {
        id: registration.id,
        student_id,
        course_id,
        exam_date
      }
    });
  } catch (error) {
    console.error('Exam Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during exam registration. Please try again.'
    });
  }
};

// Get all exam registrations for the logged-in student
exports.getRegistrations = async (req, res) => {
  const student_id = req.user.id; // From authMiddleware

  try {
    const registrations = await ExamRegistration.find({ student_id })
      .populate('course_id')
      .sort({ exam_date: 1 });

    // Flatten registrations for frontend compatibility
    const formattedRegistrations = registrations.map(reg => {
      const course = reg.course_id || {};
      return {
        id: reg.id,
        exam_date: reg.exam_date,
        created_at: reg.createdAt,
        course_name: course.course_name || 'N/A',
        course_code: course.course_code || 'N/A',
        instructor: course.instructor || 'N/A',
        credits: course.credits || 0
      };
    });

    res.status(200).json({
      success: true,
      data: formattedRegistrations
    });
  } catch (error) {
    console.error('Fetch Registrations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching exam registrations'
    });
  }
};

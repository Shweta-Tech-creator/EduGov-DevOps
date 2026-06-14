const Result = require('../models/Result');

// Get results for the logged-in student
exports.getResults = async (req, res) => {
  const student_id = req.user.id; // From authMiddleware (student's ObjectId string)

  try {
    const results = await Result.find({ student_id }).sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Fetch Results Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching results'
    });
  }
};

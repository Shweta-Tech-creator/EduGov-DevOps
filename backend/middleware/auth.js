const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No Token Provided'
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'edugov_super_secret_jwt_key_2026');
    req.user = verified; // { id: student_id, name: student_name, email: student_email }
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Invalid or Expired Token'
    });
  }
};

module.exports = authMiddleware;

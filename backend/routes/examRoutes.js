const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middleware/auth');

// Protected Routes
router.post('/register', authMiddleware, examController.registerExam);
router.get('/', authMiddleware, examController.getRegistrations);

module.exports = router;

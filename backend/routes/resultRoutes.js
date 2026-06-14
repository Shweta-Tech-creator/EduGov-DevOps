const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const authMiddleware = require('../middleware/auth');

// Protected Routes
router.get('/', authMiddleware, resultController.getResults);

module.exports = router;

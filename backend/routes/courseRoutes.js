const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Route mapping
router.get('/', courseController.getCourses);

module.exports = router;

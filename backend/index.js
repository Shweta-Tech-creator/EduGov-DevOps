const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const examRoutes = require('./routes/examRoutes');
const resultRoutes = require('./routes/resultRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all requests (crucial for frontend-backend communication)
app.use(cors({
  origin: '*', // In production, replace with specific domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);

// Base route for connectivity checks
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the EduGov Education Management System API'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred on the server'
  });
});

// Listen on server port
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`EduGov Backend Server started successfully!`);
  console.log(`Local Access: http://localhost:${PORT}`);
  console.log(`====================================================`);
});

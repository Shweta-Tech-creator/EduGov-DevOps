const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/edugov_db');
    console.log(`MongoDB Connected: ${conn.connection.host} → Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('CRITICAL: MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

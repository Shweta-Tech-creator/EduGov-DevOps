const mongoose = require('mongoose');
const Student = require('../models/Student');
const Course = require('../models/Course');
const ExamRegistration = require('../models/ExamRegistration');
const Result = require('../models/Result');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edugov_db');
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const studentsData = [
  { name: 'Alice Smith', email: 'alice@edugov.edu', password: 'password123' },
  { name: 'Bob Johnson', email: 'bob@edugov.edu', password: 'password123' },
  { name: 'Charlie Brown', email: 'charlie@edugov.edu', password: 'password123' },
  { name: 'Diana Prince', email: 'diana@edugov.edu', password: 'password123' },
  { name: 'Evan Wright', email: 'evan@edugov.edu', password: 'password123' },
  { name: 'Fiona Gallagher', email: 'fiona@edugov.edu', password: 'password123' },
  { name: 'George Clark', email: 'george@edugov.edu', password: 'password123' },
  { name: 'Hannah Abbott', email: 'hannah@edugov.edu', password: 'password123' },
  { name: 'Ian Malcolm', email: 'ian@edugov.edu', password: 'password123' },
  { name: 'Julia Roberts', email: 'julia@edugov.edu', password: 'password123' }
];

const coursesData = [
  { course_name: 'Introduction to Computer Science', course_code: 'CS101', instructor: 'Dr. Alan Turing', credits: 4, description: 'Fundamental concepts of programming, algorithms, and computational thinking using modern languages.' },
  { course_name: 'Database Management Systems', course_code: 'CS302', instructor: 'Dr. Edgar Codd', credits: 3, description: 'Relational model, SQL querying, normalization, indexing, transactions, and modern database systems design.' },
  { course_name: 'Software Engineering Practices', course_code: 'SE201', instructor: 'Prof. Margaret Hamilton', credits: 4, description: 'Software development life cycle, agile methods, version control, testing methodologies, and design patterns.' },
  { course_name: 'Computer Networks & Security', course_code: 'CS401', instructor: 'Dr. Vint Cerf', credits: 3, description: 'Network layers, protocols (TCP/IP), network security, routing algorithms, cryptography, and firewalls.' },
  { course_name: 'Introduction to DevOps', course_code: 'DO501', instructor: 'Gene Kim', credits: 3, description: 'Continuous Integration, Continuous Deployment, Infrastructure as Code, Docker containers, and automation pipelines.' },
  { course_name: 'Operating Systems Design', course_code: 'CS204', instructor: 'Linus Torvalds', credits: 4, description: 'Processes, threads, CPU scheduling, memory management, file systems, and operating system security mechanisms.' },
  { course_name: 'Artificial Intelligence & ML', course_code: 'AI303', instructor: 'Dr. Andrew Ng', credits: 4, description: 'Supervised and unsupervised learning, neural networks, decision trees, reinforcement learning, and AI ethics.' },
  { course_name: 'Cloud Computing Systems', course_code: 'CS405', instructor: 'Dr. Werner Vogels', credits: 3, description: 'Virtualization, cloud service models (IaaS, PaaS, SaaS), serverless architectures, and distributed systems.' },
  { course_name: 'Web Application Development', course_code: 'WD102', instructor: 'Tim Berners-Lee', credits: 3, description: 'HTML5, CSS3, modern JavaScript, frontend frameworks, backend APIs, and database integration.' },
  { course_name: 'Discrete Mathematics', course_code: 'MA201', instructor: 'Dr. Ada Lovelace', credits: 3, description: 'Logic, set theory, graph theory, combinatorics, proof techniques, and algebraic structures for computing.' }
];

const seedDB = async () => {
  await connectDB();

  try {
    // 1. Clean existing collections
    console.log('Cleaning collections...');
    await Student.deleteMany({});
    await Course.deleteMany({});
    await ExamRegistration.deleteMany({});
    await Result.deleteMany({});

    // 2. Insert Students
    console.log('Inserting students...');
    const createdStudents = [];
    for (const student of studentsData) {
      // Create one by one so password pre-save hook runs correctly
      const newStudent = new Student(student);
      const saved = await newStudent.save();
      createdStudents.push(saved);
    }
    console.log(`Successfully seeded ${createdStudents.length} students.`);

    // 3. Insert Courses
    console.log('Inserting courses...');
    const createdCourses = await Course.insertMany(coursesData);
    console.log(`Successfully seeded ${createdCourses.length} courses.`);

    // Helper maps from old 1-based MySQL index to MongoDB ObjectIds
    const studentMap = {};
    createdStudents.forEach((s, idx) => {
      studentMap[idx + 1] = s._id;
    });

    const courseMap = {};
    createdCourses.forEach((c, idx) => {
      courseMap[idx + 1] = c._id;
    });

    // 4. Seeding Exam Registrations
    console.log('Inserting exam registrations...');
    const examRegistrationsData = [
      { student_id: studentMap[1], course_id: courseMap[1], exam_date: '2026-06-15' },
      { student_id: studentMap[1], course_id: courseMap[2], exam_date: '2026-06-17' },
      { student_id: studentMap[2], course_id: courseMap[3], exam_date: '2026-06-16' },
      { student_id: studentMap[3], course_id: courseMap[5], exam_date: '2026-06-18' },
      { student_id: studentMap[4], course_id: courseMap[6], exam_date: '2026-06-19' },
      { student_id: studentMap[5], course_id: courseMap[4], exam_date: '2026-06-20' },
      { student_id: studentMap[6], course_id: courseMap[7], exam_date: '2026-06-21' },
      { student_id: studentMap[7], course_id: courseMap[8], exam_date: '2026-06-22' },
      { student_id: studentMap[8], course_id: courseMap[9], exam_date: '2026-06-23' },
      { student_id: studentMap[9], course_id: courseMap[10], exam_date: '2026-06-24' }
    ];
    const createdRegistrations = await ExamRegistration.insertMany(examRegistrationsData);
    console.log(`Successfully seeded ${createdRegistrations.length} exam registrations.`);

    // 5. Seeding Results
    console.log('Inserting results...');
    const resultsData = [
      { student_id: studentMap[1], subject: 'Introduction to Computer Science', marks: 88, grade: 'A', status: 'Pass' },
      { student_id: studentMap[1], subject: 'Database Management Systems', marks: 92, grade: 'A+', status: 'Pass' },
      { student_id: studentMap[2], subject: 'Software Engineering Practices', marks: 75, grade: 'B', status: 'Pass' },
      { student_id: studentMap[3], subject: 'Introduction to DevOps', marks: 82, grade: 'A-', status: 'Pass' },
      { student_id: studentMap[4], subject: 'Operating Systems Design', marks: 45, grade: 'F', status: 'Fail' },
      { student_id: studentMap[5], subject: 'Computer Networks & Security', marks: 68, grade: 'C+', status: 'Pass' },
      { student_id: studentMap[6], subject: 'Artificial Intelligence & ML', marks: 91, grade: 'A+', status: 'Pass' },
      { student_id: studentMap[7], subject: 'Cloud Computing Systems', marks: 85, grade: 'A', status: 'Pass' },
      { student_id: studentMap[8], subject: 'Web Application Development', marks: 72, grade: 'B-', status: 'Pass' },
      { student_id: studentMap[9], subject: 'Discrete Mathematics', marks: 55, grade: 'D', status: 'Pass' }
    ];
    const createdResults = await Result.insertMany(resultsData);
    console.log(`Successfully seeded ${createdResults.length} exam results.`);

    console.log('Database seeding finished successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

seedDB();

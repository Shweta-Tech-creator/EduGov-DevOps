-- Create EduGov Database Schema
CREATE DATABASE IF NOT EXISTS edugov_db;
USE edugov_db;

-- 1. Students Table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(255) NOT NULL,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  instructor VARCHAR(255) NOT NULL,
  credits INT NOT NULL,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Exam Registrations Table
CREATE TABLE IF NOT EXISTS exam_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  exam_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Results Table
CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  marks INT NOT NULL,
  grade VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- SEED DATA (10 Records per table)
-- All student passwords are: password123
-- (Bcrypt hash: $2a$10$M9lGvP3PZ6oF97T2k1R8u.8fR5d3Z2wU1xYJc4lK2h9j4x1R6/6Oq)
-- ==========================================

-- Seed Students
INSERT INTO students (id, name, email, password) VALUES
(1, 'Alice Smith', 'alice@edugov.edu', '$2a$10$M9lGvP3PZ6oF97T2k1R8u.8fR5d3Z2wU1xYJc4lK2h9j4x1R6/6Oq'),
(2, 'Bob Johnson', 'bob@edugov.edu', '$2a$10$M9lGvP3PZ6oF97T2k1R8u.8fR5d3Z2wU1xYJc4lK2h9j4x1R6/6Oq'),
(3, 'Charlie Brown', 'charlie@edugov.edu', '$2a$10$M9lGvP3PZ6oF97T2k1R8u.8fR5d3Z2wU1xYJc4lK2h9j4x1R6/6Oq'),
(4, 'Diana Prince', 'diana@edugov.edu', '$2a$10$M9lGvP3PZ6oF97T2k1R8u.8fR5d3Z2wU1xYJc4lK2h9j4x1R6/6Oq'),
(5, 'Evan Wright', 'evan@edugov.edu', '$2a$10$M9lGvP3PZ6oF97T2k1R8u.8fR5d3Z2wU1xYJc4lK2h9j4x1R6/6Oq'),
(6, 'Fiona Gallagher', 'fiona@edugov.edu', '$2a$10$M9lGvP3PZ6oF97T2k1R8u.8fR5d3Z2wU1xYJc4lK2h9j4x1R6/6Oq'),
(7, 'George Clark', 'george@edugov.edu', '$2a$10$M9lGvP3PZ6oF97T2k1R8u.8fR5d3Z2wU1xYJc4lK2h9j4x1R6/6Oq'),
(8, 'Hannah Abbott', 'hannah@edugov.edu', '$2a$10$M9lGvP3PZ6oF97T2k1R8u.8fR5d3Z2wU1xYJc4lK2h9j4x1R6/6Oq'),
(9, 'Ian Malcolm', 'ian@edugov.edu', '$2a$10$M9lGvP3PZ6oF97T2k1R8u.8fR5d3Z2wU1xYJc4lK2h9j4x1R6/6Oq'),
(10, 'Julia Roberts', 'julia@edugov.edu', '$2a$10$M9lGvP3PZ6oF97T2k1R8u.8fR5d3Z2wU1xYJc4lK2h9j4x1R6/6Oq')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Courses
INSERT INTO courses (id, course_name, course_code, instructor, credits, description) VALUES
(1, 'Introduction to Computer Science', 'CS101', 'Dr. Alan Turing', 4, 'Fundamental concepts of programming, algorithms, and computational thinking using modern languages.'),
(2, 'Database Management Systems', 'CS302', 'Dr. Edgar Codd', 3, 'Relational model, SQL querying, normalization, indexing, transactions, and modern database systems design.'),
(3, 'Software Engineering Practices', 'SE201', 'Prof. Margaret Hamilton', 4, 'Software development life cycle, agile methods, version control, testing methodologies, and design patterns.'),
(4, 'Computer Networks & Security', 'CS401', 'Dr. Vint Cerf', 3, 'Network layers, protocols (TCP/IP), network security, routing algorithms, cryptography, and firewalls.'),
(5, 'Introduction to DevOps', 'DO501', 'Gene Kim', 3, 'Continuous Integration, Continuous Deployment, Infrastructure as Code, Docker containers, and automation pipelines.'),
(6, 'Operating Systems Design', 'CS204', 'Linus Torvalds', 4, 'Processes, threads, CPU scheduling, memory management, file systems, and operating system security mechanisms.'),
(7, 'Artificial Intelligence & ML', 'AI303', 'Dr. Andrew Ng', 4, 'Supervised and unsupervised learning, neural networks, decision trees, reinforcement learning, and AI ethics.'),
(8, 'Cloud Computing Systems', 'CS405', 'Dr. Werner Vogels', 3, 'Virtualization, cloud service models (IaaS, PaaS, SaaS), serverless architectures, and distributed systems.'),
(9, 'Web Application Development', 'WD102', 'Tim Berners-Lee', 3, 'HTML5, CSS3, modern JavaScript, frontend frameworks, backend APIs, and database integration.'),
(10, 'Discrete Mathematics', 'MA201', 'Dr. Ada Lovelace', 3, 'Logic, set theory, graph theory, combinatorics, proof techniques, and algebraic structures for computing.')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Exam Registrations
INSERT INTO exam_registrations (id, student_id, course_id, exam_date) VALUES
(1, 1, 1, '2026-06-15'),
(2, 1, 2, '2026-06-17'),
(3, 2, 3, '2026-06-16'),
(4, 3, 5, '2026-06-18'),
(5, 4, 6, '2026-06-19'),
(6, 5, 4, '2026-06-20'),
(7, 6, 7, '2026-06-21'),
(8, 7, 8, '2026-06-22'),
(9, 8, 9, '2026-06-23'),
(10, 9, 10, '2026-06-24')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Results
INSERT INTO results (id, student_id, subject, marks, grade, status) VALUES
(1, 1, 'Introduction to Computer Science', 88, 'A', 'Pass'),
(2, 1, 'Database Management Systems', 92, 'A+', 'Pass'),
(3, 2, 'Software Engineering Practices', 75, 'B', 'Pass'),
(4, 3, 'Introduction to DevOps', 82, 'A-', 'Pass'),
(5, 4, 'Operating Systems Design', 45, 'F', 'Fail'),
(6, 5, 'Computer Networks & Security', 68, 'C+', 'Pass'),
(7, 6, 'Artificial Intelligence & ML', 91, 'A+', 'Pass'),
(8, 7, 'Cloud Computing Systems', 85, 'A', 'Pass'),
(9, 8, 'Web Application Development', 72, 'B-', 'Pass'),
(10, 9, 'Discrete Mathematics', 55, 'D', 'Pass')
ON DUPLICATE KEY UPDATE id=id;

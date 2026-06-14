import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';

const ExamRegistration = () => {
  const { user } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [selectedCourse, setSelectedCourse] = useState('');
  const [examDate, setExamDate] = useState('');

  // Fetch courses and current registrations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, regsRes] = await Promise.all([
          api.get('/courses'),
          api.get('/exams')
        ]);
        setCourses(coursesRes.data.data || []);
        setRegistrations(regsRes.data.data || []);
      } catch (err) {
        setToast({ message: 'Failed to load data. Check backend connection.', type: 'error' });
      } finally {
        setLoadingCourses(false);
        setLoadingRegistrations(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourse || !examDate) {
      setToast({ message: 'Please select a course and exam date.', type: 'warning' });
      return;
    }

    // Validate exam date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (examDate < today) {
      setToast({ message: 'Exam date cannot be in the past.', type: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/exams/register', {
        course_id: selectedCourse,
        exam_date: examDate
      });

      if (res.data.success) {
        setToast({ message: '🎉 Successfully registered for the exam!', type: 'success' });
        // Refresh registrations
        const regsRes = await api.get('/exams');
        setRegistrations(regsRes.data.data || []);
        // Reset form
        setSelectedCourse('');
        setExamDate('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Get tomorrow's date as minimum selectable exam date
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Exam Registration</h1>
        <p className="page-subtitle">Register for upcoming exams by selecting a course and date.</p>
      </div>

      <div className="exam-split-layout">
        {/* Registration Form */}
        <div className="form-card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>📋 New Registration</h2>

          <form onSubmit={handleSubmit}>
            {/* Student Name (read-only from session) */}
            <div className="form-group">
              <label className="form-label" htmlFor="student-name">Student Name</label>
              <input
                type="text"
                id="student-name"
                className="form-control"
                value={user?.name || ''}
                disabled
                style={{ backgroundColor: '#f8fafc', color: 'var(--text-muted)', cursor: 'not-allowed' }}
              />
            </div>

            {/* Roll Number (Student ID from DB) */}
            <div className="form-group">
              <label className="form-label" htmlFor="roll-number">Roll Number</label>
              <input
                type="text"
                id="roll-number"
                className="form-control"
                value={user ? `STU-${String(user.id).padStart(4, '0')}` : ''}
                disabled
                style={{ backgroundColor: '#f8fafc', color: 'var(--text-muted)', cursor: 'not-allowed' }}
              />
            </div>

            {/* Course Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="course-select">Select Course</label>
              {loadingCourses ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading courses...</p>
              ) : (
                <select
                  id="course-select"
                  className="form-control"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={submitting}
                  required
                >
                  <option value="">-- Choose a Course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_code} — {course.course_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Exam Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="exam-date">Exam Date</label>
              <input
                type="date"
                id="exam-date"
                className="form-control"
                value={examDate}
                min={getMinDate()}
                onChange={(e) => setExamDate(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <button
              type="submit"
              id="submit-exam-registration"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={submitting || loadingCourses}
            >
              {submitting ? 'Registering...' : 'Register for Exam'}
            </button>
          </form>
        </div>

        {/* Registered Exams Table */}
        <div>
          <h2 style={{ marginBottom: '1.25rem', fontSize: '1.15rem' }}>
            📅 My Registered Exams
            <span
              className="badge badge-info"
              style={{ marginLeft: '0.75rem', fontSize: '0.75rem' }}
            >
              {registrations.length}
            </span>
          </h2>

          {loadingRegistrations ? (
            <div className="loading-wrapper" style={{ padding: '2rem' }}>
              <div className="spinner"></div>
            </div>
          ) : registrations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Registrations Yet</h3>
              <p>Use the form to register for your first exam.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Course</th>
                    <th>Code</th>
                    <th>Instructor</th>
                    <th>Exam Date</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg, index) => (
                    <tr key={reg.id} id={`exam-row-${reg.id}`}>
                      <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                      <td style={{ fontWeight: 600 }}>{reg.course_name}</td>
                      <td>
                        <span className="badge badge-info">{reg.course_code}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{reg.instructor}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {new Date(reg.exam_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="toast-container">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ExamRegistration;

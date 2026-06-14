import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data.data || []);
      } catch (err) {
        setError('Failed to load courses. Please ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.course_name.toLowerCase().includes(q) ||
      c.course_code.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q)
    );
  });

  const creditColors = {
    3: { bg: '#f5f3ff', color: '#7c3aed' },
    4: { bg: '#eff6ff', color: '#2563eb' },
    2: { bg: '#ecfdf5', color: '#059669' }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Course Catalogue</h1>
        <p className="page-subtitle">Browse all available courses offered this semester.</p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          id="course-search"
          className="form-control"
          placeholder="🔍  Search by course name, code, or instructor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '480px' }}
        />
      </div>

      {loading && (
        <div className="loading-wrapper">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading courses...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && !error && filteredCourses.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>No courses found</h3>
          <p>Try adjusting your search query.</p>
        </div>
      )}

      {!loading && !error && filteredCourses.length > 0 && (
        <>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Showing <strong>{filteredCourses.length}</strong> of <strong>{courses.length}</strong> courses
          </p>
          <div className="course-grid">
            {filteredCourses.map((course) => {
              const creditStyle = creditColors[course.credits] || { bg: '#f8fafc', color: '#64748b' };
              return (
                <div key={course.id} className="card course-card" id={`course-${course.id}`}>
                  <div className="course-header">
                    <span className="course-code">{course.course_code}</span>
                    <h2 className="course-title" style={{ fontSize: '1.15rem', marginBottom: 0 }}>
                      {course.course_name}
                    </h2>
                  </div>
                  <div className="course-body">
                    <p className="course-description">{course.description}</p>
                    <div className="course-meta">
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                          Instructor
                        </div>
                        <div className="course-instructor">👨‍🏫 {course.instructor}</div>
                      </div>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: creditStyle.bg,
                          color: creditStyle.color
                        }}
                      >
                        {course.credits} Credits
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Courses;

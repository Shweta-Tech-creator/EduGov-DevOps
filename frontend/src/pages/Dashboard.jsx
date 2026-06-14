import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ courses: 0, exams: 0, results: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [coursesRes, examsRes, resultsRes] = await Promise.all([
          api.get('/courses'),
          api.get('/exams'),
          api.get('/results')
        ]);
        setStats({
          courses: coursesRes.data.data?.length || 0,
          exams: examsRes.data.data?.length || 0,
          results: resultsRes.data.data?.length || 0
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      id: 'stat-courses',
      label: 'Total Courses',
      value: stats.courses,
      icon: '📚',
      path: '/courses',
      color: '#2563eb',
      bgColor: '#eff6ff'
    },
    {
      id: 'stat-exams',
      label: 'Registered Exams',
      value: stats.exams,
      icon: '📝',
      path: '/exams',
      color: '#7c3aed',
      bgColor: '#f5f3ff'
    },
    {
      id: 'stat-results',
      label: 'Available Results',
      value: stats.results,
      icon: '🏆',
      path: '/results',
      color: '#059669',
      bgColor: '#ecfdf5'
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="page-container">
      {/* Welcome Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '0.25rem' }}>
          {getGreeting()}, 👋
        </p>
        <h1 style={{ marginBottom: '0.5rem' }}>{user?.name}</h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          Here's a summary of your academic activity on EduGov.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {statCards.map((card) => (
          <Link to={card.path} key={card.id} className="card stat-card" id={card.id} style={{ textDecoration: 'none' }}>
            <div className="stat-info">
              <h3>{card.label}</h3>
              <div className="stat-number">
                {loadingStats ? (
                  <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>...</span>
                ) : (
                  card.value
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Click to view →
              </p>
            </div>
            <div
              className="stat-icon-wrapper"
              style={{ backgroundColor: card.bgColor, color: card.color }}
            >
              <span style={{ fontSize: '1.75rem' }}>{card.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Access Panel */}
      <div style={{ marginTop: '1rem' }}>
        <h2>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <Link
            to="/courses"
            id="quick-browse-courses"
            className="card"
            style={{
              padding: '1.5rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <span style={{ fontSize: '2rem' }}>📚</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Browse Courses</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Explore available courses</div>
            </div>
          </Link>

          <Link
            to="/exams"
            id="quick-register-exam"
            className="card"
            style={{
              padding: '1.5rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <span style={{ fontSize: '2rem' }}>📝</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Register for Exam</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Schedule your next exam</div>
            </div>
          </Link>

          <Link
            to="/results"
            id="quick-view-results"
            className="card"
            style={{
              padding: '1.5rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <span style={{ fontSize: '2rem' }}>🏆</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>View Results</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Check your grades & marks</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

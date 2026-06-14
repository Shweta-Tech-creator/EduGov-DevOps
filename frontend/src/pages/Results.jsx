import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/results');
        setResults(res.data.data || []);
      } catch (err) {
        setError('Failed to load results. Please check the backend connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Grade color mapper
  const getGradeStyle = (grade) => {
    if (['A+', 'A', 'A-'].includes(grade)) return { bg: '#ecfdf5', color: '#059669' };
    if (['B+', 'B', 'B-'].includes(grade)) return { bg: '#eff6ff', color: '#2563eb' };
    if (['C+', 'C', 'C-'].includes(grade)) return { bg: '#fffbeb', color: '#d97706' };
    if (['D'].includes(grade)) return { bg: '#fff7ed', color: '#ea580c' };
    if (['F'].includes(grade)) return { bg: '#fef2f2', color: '#dc2626' };
    return { bg: '#f8fafc', color: '#64748b' };
  };

  // Calculate summary stats
  const avgMarks = results.length
    ? Math.round(results.reduce((acc, r) => acc + r.marks, 0) / results.length)
    : 0;
  const passCount = results.filter((r) => r.status === 'Pass').length;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Examination Results</h1>
        <p className="page-subtitle">Your academic performance across all registered exams.</p>
      </div>

      {/* Summary Stats */}
      {!loading && results.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)' }}>
              {results.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Total Exams
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>
              {passCount}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Passed
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626' }}>
              {results.length - passCount}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Failed
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed' }}>
              {avgMarks}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Avg. Marks
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-wrapper">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading your results...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>No Results Available</h3>
          <p>Your exam results will appear here once they are published.</p>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Subject</th>
                <th>Marks Obtained</th>
                <th>Grade</th>
                <th>Result Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => {
                const gradeStyle = getGradeStyle(result.grade);
                const marksPercent = result.marks;
                let marksColor = '#2563eb';
                if (marksPercent >= 80) marksColor = '#059669';
                else if (marksPercent >= 60) marksColor = '#d97706';
                else if (marksPercent < 50) marksColor = '#dc2626';

                return (
                  <tr key={result.id} id={`result-row-${result.id}`}>
                    <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                    <td style={{ fontWeight: 600 }}>{result.subject}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: marksColor, fontSize: '1.05rem' }}>
                          {result.marks}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/100</span>
                        {/* Mini progress bar */}
                        <div
                          style={{
                            flex: 1,
                            maxWidth: '80px',
                            height: '6px',
                            backgroundColor: '#e2e8f0',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${result.marks}%`,
                              backgroundColor: marksColor,
                              borderRadius: '3px',
                              transition: 'width 0.5s ease'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ backgroundColor: gradeStyle.bg, color: gradeStyle.color }}
                      >
                        {result.grade}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${result.status === 'Pass' ? 'badge-success' : 'badge-danger'}`}
                      >
                        {result.status === 'Pass' ? '✅' : '❌'} {result.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Results;

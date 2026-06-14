import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Course List', path: '/courses', icon: '📚' },
    { name: 'Exam Registration', path: '/exams', icon: '📝' },
    { name: 'Exam Results', path: '/results', icon: '🏆' }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <span>Edu</span>Gov 🎓
      </div>
      <nav style={{ flex: 1 }}>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.name} className="sidebar-item" onClick={toggleSidebar}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
          EduGov Version 1.0.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

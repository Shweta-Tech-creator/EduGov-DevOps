import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  // Extract initials (e.g. "Alice Smith" -> "AS")
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName[0].toUpperCase();
  };

  return (
    <header className="navbar">
      <button 
        className="mobile-menu-toggle" 
        onClick={toggleSidebar} 
        aria-label="Toggle Navigation Menu"
      >
        ☰
      </button>
      
      <a href="#" className="nav-brand-mobile" onClick={(e) => e.preventDefault()}>
        <span>Edu</span>Gov 🎓
      </a>

      <div className="navbar-user">
        <div className="user-profile">
          <div className="user-avatar" title={user.email}>
            {getInitials(user.name)}
          </div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">Student</span>
          </div>
        </div>
        
        <button 
          onClick={logout} 
          className="btn btn-secondary btn-logout" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          Logout 🚪
        </button>
      </div>
    </header>
  );
};

export default Navbar;

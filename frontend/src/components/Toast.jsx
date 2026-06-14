import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span style={{ fontSize: '1.1rem' }}>{getIcon()}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button 
        onClick={onClose} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'inherit', 
          cursor: 'pointer', 
          fontSize: '0.8rem',
          marginLeft: '0.5rem',
          opacity: 0.7
        }}
        aria-label="Dismiss toast"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;

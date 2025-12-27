import React from 'react';
import './Alert.css';

const Alert = ({ 
  type = 'info', 
  children, 
  onClose,
  className = '' 
}) => {
  const classes = [
    'alert',
    `alert-${type}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="alert-content">
        {children}
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;

import React from 'react';
import './Input.css';

const Input = ({ 
  label, 
  error, 
  type = 'text',
  fullWidth = true,
  className = '',
  ...props 
}) => {
  return (
    <div className={`input-group ${fullWidth ? 'input-full' : ''}`}>
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};

export default Input;

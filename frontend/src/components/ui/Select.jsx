import React from 'react';
import './Select.css';

const Select = ({ 
  label, 
  error, 
  options = [],
  fullWidth = true,
  className = '',
  ...props 
}) => {
  return (
    <div className={`select-group ${fullWidth ? 'select-full' : ''}`}>
      {label && <label className="select-label">{label}</label>}
      <select
        className={`select ${error ? 'select-error' : ''} ${className}`}
        {...props}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="select-error-text">{error}</span>}
    </div>
  );
};

export default Select;

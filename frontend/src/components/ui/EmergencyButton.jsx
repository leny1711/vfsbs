import React from 'react';
import './EmergencyButton.css';

const EmergencyButton = ({ onClick, loading = false, disabled = false }) => {
  return (
    <button
      className={`emergency-button ${loading ? 'loading' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label="Emergency - Find help now"
    >
      <span className="emergency-icon">🚨</span>
      <span className="emergency-text">
        {loading ? 'Finding Help...' : 'Emergency'}
      </span>
      <span className="emergency-subtext">
        {loading ? 'Please wait' : 'Get help now'}
      </span>
    </button>
  );
};

export default EmergencyButton;

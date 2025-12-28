import React from 'react';
import './ProviderCard.css';

const ProviderCard = ({ provider, onBook, onSelect }) => {
  const {
    id,
    name,
    serviceType,
    distance,
    availability,
    rating,
    pricePerHour,
    location,
    description,
    isAvailable = true
  } = provider;

  const handleClick = () => {
    if (onSelect) {
      onSelect(provider);
    }
  };

  const handleBook = (e) => {
    e.stopPropagation();
    if (onBook) {
      onBook(provider);
    }
  };

  return (
    <div
      className={`provider-card ${!isAvailable ? 'unavailable' : ''}`}
      onClick={handleClick}
    >
      <div className="provider-header">
        <div className="provider-avatar">
          {name ? name.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="provider-info">
          <h3 className="provider-name">{name || 'Provider'}</h3>
          <p className="provider-service">{serviceType || 'Service'}</p>
        </div>
        <div className={`availability-badge ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? '✓ Available' : 'Busy'}
        </div>
      </div>

      <div className="provider-details">
        {description && (
          <p className="provider-description">{description}</p>
        )}
        
        <div className="provider-stats">
          <div className="stat-item">
            <span className="stat-icon">📍</span>
            <span className="stat-value">{distance ? `${distance.toFixed(1)} km` : 'Nearby'}</span>
          </div>
          
          {rating && (
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <span className="stat-value">{rating.toFixed(1)}</span>
            </div>
          )}
          
          {pricePerHour && (
            <div className="stat-item">
              <span className="stat-icon">💰</span>
              <span className="stat-value">${pricePerHour}/hr</span>
            </div>
          )}
        </div>
      </div>

      {onBook && isAvailable && (
        <button className="book-button" onClick={handleBook}>
          Book Now
        </button>
      )}
    </div>
  );
};

export default ProviderCard;

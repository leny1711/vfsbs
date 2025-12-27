import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { schedulesAPI } from '../services/api';
import { Button, Card, Input, Loading, Alert } from '../components/ui';
import { format } from 'date-fns';
import './Search.css';

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    date: ''
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.origin) params.origin = filters.origin;
      if (filters.destination) params.destination = filters.destination;
      if (filters.date) params.date = filters.date;

      const response = await schedulesAPI.search(params);
      setSchedules(response.data.schedules || response.data || []);
    } catch (err) {
      setError('Failed to load schedules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSchedules();
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  return (
    <div className="search-container">
      <div className="container">
        <div className="search-header">
          <h1>Search Bus Schedules 🔍</h1>
          <p>Find the perfect route for your journey</p>
        </div>

        <Card className="search-filters-card">
          <div className="search-filters">
            <Input
              label="From"
              placeholder="Enter origin city"
              value={filters.origin}
              onChange={(e) => handleFilterChange('origin', e.target.value)}
              fullWidth={false}
            />
            <Input
              label="To"
              placeholder="Enter destination city"
              value={filters.destination}
              onChange={(e) => handleFilterChange('destination', e.target.value)}
              fullWidth={false}
            />
            <Input
              label="Date"
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              fullWidth={false}
            />
            <div className="search-button-container">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSearch}
                fullWidth
              >
                Search
              </Button>
            </div>
          </div>
        </Card>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <Loading text="Searching for schedules..." />
        ) : schedules.length === 0 ? (
          <Card className="no-results-card">
            <div className="no-results">
              <h3>No schedules found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          </Card>
        ) : (
          <div className="search-results">
            <div className="results-header">
              <h2>Available Schedules</h2>
              <span className="results-count">{schedules.length} routes found</span>
            </div>

            <div className="schedules-list">
              {schedules.map((schedule) => (
                <Card key={schedule.id} className="schedule-item" hover>
                  <div className="schedule-main">
                    <div className="schedule-route-info">
                      <h3>{schedule.route?.name || 'Route'}</h3>
                      <div className="route-cities">
                        <span className="city">{schedule.route?.origin}</span>
                        <span className="arrow">→</span>
                        <span className="city">{schedule.route?.destination}</span>
                      </div>
                    </div>

                    <div className="schedule-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Departure</span>
                        <span className="detail-value">
                          {format(new Date(schedule.departureTime), 'MMM dd, yyyy')}
                        </span>
                        <span className="detail-time">
                          {format(new Date(schedule.departureTime), 'HH:mm')}
                        </span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-label">Arrival</span>
                        <span className="detail-value">
                          {format(new Date(schedule.arrivalTime), 'MMM dd, yyyy')}
                        </span>
                        <span className="detail-time">
                          {format(new Date(schedule.arrivalTime), 'HH:mm')}
                        </span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-label">Duration</span>
                        <span className="detail-value">
                          {schedule.route?.duration
                            ? `${Math.floor(schedule.route.duration / 60)}h ${schedule.route.duration % 60}m`
                            : 'N/A'}
                        </span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-label">Available Seats</span>
                        <span className="detail-value seats-count">
                          {schedule.availableSeats} / {schedule.totalSeats}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="schedule-actions">
                    <div className="price-display">
                      <span className="price-label">Price</span>
                      <span className="price-value">
                        ${schedule.price?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate(`/booking/${schedule.id}`)}
                      disabled={schedule.availableSeats === 0}
                    >
                      {schedule.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

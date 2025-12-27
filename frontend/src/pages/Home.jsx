import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { schedulesAPI } from '../services/api';
import { Button, Card, Input, Loading, Alert } from '../components/ui';
import { format } from 'date-fns';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDestination, setSearchDestination] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await schedulesAPI.getAll({ limit: 6 });
      setSchedules(response.data.schedules || response.data);
    } catch (err) {
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchOrigin) params.set('origin', searchOrigin);
    if (searchDestination) params.set('destination', searchDestination);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Book Your Bus Ticket 🚀
            </h1>
            <p className="hero-subtitle">
              Fast, reliable, and affordable bus travel across the country
            </p>

            <Card className="search-card">
              <div className="search-form">
                <Input
                  placeholder="From (e.g., New York)"
                  value={searchOrigin}
                  onChange={(e) => setSearchOrigin(e.target.value)}
                  fullWidth={false}
                  className="search-input"
                />
                <Input
                  placeholder="To (e.g., Boston)"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  fullWidth={false}
                  className="search-input"
                />
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSearch}
                  className="search-button"
                >
                  Search
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="schedules-section">
        <div className="container">
          <div className="section-header">
            <h2>Popular Routes ✨</h2>
            <p>Check out our most popular bus routes</p>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          {loading ? (
            <Loading text="Loading schedules..." />
          ) : (
            <div className="schedules-grid">
              {schedules.slice(0, 6).map((schedule) => (
                <Card key={schedule.id} className="schedule-card" hover>
                  <div className="schedule-route">
                    <h3>{schedule.route?.name || 'Route'}</h3>
                    <div className="route-details">
                      <span className="route-point">{schedule.route?.origin}</span>
                      <span className="route-arrow">→</span>
                      <span className="route-point">{schedule.route?.destination}</span>
                    </div>
                  </div>

                  <div className="schedule-info">
                    <div className="info-item">
                      <span className="info-label">Departure:</span>
                      <span className="info-value">
                        {format(new Date(schedule.departureTime), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Duration:</span>
                      <span className="info-value">
                        {schedule.route?.duration ? `${Math.floor(schedule.route.duration / 60)}h ${schedule.route.duration % 60}m` : 'N/A'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Available Seats:</span>
                      <span className="info-value">{schedule.availableSeats}</span>
                    </div>
                  </div>

                  <div className="schedule-footer">
                    <div className="price">
                      ${schedule.price?.toFixed(2) || '0.00'}
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/booking/${schedule.id}`)}
                    >
                      Book Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="view-all-container">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/search')}
            >
              View All Routes
            </Button>
          </div>
        </div>
      </section>

      {user && (
        <section className="quick-actions-section">
          <div className="container">
            <div className="quick-actions-grid">
              <Card className="action-card" hover>
                <h3>My Bookings</h3>
                <p>View and manage your bookings</p>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/my-bookings')}
                >
                  View Bookings
                </Button>
              </Card>

              <Card className="action-card" hover>
                <h3>Profile</h3>
                <p>Update your account information</p>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/profile')}
                >
                  Edit Profile
                </Button>
              </Card>

              {isAdmin && (
                <Card className="action-card" hover>
                  <h3>Admin Panel</h3>
                  <p>Manage routes and schedules</p>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/admin/routes')}
                  >
                    Go to Admin
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

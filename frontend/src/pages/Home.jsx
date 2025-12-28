import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { providersAPI } from '../services/api';
import { Button, Card, Loading, Alert, EmergencyButton, ProviderCard } from '../components/ui';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);

  useEffect(() => {
    fetchProviders();
    initMap();
  }, []);

  const initMap = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          loadGoogleMap(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a central location
          const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York
          setUserLocation(defaultLocation);
          loadGoogleMap(defaultLocation);
        }
      );
    }
  };

  const loadGoogleMap = (center) => {
    if (window.google && mapRef.current && !googleMapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      // Add user location marker
      new window.google.maps.Marker({
        position: center,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#f59e0b',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        title: 'Your Location',
      });

      googleMapRef.current = map;
    }
  };

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await providersAPI.getAll({ limit: 6 });
      const providerData = response.data.schedules || response.data;
      // Transform schedule data to provider format
      const transformedProviders = providerData.map((schedule) => ({
        id: schedule.id,
        name: schedule.route?.name || 'Service Provider',
        serviceType: 'General Help',
        distance: schedule.route?.distance || Math.random() * 5 + 1,
        availability: schedule.status === 'SCHEDULED',
        rating: 4.5 + Math.random() * 0.5,
        pricePerHour: schedule.price || 25,
        location: {
          lat: schedule.route?.originLat || 40.7128,
          lng: schedule.route?.originLng || -74.0060,
        },
        description: `Professional service provider available in your area`,
        isAvailable: schedule.availableSeats > 0,
      }));
      setProviders(transformedProviders);

      // Add provider markers to map
      if (googleMapRef.current) {
        transformedProviders.forEach((provider) => {
          new window.google.maps.Marker({
            position: provider.location,
            map: googleMapRef.current,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
                  <path d="M15 0C6.7 0 0 6.7 0 15c0 12 15 25 15 25s15-13 15-25c0-8.3-6.7-15-15-15z" fill="${provider.isAvailable ? '#10b981' : '#9ca3af'}"/>
                  <circle cx="15" cy="15" r="8" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(30, 40),
            },
            title: provider.name,
          });
        });
      }
    } catch (err) {
      setError('Failed to load service providers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergency = async () => {
    setEmergencyLoading(true);
    try {
      // Find closest available provider
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate search
      
      const availableProviders = providers.filter((p) => p.isAvailable);
      if (availableProviders.length > 0) {
        // Sort by distance and get closest
        const closest = availableProviders.sort((a, b) => a.distance - b.distance)[0];
        navigate(`/booking/${closest.id}?emergency=true`);
      } else {
        setError('No providers available at the moment. Please try again.');
      }
    } catch (err) {
      setError('Failed to process emergency request');
    } finally {
      setEmergencyLoading(false);
    }
  };

  const handleBookProvider = (provider) => {
    navigate(`/booking/${provider.id}`);
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Find Help Near You 🙂
            </h1>
            <p className="hero-subtitle">
              Connect with trusted service providers in your area, instantly
            </p>

            <div className="emergency-container">
              <EmergencyButton
                onClick={handleEmergency}
                loading={emergencyLoading}
                disabled={providers.filter((p) => p.isAvailable).length === 0}
              />
              <p className="emergency-hint">
                Instantly connects you with the nearest available provider
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="map-section">
        <div className="container">
          <Card className="map-card">
            <h2 className="map-title">Service Providers Near You</h2>
            <div ref={mapRef} className="map-container" />
          </Card>
        </div>
      </section>

      <section className="providers-section">
        <div className="container">
          <div className="section-header">
            <h2>Available Service Providers ✨</h2>
            <p>Browse and book trusted professionals in your area</p>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          {loading ? (
            <Loading text="Loading service providers..." />
          ) : (
            <div className="providers-grid">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onBook={handleBookProvider}
                />
              ))}
            </div>
          )}

          <div className="view-all-container">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/search')}
            >
              View All Providers
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
                <p>View and manage your service bookings</p>
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
                  <p>Manage service providers</p>
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

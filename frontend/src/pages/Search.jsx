import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { providersAPI } from '../services/api';
import { Button, Card, Input, Loading, Alert, ProviderCard, Select } from '../components/ui';
import './Search.css';

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    serviceType: searchParams.get('serviceType') || '',
    location: searchParams.get('location') || '',
    availability: searchParams.get('availability') || 'all'
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.location) params.origin = filters.location;

      const response = await providersAPI.search(params);
      const providerData = response.data.schedules || response.data || [];
      
      // Transform schedule data to provider format
      let transformedProviders = providerData.map((schedule) => ({
        id: schedule.id,
        name: schedule.route?.name || `Provider ${schedule.busNumber || ''}`,
        serviceType: filters.serviceType || 'General Help',
        distance: schedule.route?.distance || 2.5,
        availability: schedule.status === 'SCHEDULED',
        rating: 4.5,
        pricePerHour: schedule.price || 25,
        location: {
          lat: schedule.route?.originLat || 40.7128,
          lng: schedule.route?.originLng || -74.0060,
        },
        description: `Professional ${filters.serviceType || 'service'} provider available in your area`,
        isAvailable: schedule.availableSeats > 0,
      }));

      // Apply availability filter
      if (filters.availability === 'available') {
        transformedProviders = transformedProviders.filter(p => p.isAvailable);
      }

      setProviders(transformedProviders);
    } catch (err) {
      setError('Failed to load service providers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProviders();
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  const handleBookProvider = (provider) => {
    navigate(`/booking/${provider.id}`);
  };

  return (
    <div className="search-container">
      <div className="container">
        <div className="search-header">
          <h1>Find Service Providers 🔍</h1>
          <p>Browse and connect with professionals near you</p>
        </div>

        <Card className="search-filters-card">
          <div className="search-filters">
            <Input
              label="Location"
              placeholder="Enter your location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              fullWidth={false}
            />
            <Input
              label="Service Type"
              placeholder="e.g., Plumbing, Cleaning"
              value={filters.serviceType}
              onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              fullWidth={false}
            />
            <Select
              label="Availability"
              value={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              options={[
                { value: 'all', label: 'All Providers' },
                { value: 'available', label: 'Available Only' }
              ]}
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
          <Loading text="Searching for service providers..." />
        ) : providers.length === 0 ? (
          <Card className="no-results-card">
            <div className="no-results">
              <h3>No providers found</h3>
              <p>Try adjusting your search criteria or check back later</p>
            </div>
          </Card>
        ) : (
          <div className="search-results">
            <div className="results-header">
              <h2>Available Service Providers</h2>
              <span className="results-count">{providers.length} providers found</span>
            </div>

            <div className="providers-list">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onBook={handleBookProvider}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

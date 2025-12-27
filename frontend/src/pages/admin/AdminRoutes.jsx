import { useState, useEffect, useRef } from 'react';
import { routesAPI } from '../../services/api';

const AdminRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    distance: '',
    basePrice: '',
    originLat: '',
    originLng: '',
    destinationLat: '',
    destinationLng: ''
  });
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    loadRoutes();
    initMap();
  }, []);

  const initMap = () => {
    if (window.google && mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 },
        zoom: 10
      });
      setMap(newMap);
    }
  };

  useEffect(() => {
    if (map && formData.originLat && formData.originLng) {
      // Clear previous markers
      markers.forEach(marker => marker.setMap(null));

      const newMarkers = [];
      
      // Add origin marker
      const originMarker = new window.google.maps.Marker({
        position: { lat: parseFloat(formData.originLat), lng: parseFloat(formData.originLng) },
        map: map,
        label: 'A',
        title: formData.origin
      });
      newMarkers.push(originMarker);

      // Add destination marker if exists
      if (formData.destinationLat && formData.destinationLng) {
        const destMarker = new window.google.maps.Marker({
          position: { lat: parseFloat(formData.destinationLat), lng: parseFloat(formData.destinationLng) },
          map: map,
          label: 'B',
          title: formData.destination
        });
        newMarkers.push(destMarker);

        // Fit bounds to show both markers
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(originMarker.getPosition());
        bounds.extend(destMarker.getPosition());
        map.fitBounds(bounds);
      } else {
        map.setCenter(originMarker.getPosition());
      }

      setMarkers(newMarkers);
    }
  }, [map, formData.originLat, formData.originLng, formData.destinationLat, formData.destinationLng]);

  const loadRoutes = async () => {
    try {
      const response = await routesAPI.getAll();
      setRoutes(response.data.routes || []);
    } catch (err) {
      setError('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = {
        ...formData,
        distance: parseFloat(formData.distance),
        basePrice: parseFloat(formData.basePrice),
        originLat: parseFloat(formData.originLat),
        originLng: parseFloat(formData.originLng),
        destinationLat: parseFloat(formData.destinationLat),
        destinationLng: parseFloat(formData.destinationLng)
      };

      if (editingRoute) {
        await routesAPI.update(editingRoute.id, data);
      } else {
        await routesAPI.create(data);
      }

      setShowForm(false);
      setEditingRoute(null);
      setFormData({
        origin: '',
        destination: '',
        distance: '',
        basePrice: '',
        originLat: '',
        originLng: '',
        destinationLat: '',
        destinationLng: ''
      });
      await loadRoutes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save route');
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      origin: route.origin,
      destination: route.destination,
      distance: route.distance.toString(),
      basePrice: route.basePrice.toString(),
      originLat: route.originLat.toString(),
      originLng: route.originLng.toString(),
      destinationLat: route.destinationLat.toString(),
      destinationLng: route.destinationLng.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this route?')) {
      return;
    }

    try {
      await routesAPI.delete(id);
      await loadRoutes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete route');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRoute(null);
    setFormData({
      origin: '',
      destination: '',
      distance: '',
      basePrice: '',
      originLat: '',
      originLng: '',
      destinationLat: '',
      destinationLng: ''
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Manage Routes</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Add New Route
          </button>
        )}
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>{editingRoute ? 'Edit Route' : 'Add New Route'}</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Origin</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  required
                  placeholder="e.g., New York"
                />
              </div>

              <div className="form-group">
                <label>Destination</label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Boston"
                />
              </div>

              <div className="form-group">
                <label>Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Base Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Origin Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="originLat"
                  value={formData.originLat}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 40.7128"
                />
              </div>

              <div className="form-group">
                <label>Origin Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="originLng"
                  value={formData.originLng}
                  onChange={handleChange}
                  required
                  placeholder="e.g., -74.0060"
                />
              </div>

              <div className="form-group">
                <label>Destination Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="destinationLat"
                  value={formData.destinationLat}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 42.3601"
                />
              </div>

              <div className="form-group">
                <label>Destination Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="destinationLng"
                  value={formData.destinationLng}
                  onChange={handleChange}
                  required
                  placeholder="e.g., -71.0589"
                />
              </div>
            </div>

            <div ref={mapRef} className="map-container" style={{ marginBottom: '20px' }}></div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingRoute ? 'Update Route' : 'Create Route'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-2">
        {routes.map((route) => (
          <div key={route.id} className="card">
            <h4 style={{ marginBottom: '10px' }}>
              {route.origin} → {route.destination}
            </h4>
            <div style={{ marginBottom: '15px' }}>
              <div><strong>Distance:</strong> {route.distance} km</div>
              <div><strong>Base Price:</strong> ${route.basePrice}</div>
              <div><strong>Origin:</strong> {route.originLat}, {route.originLng}</div>
              <div><strong>Destination:</strong> {route.destinationLat}, {route.destinationLng}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleEdit(route)} className="btn btn-primary" style={{ flex: 1 }}>
                Edit
              </button>
              <button onClick={() => handleDelete(route.id)} className="btn btn-danger" style={{ flex: 1 }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {routes.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>No routes found. Add your first route above.</p>
        </div>
      )}
    </div>
  );
};

export default AdminRoutes;

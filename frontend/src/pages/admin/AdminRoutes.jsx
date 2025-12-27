import React, { useState, useEffect } from 'react';
import { routesAPI } from '../../services/api';
import { Button, Card, Input, Loading, Alert } from '../../components/ui';
import './AdminRoutes.css';

const AdminRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    destination: '',
    originLat: '',
    originLng: '',
    destinationLat: '',
    destinationLng: '',
    distance: '',
    duration: '',
    basePrice: ''
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await routesAPI.getAll();
      setRoutes(response.data.routes || response.data || []);
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
      const routeData = {
        ...formData,
        originLat: parseFloat(formData.originLat),
        originLng: parseFloat(formData.originLng),
        destinationLat: parseFloat(formData.destinationLat),
        destinationLng: parseFloat(formData.destinationLng),
        distance: parseFloat(formData.distance),
        duration: parseInt(formData.duration),
        basePrice: parseFloat(formData.basePrice)
      };

      if (editingRoute) {
        await routesAPI.update(editingRoute.id, routeData);
        setSuccessMessage('Route updated successfully! ✨');
      } else {
        await routesAPI.create(routeData);
        setSuccessMessage('Route created successfully! 🚀');
      }

      resetForm();
      fetchRoutes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save route');
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      origin: route.origin,
      destination: route.destination,
      originLat: route.originLat.toString(),
      originLng: route.originLng.toString(),
      destinationLat: route.destinationLat.toString(),
      destinationLng: route.destinationLng.toString(),
      distance: route.distance.toString(),
      duration: route.duration.toString(),
      basePrice: route.basePrice.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) {
      return;
    }

    try {
      await routesAPI.delete(routeId);
      setSuccessMessage('Route deleted successfully');
      fetchRoutes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete route');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      origin: '',
      destination: '',
      originLat: '',
      originLng: '',
      destinationLat: '',
      destinationLng: '',
      distance: '',
      duration: '',
      basePrice: ''
    });
    setEditingRoute(null);
    setShowForm(false);
  };

  if (loading) {
    return <Loading text="Loading routes..." />;
  }

  return (
    <div className="admin-routes-container">
      <div className="container">
        <div className="page-header">
          <h1>Manage Routes 🗺️</h1>
          <Button
            variant="primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add New Route'}
          </Button>
        </div>

        {successMessage && (
          <Alert type="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {showForm && (
          <Card className="form-card">
            <h3>{editingRoute ? 'Edit Route' : 'Create New Route'}</h3>
            <form onSubmit={handleSubmit} className="admin-form">
              <Input
                label="Route Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., New York to Boston"
                required
              />

              <div className="form-row">
                <Input
                  label="Origin City"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="New York, NY"
                  required
                />
                <Input
                  label="Destination City"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Boston, MA"
                  required
                />
              </div>

              <div className="form-row">
                <Input
                  label="Origin Latitude"
                  name="originLat"
                  type="number"
                  step="any"
                  value={formData.originLat}
                  onChange={handleChange}
                  placeholder="40.7128"
                  required
                />
                <Input
                  label="Origin Longitude"
                  name="originLng"
                  type="number"
                  step="any"
                  value={formData.originLng}
                  onChange={handleChange}
                  placeholder="-74.0060"
                  required
                />
              </div>

              <div className="form-row">
                <Input
                  label="Destination Latitude"
                  name="destinationLat"
                  type="number"
                  step="any"
                  value={formData.destinationLat}
                  onChange={handleChange}
                  placeholder="42.3601"
                  required
                />
                <Input
                  label="Destination Longitude"
                  name="destinationLng"
                  type="number"
                  step="any"
                  value={formData.destinationLng}
                  onChange={handleChange}
                  placeholder="-71.0589"
                  required
                />
              </div>

              <div className="form-row">
                <Input
                  label="Distance (miles)"
                  name="distance"
                  type="number"
                  step="any"
                  value={formData.distance}
                  onChange={handleChange}
                  placeholder="215.3"
                  required
                />
                <Input
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="240"
                  required
                />
                <Input
                  label="Base Price ($)"
                  name="basePrice"
                  type="number"
                  step="any"
                  value={formData.basePrice}
                  onChange={handleChange}
                  placeholder="45.00"
                  required
                />
              </div>

              <div className="form-actions">
                <Button type="submit" variant="primary">
                  {editingRoute ? 'Update Route' : 'Create Route'}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="routes-grid">
          {routes.map((route) => (
            <Card key={route.id} className="route-card" hover>
              <h3>{route.name}</h3>
              <div className="route-info">
                <div className="route-path">
                  <span>{route.origin}</span>
                  <span className="arrow">→</span>
                  <span>{route.destination}</span>
                </div>
                <div className="route-details">
                  <div className="detail">
                    <span className="label">Distance:</span>
                    <span className="value">{route.distance} mi</span>
                  </div>
                  <div className="detail">
                    <span className="label">Duration:</span>
                    <span className="value">{Math.floor(route.duration / 60)}h {route.duration % 60}m</span>
                  </div>
                  <div className="detail">
                    <span className="label">Base Price:</span>
                    <span className="value price">${route.basePrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="route-actions">
                <Button variant="secondary" size="sm" onClick={() => handleEdit(route)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(route.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminRoutes;

import React, { useState, useEffect } from 'react';
import { schedulesAPI, routesAPI } from '../../services/api';
import { Button, Card, Input, Select, Loading, Alert } from '../../components/ui';
import { format } from 'date-fns';
import './AdminSchedules.css';

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    routeId: '',
    departureTime: '',
    arrivalTime: '',
    busNumber: '',
    totalSeats: '40',
    price: '',
    status: 'SCHEDULED'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, routesRes] = await Promise.all([
        schedulesAPI.getAll(),
        routesAPI.getAll()
      ]);
      setSchedules(schedulesRes.data.schedules || schedulesRes.data || []);
      setRoutes(routesRes.data.routes || routesRes.data || []);
    } catch (err) {
      setError('Failed to load data');
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
      const scheduleData = {
        ...formData,
        totalSeats: parseInt(formData.totalSeats),
        availableSeats: parseInt(formData.totalSeats),
        price: parseFloat(formData.price),
        departureTime: new Date(formData.departureTime).toISOString(),
        arrivalTime: new Date(formData.arrivalTime).toISOString()
      };

      if (editingSchedule) {
        await schedulesAPI.update(editingSchedule.id, scheduleData);
        setSuccessMessage('Schedule updated successfully! ✨');
      } else {
        await schedulesAPI.create(scheduleData);
        setSuccessMessage('Schedule created successfully! 🚀');
      }

      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      routeId: schedule.routeId,
      departureTime: format(new Date(schedule.departureTime), "yyyy-MM-dd'T'HH:mm"),
      arrivalTime: format(new Date(schedule.arrivalTime), "yyyy-MM-dd'T'HH:mm"),
      busNumber: schedule.busNumber,
      totalSeats: schedule.totalSeats.toString(),
      price: schedule.price.toString(),
      status: schedule.status
    });
    setShowForm(true);
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      await schedulesAPI.delete(scheduleId);
      setSuccessMessage('Schedule deleted successfully');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete schedule');
    }
  };

  const resetForm = () => {
    setFormData({
      routeId: '',
      departureTime: '',
      arrivalTime: '',
      busNumber: '',
      totalSeats: '40',
      price: '',
      status: 'SCHEDULED'
    });
    setEditingSchedule(null);
    setShowForm(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      SCHEDULED: { text: 'Scheduled', className: 'status-scheduled' },
      CANCELLED: { text: 'Cancelled', className: 'status-cancelled' },
      COMPLETED: { text: 'Completed', className: 'status-completed' }
    };
    return badges[status] || { text: status, className: 'status-default' };
  };

  if (loading) {
    return <Loading text="Loading schedules..." />;
  }

  return (
    <div className="admin-schedules-container">
      <div className="container">
        <div className="page-header">
          <h1>Manage Schedules 📅</h1>
          <Button
            variant="primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add New Schedule'}
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
            <h3>{editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}</h3>
            <form onSubmit={handleSubmit} className="admin-form">
              <Select
                label="Route"
                name="routeId"
                value={formData.routeId}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select a route' },
                  ...routes.map(route => ({
                    value: route.id,
                    label: route.name
                  }))
                ]}
                required
              />

              <div className="form-row">
                <Input
                  label="Departure Time"
                  name="departureTime"
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Arrival Time"
                  name="arrivalTime"
                  type="datetime-local"
                  value={formData.arrivalTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <Input
                  label="Bus Number"
                  name="busNumber"
                  value={formData.busNumber}
                  onChange={handleChange}
                  placeholder="BUS-001"
                  required
                />
                <Input
                  label="Total Seats"
                  name="totalSeats"
                  type="number"
                  value={formData.totalSeats}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <Input
                  label="Price ($)"
                  name="price"
                  type="number"
                  step="any"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="45.00"
                  required
                />
              </div>

              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'SCHEDULED', label: 'Scheduled' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                  { value: 'COMPLETED', label: 'Completed' }
                ]}
                required
              />

              <div className="form-actions">
                <Button type="submit" variant="primary">
                  {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="schedules-list">
          {schedules.map((schedule) => {
            const statusBadge = getStatusBadge(schedule.status);
            return (
              <Card key={schedule.id} className="schedule-card" hover>
                <div className="schedule-header">
                  <div>
                    <h3>{schedule.route?.name || 'Route'}</h3>
                    <div className="route-path">
                      <span>{schedule.route?.origin}</span>
                      <span className="arrow">→</span>
                      <span>{schedule.route?.destination}</span>
                    </div>
                  </div>
                  <span className={`status-badge ${statusBadge.className}`}>
                    {statusBadge.text}
                  </span>
                </div>

                <div className="schedule-info">
                  <div className="info-row">
                    <div className="info-item">
                      <span className="label">Departure</span>
                      <span className="value">
                        {format(new Date(schedule.departureTime), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Arrival</span>
                      <span className="value">
                        {format(new Date(schedule.arrivalTime), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-item">
                      <span className="label">Bus Number</span>
                      <span className="value">{schedule.busNumber}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Seats</span>
                      <span className="value">
                        {schedule.availableSeats} / {schedule.totalSeats}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Price</span>
                      <span className="value price">${schedule.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="schedule-actions">
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(schedule)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(schedule.id)}>
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminSchedules;

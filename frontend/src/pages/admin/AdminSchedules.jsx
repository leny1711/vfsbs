import { useState, useEffect } from 'react';
import { schedulesAPI, routesAPI } from '../../services/api';
import { format } from 'date-fns';

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    routeId: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    totalSeats: '40',
    status: 'SCHEDULED'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [schedulesRes, routesRes] = await Promise.all([
        schedulesAPI.getAll(),
        routesAPI.getAll()
      ]);
      setSchedules(schedulesRes.data.schedules || []);
      setRoutes(routesRes.data.routes || []);
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
      const data = {
        routeId: parseInt(formData.routeId),
        departureTime: new Date(formData.departureTime).toISOString(),
        arrivalTime: new Date(formData.arrivalTime).toISOString(),
        price: parseFloat(formData.price),
        totalSeats: parseInt(formData.totalSeats),
        status: formData.status
      };

      if (editingSchedule) {
        await schedulesAPI.update(editingSchedule.id, data);
      } else {
        await schedulesAPI.create(data);
      }

      setShowForm(false);
      setEditingSchedule(null);
      setFormData({
        routeId: '',
        departureTime: '',
        arrivalTime: '',
        price: '',
        totalSeats: '40',
        status: 'SCHEDULED'
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      routeId: schedule.routeId.toString(),
      departureTime: schedule.departureTime ? new Date(schedule.departureTime).toISOString().slice(0, 16) : '',
      arrivalTime: schedule.arrivalTime ? new Date(schedule.arrivalTime).toISOString().slice(0, 16) : '',
      price: schedule.price.toString(),
      totalSeats: schedule.totalSeats.toString(),
      status: schedule.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to cancel this schedule?')) {
      return;
    }

    try {
      await schedulesAPI.delete(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel schedule');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSchedule(null);
    setFormData({
      routeId: '',
      departureTime: '',
      arrivalTime: '',
      price: '',
      totalSeats: '40',
      status: 'SCHEDULED'
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Manage Schedules</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Add New Schedule
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
          <h3 style={{ marginBottom: '20px' }}>{editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Route</label>
                <select
                  name="routeId"
                  value={formData.routeId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a route</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.origin} → {route.destination}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Departure Time</label>
                <input
                  type="datetime-local"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Arrival Time</label>
                <input
                  type="datetime-local"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Seats</label>
                <input
                  type="number"
                  name="totalSeats"
                  value={formData.totalSeats}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-2">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '18px' }}>
                {schedule.route?.origin} → {schedule.route?.destination}
              </h4>
              <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: schedule.status === 'SCHEDULED' ? '#d4edda' : 
                               schedule.status === 'CANCELLED' ? '#f8d7da' : '#fff3cd',
                color: schedule.status === 'SCHEDULED' ? '#155724' : 
                       schedule.status === 'CANCELLED' ? '#721c24' : '#856404'
              }}>
                {schedule.status}
              </span>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ marginBottom: '5px' }}>
                <strong>Departure:</strong><br/>
                {format(new Date(schedule.departureTime), 'MMM dd, yyyy HH:mm')}
              </div>
              <div style={{ marginBottom: '5px' }}>
                <strong>Arrival:</strong><br/>
                {format(new Date(schedule.arrivalTime), 'MMM dd, yyyy HH:mm')}
              </div>
              <div style={{ marginBottom: '5px' }}>
                <strong>Price:</strong> ${schedule.price}
              </div>
              <div style={{ marginBottom: '5px' }}>
                <strong>Seats:</strong> {schedule.availableSeats} / {schedule.totalSeats}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleEdit(schedule)} className="btn btn-primary" style={{ flex: 1 }}>
                Edit
              </button>
              <button onClick={() => handleDelete(schedule.id)} className="btn btn-danger" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {schedules.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>No schedules found. Add your first schedule above.</p>
        </div>
      )}
    </div>
  );
};

export default AdminSchedules;

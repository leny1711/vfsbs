import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { schedulesAPI } from '../services/api';
import { format } from 'date-fns';

const Search = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await schedulesAPI.search({
        origin,
        destination,
        date
      });
      setSchedules(response.data.schedules || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search schedules');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (scheduleId) => {
    navigate(`/booking/${scheduleId}`);
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Search Bus Schedules</h2>
        
        <form onSubmit={handleSearch}>
          <div className="grid grid-3">
            <div className="form-group">
              <label>Origin</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
                placeholder="e.g., New York"
              />
            </div>

            <div className="form-group">
              <label>Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                placeholder="e.g., Boston"
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
          {error}
        </div>
      )}

      {schedules.length > 0 && (
        <div>
          <h3 style={{ margin: '30px 0 20px' }}>Available Schedules ({schedules.length})</h3>
          <div className="grid grid-2">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <h4 style={{ marginBottom: '5px', fontSize: '18px' }}>
                      {schedule.route?.origin} → {schedule.route?.destination}
                    </h4>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      Distance: {schedule.route?.distance} km
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                      ${schedule.price}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                  <div>
                    <strong>Departure:</strong><br/>
                    {format(new Date(schedule.departureTime), 'MMM dd, yyyy HH:mm')}
                  </div>
                  <div>
                    <strong>Arrival:</strong><br/>
                    {format(new Date(schedule.arrivalTime), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <strong>Available Seats:</strong> {schedule.availableSeats} / {schedule.totalSeats}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleBook(schedule.id)}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={schedule.availableSeats === 0}
                  >
                    {schedule.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && schedules.length === 0 && origin && destination && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>
            No schedules found for the selected route and date.
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;

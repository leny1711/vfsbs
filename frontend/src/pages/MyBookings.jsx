import { useState, useEffect } from 'react';
import { userAPI, bookingsAPI } from '../services/api';
import { format } from 'date-fns';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await userAPI.getBookings();
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancelling(bookingId);
    try {
      await bookingsAPI.cancel(bookingId);
      await loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h2 style={{ marginBottom: '20px' }}>My Bookings</h2>

      {error && (
        <div className="card" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>
            You don't have any bookings yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-2">
          {bookings.map((booking) => (
            <div key={booking.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <h4 style={{ fontSize: '18px' }}>
                  {booking.schedule?.route?.origin} → {booking.schedule?.route?.destination}
                </h4>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: booking.status === 'CONFIRMED' ? '#d4edda' : 
                                 booking.status === 'CANCELLED' ? '#f8d7da' : '#fff3cd',
                  color: booking.status === 'CONFIRMED' ? '#155724' : 
                         booking.status === 'CANCELLED' ? '#721c24' : '#856404'
                }}>
                  {booking.status}
                </span>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Booking ID:</strong> {booking.id}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Passenger:</strong> {booking.passengerName}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Phone:</strong> {booking.passengerPhone}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Seats:</strong> {booking.seats}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Total Price:</strong> ${booking.totalPrice}
                </div>
              </div>

              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Departure:</strong><br/>
                  {booking.schedule?.departureTime && format(new Date(booking.schedule.departureTime), 'MMM dd, yyyy HH:mm')}
                </div>
                <div>
                  <strong>Arrival:</strong><br/>
                  {booking.schedule?.arrivalTime && format(new Date(booking.schedule.arrivalTime), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>

              {booking.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="btn btn-danger"
                  style={{ width: '100%' }}
                  disabled={cancelling === booking.id}
                >
                  {cancelling === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;

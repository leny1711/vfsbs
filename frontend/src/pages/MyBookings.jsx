import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { userAPI, bookingsAPI } from '../services/api';
import { Button, Card, Loading, Alert } from '../components/ui';
import { format } from 'date-fns';
import './MyBookings.css';

const MyBookings = () => {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getBookings();
      setBookings(response.data.bookings || response.data || []);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingsAPI.cancel(bookingId);
      setSuccessMessage('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      CONFIRMED: { text: 'Confirmed', className: 'status-confirmed' },
      CANCELLED: { text: 'Cancelled', className: 'status-cancelled' },
      PENDING: { text: 'Pending', className: 'status-pending' }
    };
    return badges[status] || { text: status, className: 'status-default' };
  };

  if (loading) {
    return <Loading text="Loading your bookings..." />;
  }

  return (
    <div className="my-bookings-container">
      <div className="container">
        <div className="page-header">
          <h1>My Service Bookings 🙂</h1>
          <p>View and manage your service provider bookings</p>
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

        {bookings.length === 0 ? (
          <Card className="no-bookings-card">
            <div className="no-bookings">
              <h3>No bookings yet</h3>
              <p>Start by finding service providers near you</p>
              <Button variant="primary" onClick={() => window.location.href = '/search'}>
                Find Providers
              </Button>
            </div>
          </Card>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => {
              const statusBadge = getStatusBadge(booking.status);
              return (
                <Card key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-route">
                      <h3>{booking.schedule?.route?.name || 'Route'}</h3>
                      <div className="route-path">
                        <span>{booking.schedule?.route?.origin}</span>
                        <span className="arrow">→</span>
                        <span>{booking.schedule?.route?.destination}</span>
                      </div>
                    </div>
                    <span className={`status-badge ${statusBadge.className}`}>
                      {statusBadge.text}
                    </span>
                  </div>

                  <div className="booking-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="label">Booking ID</span>
                        <span className="value">{booking.id.slice(0, 8)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Seats</span>
                        <span className="value">{booking.numSeats}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Total Price</span>
                        <span className="value price">${booking.totalPrice?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="label">Departure</span>
                        <span className="value">
                          {format(new Date(booking.schedule?.departureTime), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Bus Number</span>
                        <span className="value">{booking.schedule?.busNumber}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Booked On</span>
                        <span className="value">
                          {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {booking.status === 'CONFIRMED' && (
                    <div className="booking-actions">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

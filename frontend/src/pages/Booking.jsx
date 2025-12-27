import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { schedulesAPI, bookingsAPI, paymentsAPI } from '../services/api';
import { Button, Card, Loading, Alert, Input } from '../components/ui';
import { format } from 'date-fns';
import './Booking.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ schedule, numSeats, totalPrice, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const intentResponse = await paymentsAPI.createIntent({
        scheduleId: schedule.id,
        numSeats,
        amount: totalPrice * 100
      });

      const clientSecret = intentResponse.data.clientSecret;

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        const bookingResponse = await bookingsAPI.create({
          scheduleId: schedule.id,
          numSeats,
          paymentIntentId: paymentIntent.id
        });

        await paymentsAPI.confirm({
          paymentIntentId: paymentIntent.id,
          bookingId: bookingResponse.data.booking?.id || bookingResponse.data.id
        });

        onSuccess(bookingResponse.data.booking || bookingResponse.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      {error && <Alert type="error">{error}</Alert>}

      <div className="card-element-container">
        <label className="card-element-label">Card Details</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#171717',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                '::placeholder': {
                  color: '#737373',
                },
              },
            },
          }}
          className="card-element"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={!stripe || processing}
      >
        {processing ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
      </Button>

      <p className="payment-note">
        🔒 Your payment is secure and encrypted
      </p>
    </form>
  );
};

const Booking = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [numSeats, setNumSeats] = useState(1);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, [scheduleId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await schedulesAPI.getById(scheduleId);
      setSchedule(response.data.schedule || response.data);
    } catch (err) {
      setError('Failed to load schedule details');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToPayment = () => {
    if (numSeats < 1 || numSeats > schedule.availableSeats) {
      setError(`Please select between 1 and ${schedule.availableSeats} seats`);
      return;
    }
    setError('');
    setShowPayment(true);
  };

  const handlePaymentSuccess = (booking) => {
    navigate('/my-bookings', {
      state: { message: 'Booking successful! 🎉' }
    });
  };

  if (loading) {
    return <Loading text="Loading booking details..." />;
  }

  if (error && !schedule) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <Alert type="error">{error}</Alert>
        <Button onClick={() => navigate('/search')}>Back to Search</Button>
      </div>
    );
  }

  const totalPrice = schedule ? schedule.price * numSeats : 0;

  return (
    <div className="booking-container">
      <div className="container">
        <div className="booking-wrapper">
          <div className="booking-main">
            <h1>Complete Your Booking 🚀</h1>

            <Card className="schedule-summary-card">
              <h3>Trip Details</h3>
              <div className="trip-info">
                <div className="trip-route">
                  <h4>{schedule.route?.name}</h4>
                  <div className="route-line">
                    <span className="route-location">{schedule.route?.origin}</span>
                    <span className="route-separator">→</span>
                    <span className="route-location">{schedule.route?.destination}</span>
                  </div>
                </div>

                <div className="trip-details-grid">
                  <div className="trip-detail">
                    <span className="detail-label">Departure</span>
                    <span className="detail-value">
                      {format(new Date(schedule.departureTime), 'MMM dd, yyyy')}
                    </span>
                    <span className="detail-time">
                      {format(new Date(schedule.departureTime), 'HH:mm')}
                    </span>
                  </div>

                  <div className="trip-detail">
                    <span className="detail-label">Arrival</span>
                    <span className="detail-value">
                      {format(new Date(schedule.arrivalTime), 'MMM dd, yyyy')}
                    </span>
                    <span className="detail-time">
                      {format(new Date(schedule.arrivalTime), 'HH:mm')}
                    </span>
                  </div>

                  <div className="trip-detail">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">
                      {schedule.route?.duration
                        ? `${Math.floor(schedule.route.duration / 60)}h ${schedule.route.duration % 60}m`
                        : 'N/A'}
                    </span>
                  </div>

                  <div className="trip-detail">
                    <span className="detail-label">Bus Number</span>
                    <span className="detail-value">{schedule.busNumber}</span>
                  </div>
                </div>
              </div>
            </Card>

            {!showPayment ? (
              <Card>
                <h3>Select Number of Seats</h3>
                {error && <Alert type="error">{error}</Alert>}
                <Input
                  label="Number of Seats"
                  type="number"
                  min="1"
                  max={schedule.availableSeats}
                  value={numSeats}
                  onChange={(e) => setNumSeats(parseInt(e.target.value) || 1)}
                />
                <p className="available-seats-info">
                  {schedule.availableSeats} seats available
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleContinueToPayment}
                >
                  Continue to Payment
                </Button>
              </Card>
            ) : (
              <Card>
                <h3>Payment Details</h3>
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    schedule={schedule}
                    numSeats={numSeats}
                    totalPrice={totalPrice}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPayment(false)}
                  style={{ marginTop: '1rem' }}
                >
                  ← Back to Seat Selection
                </Button>
              </Card>
            )}
          </div>

          <div className="booking-sidebar">
            <Card className="price-summary-card">
              <h3>Price Summary</h3>
              <div className="price-breakdown">
                <div className="price-item">
                  <span>Price per seat</span>
                  <span>${schedule.price.toFixed(2)}</span>
                </div>
                <div className="price-item">
                  <span>Number of seats</span>
                  <span>×{numSeats}</span>
                </div>
                <div className="price-divider"></div>
                <div className="price-item price-total">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;

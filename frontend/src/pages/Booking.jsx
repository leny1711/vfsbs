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
  const searchParams = new URLSearchParams(window.location.search);
  const isEmergency = searchParams.get('emergency') === 'true';
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [numSeats, setNumSeats] = useState(1);
  const [serviceHours, setServiceHours] = useState(1);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, [scheduleId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await schedulesAPI.getById(scheduleId);
      const scheduleData = response.data.schedule || response.data;
      setSchedule(scheduleData);
    } catch (err) {
      setError('Failed to load provider details');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToPayment = () => {
    if (serviceHours < 1) {
      setError('Please select at least 1 hour of service');
      return;
    }
    setError('');
    setShowPayment(true);
  };

  const handlePaymentSuccess = (booking) => {
    navigate('/my-bookings', {
      state: { message: isEmergency ? 'Emergency booking successful! Help is on the way! 🚨' : 'Booking successful! 🎉' }
    });
  };

  if (loading) {
    return <Loading text="Loading provider details..." />;
  }

  if (error && !schedule) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <Alert type="error">{error}</Alert>
        <Button onClick={() => navigate('/search')}>Back to Search</Button>
      </div>
    );
  }

  const pricePerHour = schedule?.price || 25;
  const totalPrice = pricePerHour * serviceHours;

  // Transform schedule data to provider format
  const provider = {
    id: schedule?.id,
    name: schedule?.route?.name || `Provider ${schedule?.busNumber || ''}`,
    serviceType: 'General Help',
    distance: schedule?.route?.distance || 2.5,
    rating: 4.5 + Math.random() * 0.5,
    pricePerHour: pricePerHour,
    description: 'Professional service provider available in your area',
  };

  return (
    <div className="booking-container">
      <div className="container">
        {isEmergency && (
          <Alert type="info">
            🚨 <strong>Emergency Mode:</strong> You're booking the nearest available provider for immediate assistance.
          </Alert>
        )}
        
        <div className="booking-wrapper">
          <div className="booking-main">
            <h1>{isEmergency ? 'Emergency Booking 🚨' : 'Complete Your Booking 🙂'}</h1>

            <Card className="schedule-summary-card">
              <h3>Provider Details</h3>
              <div className="trip-info">
                <div className="provider-header-booking">
                  <div className="provider-avatar-large">
                    {provider.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4>{provider.name}</h4>
                    <p className="provider-service-type">{provider.serviceType}</p>
                    <div className="provider-stats-inline">
                      <span>⭐ {provider.rating.toFixed(1)}</span>
                      <span>📍 {provider.distance.toFixed(1)} km away</span>
                    </div>
                  </div>
                </div>

                <p className="provider-description-booking">{provider.description}</p>
              </div>
            </Card>

            {!showPayment ? (
              <Card>
                <h3>Service Duration</h3>
                {error && <Alert type="error">{error}</Alert>}
                <Input
                  label="Hours of Service"
                  type="number"
                  min="1"
                  max="12"
                  value={serviceHours}
                  onChange={(e) => setServiceHours(parseInt(e.target.value) || 1)}
                />
                <p className="service-hours-info">
                  Select the estimated duration of service needed (1-12 hours)
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
                    numSeats={serviceHours}
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
                  ← Back to Duration Selection
                </Button>
              </Card>
            )}
          </div>

          <div className="booking-sidebar">
            <Card className="price-summary-card">
              <h3>Price Summary</h3>
              <div className="price-breakdown">
                <div className="price-item">
                  <span>Price per hour</span>
                  <span>${pricePerHour.toFixed(2)}</span>
                </div>
                <div className="price-item">
                  <span>Service duration</span>
                  <span>×{serviceHours}h</span>
                </div>
                <div className="price-divider"></div>
                <div className="price-item price-total">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              {isEmergency && (
                <div className="emergency-note">
                  <p>🚨 Priority service - provider will be dispatched immediately</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;

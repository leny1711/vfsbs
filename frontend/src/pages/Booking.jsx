import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { schedulesAPI, bookingsAPI, paymentsAPI } from '../services/api';
import { format } from 'date-fns';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const BookingForm = ({ schedule }) => {
  const [seats, setSeats] = useState(1);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const totalPrice = schedule.price * seats;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Create booking
      const bookingResponse = await bookingsAPI.create({
        scheduleId: schedule.id,
        seats,
        passengerName,
        passengerPhone,
        totalPrice
      });

      const booking = bookingResponse.data.booking;

      // Create payment intent
      const intentResponse = await paymentsAPI.createIntent({
        bookingId: booking.id
      });

      const { clientSecret } = intentResponse.data;

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      // Confirm payment on backend
      await paymentsAPI.confirm({
        paymentId: intentResponse.data.payment.id
      });

      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Number of Seats</label>
        <input
          type="number"
          value={seats}
          onChange={(e) => setSeats(parseInt(e.target.value))}
          min="1"
          max={schedule.availableSeats}
          required
        />
      </div>

      <div className="form-group">
        <label>Passenger Name</label>
        <input
          type="text"
          value={passengerName}
          onChange={(e) => setPassengerName(e.target.value)}
          required
          placeholder="Enter passenger name"
        />
      </div>

      <div className="form-group">
        <label>Passenger Phone</label>
        <input
          type="tel"
          value={passengerPhone}
          onChange={(e) => setPassengerPhone(e.target.value)}
          required
          placeholder="Enter passenger phone"
        />
      </div>

      <div className="card" style={{ backgroundColor: '#f8f9fa', marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>Booking Summary</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Price per seat:</span>
          <span>${schedule.price}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Number of seats:</span>
          <span>{seats}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
          <span>Total:</span>
          <span>${totalPrice}</span>
        </div>
      </div>

      <div className="form-group">
        <label>Payment Details</label>
        <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }} />
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}

      <button 
        type="submit" 
        className="btn btn-primary" 
        style={{ width: '100%' }}
        disabled={!stripe || processing}
      >
        {processing ? 'Processing...' : `Pay $${totalPrice}`}
      </button>

      <p style={{ marginTop: '15px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
        Test card: 4242 4242 4242 4242, any future date, any CVC
      </p>
    </form>
  );
};

const Booking = () => {
  const { scheduleId } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSchedule();
  }, [scheduleId]);

  const loadSchedule = async () => {
    try {
      const response = await schedulesAPI.getById(scheduleId);
      setSchedule(response.data.schedule);
    } catch (err) {
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error || !schedule) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>Schedule not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', maxWidth: '600px' }}>
      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Book Your Trip</h2>
        
        <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h4 style={{ marginBottom: '10px' }}>Trip Details</h4>
          <div style={{ marginBottom: '10px' }}>
            <strong>Route:</strong> {schedule.route?.origin} → {schedule.route?.destination}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Departure:</strong> {format(new Date(schedule.departureTime), 'MMM dd, yyyy HH:mm')}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Arrival:</strong> {format(new Date(schedule.arrivalTime), 'MMM dd, yyyy HH:mm')}
          </div>
          <div>
            <strong>Available Seats:</strong> {schedule.availableSeats}
          </div>
        </div>

        <Elements stripe={stripePromise}>
          <BookingForm schedule={schedule} />
        </Elements>
      </div>
    </div>
  );
};

export default Booking;

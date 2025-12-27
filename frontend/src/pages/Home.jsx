import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#007bff' }}>
          Welcome to VFS Bus System
        </h1>
        <p style={{ fontSize: '20px', marginBottom: '40px', color: '#666' }}>
          Your reliable partner for comfortable bus travel
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/search" className="btn btn-primary" style={{ fontSize: '18px', padding: '15px 30px' }}>
            Search Schedules
          </Link>
          
          {!isAuthenticated && (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ fontSize: '18px', padding: '15px 30px' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-secondary" style={{ fontSize: '18px', padding: '15px 30px' }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-3" style={{ marginTop: '40px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '15px', color: '#007bff' }}>Easy Booking</h3>
          <p>Search and book your bus tickets in just a few clicks</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '15px', color: '#007bff' }}>Secure Payment</h3>
          <p>Pay safely with Stripe payment integration</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '15px', color: '#007bff' }}>Real-time Updates</h3>
          <p>Get instant updates on your bookings and schedules</p>
        </div>
      </div>
    </div>
  );
};

export default Home;

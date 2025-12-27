import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <div className="container">
        <Link to="/" className="logo">VFS Bus System</Link>
        <ul>
          {isAuthenticated ? (
            <>
              <li><Link to="/search">Search</Link></li>
              <li><Link to="/bookings">My Bookings</Link></li>
              {isAdmin && (
                <>
                  <li><Link to="/admin/routes">Routes</Link></li>
                  <li><Link to="/admin/schedules">Schedules</Link></li>
                </>
              )}
              <li><Link to="/profile">Profile</Link></li>
              <li>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/search">Search</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

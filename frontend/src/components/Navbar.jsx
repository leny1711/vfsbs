import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            🚌 VFS Bus
          </Link>

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          <div className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="navbar-links">
              <Link to="/" className="nav-link" onClick={closeMobileMenu}>
                Home
              </Link>
              <Link to="/search" className="nav-link" onClick={closeMobileMenu}>
                Search
              </Link>
              
              {user ? (
                <>
                  <Link to="/my-bookings" className="nav-link" onClick={closeMobileMenu}>
                    My Bookings
                  </Link>
                  <Link to="/profile" className="nav-link" onClick={closeMobileMenu}>
                    Profile
                  </Link>
                  {isAdmin && (
                    <>
                      <Link to="/admin/routes" className="nav-link admin-link" onClick={closeMobileMenu}>
                        Routes
                      </Link>
                      <Link to="/admin/schedules" className="nav-link admin-link" onClick={closeMobileMenu}>
                        Schedules
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link" onClick={closeMobileMenu}>
                    Login
                  </Link>
                  <Link to="/register" className="nav-link" onClick={closeMobileMenu}>
                    Register
                  </Link>
                </>
              )}
            </div>

            {user && (
              <div className="navbar-actions">
                <div className="user-info">
                  <span className="user-name">{user.firstName}</span>
                  {isAdmin && <span className="admin-badge">Admin</span>}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

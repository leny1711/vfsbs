import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { Button, Card, Input, Loading, Alert } from '../components/ui';
import './Profile.css';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      const userData = response.data.user || response.data;
      setProfile(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || ''
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUpdating(true);

    try {
      await userAPI.updateProfile(formData);
      setSuccessMessage('Profile updated successfully! ✨');
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loading text="Loading profile..." />;
  }

  return (
    <div className="profile-container">
      <div className="container container-sm">
        <div className="page-header">
          <h1>My Profile 👤</h1>
          <p>Manage your account information</p>
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

        <Card>
          <div className="profile-info-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {formData.firstName?.[0]}{formData.lastName?.[0]}
              </div>
            </div>
            <div className="profile-summary">
              <h2>{formData.firstName} {formData.lastName}</h2>
              <p className="user-role">{profile?.role || 'Customer'}</p>
              <p className="user-email">{formData.email}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3>Edit Profile</h3>
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <Input
                label="First Name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
              />
              <Input
                label="Last Name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1234567890"
              required
            />

            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

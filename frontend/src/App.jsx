import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute, AdminRoute } from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import AdminRoutes from './pages/admin/AdminRoutes';
import AdminSchedules from './pages/admin/AdminSchedules';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          
          <Route path="/booking/:scheduleId" element={
            <PrivateRoute>
              <Booking />
            </PrivateRoute>
          } />
          
          <Route path="/bookings" element={
            <PrivateRoute>
              <MyBookings />
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/admin/routes" element={
            <AdminRoute>
              <AdminRoutes />
            </AdminRoute>
          } />
          
          <Route path="/admin/schedules" element={
            <AdminRoute>
              <AdminSchedules />
            </AdminRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

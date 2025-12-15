import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'driver' && user.mustChangePassword && pathname !== '/driver/change-password') {
    return <Navigate to="/driver/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render nested routes here
  return <Outlet />;
};

export default ProtectedRoute;
